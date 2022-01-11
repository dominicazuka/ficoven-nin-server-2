const express = require("express");

const router = express.Router();

const Services = require("../models/services");

const Staff = require("../models/staff");
const eventManager = require("../event");
const { verifyAuthToken } = require("../middleware/auth.middleware");
const { cacheInterceptor, storeDataInCacheMemory } = require("../middleware/cache.middleware");
const validate = require("../middleware/validator.middleware");
const { validateServiceId, validateUpdateService } = require("../validators");
const verifyAccess = require("../middleware/verifyAccess.middleware");

router.get("/getallservices", cacheInterceptor, async (req, res) => {
  try {
    const query = req.query;
    if (query.total) {
      const services = await Services.find()
        .sort({ _id: 1 })
        .skip(parseInt(query.total))
        .limit(50);
      await storeDataInCacheMemory(req, { services });
      return res.json({ services });
    }
    const totalServices = await Services.count();
    const services = await Services.find().sort({ _id: 1 }).limit(50);
    const staff = await Staff.find({});
    await storeDataInCacheMemory(req, { services, staff, totalServices });
    res.json({ services, staff, totalServices });
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later" });
  }
});

router.post("/getservicebyid", validate(validateServiceId), async (req, res) => {
  const serviceid = req.body.serviceid;
  try {
    const service = await Services.findOne({ _id: serviceid });
    res.send(service);
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later" });
  }
});

router.post("/createservice", verifyAuthToken, async (req, res) => {
  try {
    const body = req.body;
    const service = await Services.create(body);
    res.send(service);
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later" });
  }
});

router.patch("/update_service", verifyAuthToken, verifyAccess, validate(validateUpdateService), async (req, res) => {
  try {
    const body = req.body; //deconstruct
    const { name, amount, category, description, chargeAmount, _id, ...rest } =
      body;
    // const newbooking = new Booking(_body);
    const findService = await Services.findOneAndUpdate(
      { _id },
      { name, amount, category, description, chargeAmount },
      { new: true }
    );
    const doc = findService._doc;
    eventManager.emit("service_updated", { ...doc, ...rest });
    return res.json({ data: doc, message: "Service updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({message:"Sorry an error occured, please try again later"});
  }
});

router.delete("/delete_service/:id", verifyAuthToken, verifyAccess, async (req, res) => {
  try {
    const _id = req.params.id; //deconstruct
    const admin = req.body;
    const findService = await Services.findOneAndDelete({ _id }, { new: true });
    const doc = findService._doc;
    eventManager.emit("service_deleted", { ...doc, admin });
    return res.json({ data: doc, message: "Service deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Sorry an error occured, please try again later"});
  }
});

module.exports = router;
