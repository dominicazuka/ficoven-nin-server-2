const express = require("express");
const router = express.Router();
const Center = require("../models/center");
const eventManager = require("../event");
const { verifyAuthToken } = require("../middleware/auth.middleware");
const { cacheInterceptor, storeDataInCacheMemory } = require("../middleware/cache.middleware");
const validate = require("../middleware/validator.middleware");
const { validateUpdateCenter } = require("../validators");
const verifyAccess = require("../middleware/verifyAccess.middleware");

router.post("/createcenter", verifyAuthToken, async (req, res) => {
  try {
    const body = req.body;
    const center = await Center.create(body);
    res.send(center);
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later" });
  }
});

router.patch("/updatecenter", verifyAuthToken, verifyAccess, validate(validateUpdateCenter), async (req, res) => {
  try {
    const body = req.body;
    const { address, email, location, phone, _id, name, ...rest } = body;
    const findCenter = await Center.findOneAndUpdate(
      { _id },
      { address, email, location, phone, name },
      { new: true }
    );
    const doc = findCenter._doc;
    eventManager.emit("center_updated", { ...doc, ...rest });
    return res.json({ data: doc, message: "Booking updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Sorry an error occured, please try again later"});
  }
});

router.delete("/deletecenter/:id", verifyAuthToken, verifyAccess, async (req, res) => {
  try {
    const _id = req.params.id; //deconstruct
    const admin = req.body;
    const findCenter = await Center.findOneAndDelete({ _id }, { new: true });
    const doc = findCenter._doc;
    eventManager.emit("center_deleted", { ...doc, admin });
    return res.json({ data: doc, message: "Center deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({message: "Sorry an error occured, please try again later"});
  }
});

router.get("/getallcenters", cacheInterceptor, async (req, res) => {
  try {
    const query = req.query;
    if (query.order) {
      const centers = await Center.find().sort({ _id: 1 });
      await storeDataInCacheMemory(req, { centers });
      return res.json({ centers });
    }
    if (query.total) {
      const centers = await Center.find()
        .sort({ _id: 1 })
        .skip(parseInt(query.total))
        .limit(50);
      await storeDataInCacheMemory(req, { centers });
      return res.json({ centers });
    }
    const totalCenters = await Center.count();
    const centers = await Center.find().sort({ _id: 1 }).limit(50);
    await storeDataInCacheMemory(req, { centers, totalCenters });
    res.json({ centers, totalCenters });
  } catch (error) {
    return res.status(400).json({ message: "Sorry an error occured, please try again later" });
  }
});

module.exports = router;
