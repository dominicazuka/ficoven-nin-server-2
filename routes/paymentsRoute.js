const express = require("express");
const axios = require("axios");
const router = express.Router();
const Payment = require("../models/payment");
const Booking = require("../models/booking");
const eventManager = require("../event");
const { uniqueNumber, lowerCase } = require("../util");
const { verifyAuthToken } = require("../middleware/auth.middleware");
const {
  cacheInterceptor,
  storeDataInCacheMemory,
} = require("../middleware/cache.middleware");

router.get(
  "/get_all_payments",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      if (req.query.total) {
        const payments = await Payment.find()
          .sort({ _id: 1 })
          .skip(parseInt(req.query.total))
          .limit(50);
        await storeDataInCacheMemory(req, { payments });
       return res.json({ payments });
      }
      const totalPayments = await Payment.count();
      const payments = await Payment.find().sort({ _id: 1 }).limit(50);
      await storeDataInCacheMemory(req, { payments, totalPayments });
      res.json({ payments, totalPayments });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later" });
    }
  }
);

router.get(
  "/get_all_payments_by_country/:code",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const code = req.params.code;
      
      const totalPayments = await Payment.count({
        "payment.payer.address.country_code": code,
      });
      const payments = await Payment.find({
        "payment.payer.address.country_code": code,
      })
        .sort({ _id: 1 })
        .limit(50);
      await storeDataInCacheMemory(req, { payments, totalPayments });
      res.json({ payments, totalPayments });
    } catch (error) {
      
      return res.status(400).json({ message: "Sorry an error occured" });
    }
  }
);

router.get(
  "/get_all_payments_by_country",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const { code, total } = req.query;
      
      const payments = await Payment.find({
        "payment.payer.address.country_code": code,
      })
        .sort({ _id: 1 })
        .skip(parseInt(total))
        .limit(50);
      await storeDataInCacheMemory(req, { payments });
      res.json({ payments });
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later" });
    }
  }
);


router.post(
  "/verify-voguepay", 
  async (req, res) => {
    try {
      console.log(req.body);
      const payload = req.body;
      const {booking, payment} = payload;
      const {data} = await axios.get(`https://pay.voguepay.com/?v_transaction_id=${payment.transaction_id}&v_merchant_id=${payment.v_merchant_id}&type=json`);
      console.log(booking);
      const userId = uniqueNumber();
      const _body = { ...booking, user: { ...booking.user, userId } };
      const result = await Booking.create(_body);
      const obj = {
        id: data.transaction_id, 
        created_at: result.createdAt,
        updated_at: result.updatedAt,
        payer: {
          address: {
            country_code: booking.countryCode,
          },
          email: booking.user.email,
          first_name: booking.user.firstName,
          surname: booking.user.lastName,
          payer_id: result._id,
          userId
        },
        payee: {
          email: "Nil",
          merchant_id: data.merchant_id
        },
        payment: {
          amount: data.total_paid_by_buyer,
          currency: data.cur
        },
        status: data.status,
      };
    await Payment.create({
      payment: obj,
      doc_id: result._id,
      payment_type: "VoguePay"
    });
    eventManager.emit("new_booking", obj);
    return res.send("Service booked successfully");
    } catch (error) {
      return res.status(400).json({ message: "Sorry an error occured, please try again later" });
    }
  }
);

module.exports = router;
