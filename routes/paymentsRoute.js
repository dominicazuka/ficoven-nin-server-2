const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");
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

module.exports = router;
