const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Service = require("../models/services");
const mongoose = require("mongoose");
const moment = require("moment");
const { $where } = require("../models/booking");
const eventManager = require("../event");
const { uniqueNumber, lowerCase } = require("../util");
const { verifyAuthToken } = require("../middleware/auth.middleware");
const {
  cacheInterceptor,
  storeDataInCacheMemory,
} = require("../middleware/cache.middleware");
const validate = require("../middleware/validator.middleware");
const {
  validateUpdateBooking,
  validateBookingByUserId,
  validateCancelBooking,
  validateBookingByEmail,
} = require("../validators");
const verifyAccess = require("../middleware/verifyAccess.middleware");

router.post("/bookservice", async (req, res) => {
  try {
    const userId = uniqueNumber();
    const { booking, payment } = req.body; //deconstruct
    const _body = { ...booking, user: { ...booking.user, userId } };
    const result = await Booking.create(_body);
    await Payment.create({
      payment: {
        ...payment,
        payer: { ...payment.payer, userId: result.user.userId },
      },
      doc_id: result._id,
      payment_type: "PayPal"
    });
    eventManager.emit("new_booking", _body);

    return res.send("Service booked successfully");
  } catch (error) {
    return res
      .status(500)
      .json({message:"Sorry an error occured, please try again later"});
  }
});

router.patch(
  "/updatebooking",
  verifyAuthToken, verifyAccess,
  validate(validateUpdateBooking),
  async (req, res) => {
    try {
      const body = req.body; //deconstruct
      const { organization, date, time, userCenter, _id, status, ...rest } =
        body;
      // const newbooking = new Booking(_body);
      const findBooking = await Booking.findOneAndUpdate(
        { _id },
        { organization, date, time, userCenter, status },
        { new: true }
      );
      const doc = findBooking._doc;
      eventManager.emit("booking_updated", { ...doc, ...rest });
      return res.json({ data: doc, message: "Booking updated successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({message: "Sorry an error occured, please try again later"});
    }
  }
);

router.delete("/deletebooking/:id", verifyAuthToken, verifyAccess, async (req, res) => {
  try {
    const _id = req.params.id; //deconstruct
    const admin = req.body;
    const findBooking = await Booking.findOneAndDelete({ _id }, { new: true });

    const doc = findBooking._doc;
    eventManager.emit("booking_deleted", { ...doc, admin });
    return res.json({ data: doc, message: "Booking deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Sorry an error occured, please try again later"});
  }
});

router.post(
  "/getbookingsbyuserid",
  validate(validateBookingByUserId),
  async (req, res) => {
    const userid = req.body.userid;
    try {
      const bookings = await Booking.find({ userid: userid });
      res.send(bookings);
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later" });
    }
  }
);

router.get(
  "/get_booking_by_email/:email",
  validate(validateBookingByEmail),
  async (req, res) => {
    const email = req.params.email;
    try {
      const booking = await Booking.findOne({ "user.email": email });
      if(!booking){
        return res.status(404).json({ message: "Not found!" })
      } 
      res.send(booking);
    } catch (error) {
      return res.status(400).json({ message: "Sorry, an error occurred" });
    }
  }
);

router.get("/checkBookingNumber", cacheInterceptor, async (req, res) => {
  try {
    const { country, state, city, userCenter } = req.query;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const total = await Booking.find({
      country,
      state,
      city,
      userCenter,
      createdAt: { $gte: today },
    }).count();
    await storeDataInCacheMemory(req, { total });
    res.json({ total });
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later"});
  }
});

router.post(
  "/cancelbooking",
  validate(validateCancelBooking),
  async (req, res) => {
    const { bookingid, serviceid } = req.body;
    try {
      const bookingitem = await Booking.findOne({ _id: bookingid });
      bookingitem.status = "cancelled";
      await bookingitem.save();
      const service = await Service.findOne({ _id: serviceid });
      const bookings = service.currentbookings;
      const temp = bookings.filter(
        (booking) => booking.bookingid.toString() !== bookingid
      );
      service.currentbookings = temp;
      await service.save();
      res.send("Your booking is cancelled successfully");
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/getallbookings",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const query = req.query;
      if (query.total) {
        const bookings = await Booking.find()
          .sort({ _id: 1 })
          .skip(parseInt(query.total))
          .limit(50);
        await storeDataInCacheMemory(req, { bookings });
        return res.json({ bookings });
      }
      const totalBookings = await Booking.count();
      const bookings = await Booking.find().sort({ _id: 1 }).limit(50);
      const data = { bookings, totalBookings };
      await storeDataInCacheMemory(req, data);
      res.json(data);
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/get_all_export_bookings",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const bookings = await Booking.find().sort({ _id: 1 });
      const arrangedData = bookings.map((b) => {
        return {
          "User Id": b.user.userId,
          "Full Name": b.user.firstName + " " + b.user.lastName,
          "Phone Number": b.user.phoneNumber.toString(),
          Address:
            b.user.streetAddress +
            ", " +
            b.user.city +
            ", " +
            b.user.state +
            ", " +
            b.user.country,
          "Service Name": b.service,
          "Service Categroy": b.category,
          "Enrolment Center": b.userCenter,
          "Appointment Date": b.date,
          "Appointment Time": b.time,
          "Agent Number": b.agentNumber,
          "Service Charge": b.totalAmount,
          Organization: b.organization,
        };
      });
      const data = { bookings: arrangedData };
      await storeDataInCacheMemory(req, data);
      res.json(data);
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/get_all_bookings_by_country",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const query = req.query;
      const country = query.country;
      if (query.total) {
        const bookings = await Booking.find({ country })
          .sort({ _id: 1 })
          .skip(parseInt(query.total))
          .limit(50);
        await storeDataInCacheMemory(req, { bookings });
        return res.json({ bookings });
      }
      const totalBookings = await Booking.count({ country });
      const bookings = await Booking.find({ country })
        .sort({ _id: 1 })
        .limit(50);
      await storeDataInCacheMemory(req, { bookings, totalBookings });

      res.json({ bookings, totalBookings });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/get_bookings_distinct_stats",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const _countries = await Booking.find().distinct("country");
      const _centers = await Booking.find().distinct("userCenter");
      await storeDataInCacheMemory(req, { _countries, _centers });
      res.json({ _countries, _centers });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/get_bookings_distinct_stats/:country",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      //checks for query
      const country = req.params.country;
      const centers = await Booking.find().distinct("userCenter", { country });
      await storeDataInCacheMemory(req, { centers });
      return res.send({ centers });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

router.get(
  "/get_bookings_by_filter",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const { country, center, category, status, fromDate, toDate, total } =
        req.query;
      const query = {};

      if (lowerCase(country) != "all") {
        query.country = country;
      }

      if (lowerCase(category) != "all") {
        query.category = category;
      }

      if (lowerCase(center) != "all") {
        query.userCenter = center;
      }

      if (lowerCase(status) != "all") {
        query.status = status;
      }
      if (fromDate != toDate) {
        query.createdAt = {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        };
      }
      if (total) {
        const data = await Booking.find(query)
          .sort({ _id: 1 })
          .skip(parseInt(total))
          .limit(50);
        await storeDataInCacheMemory(req, { data });
        return res.json({ data });
      }
      const data = await Booking.find(query).sort({ _id: 1 }).limit(50);
      const count = await Booking.find(query).count();
      await storeDataInCacheMemory(req, { data, count });
      return res.json({ data, count });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later"});
    }
  }
);

module.exports = router;
