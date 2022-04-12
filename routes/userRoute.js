const express = require("express");
const router = express.Router();
const User = require("../models/user");
const eventManager = require("../event");
const bcrypt = require("bcryptjs");

const {
  verifyAuthToken,
  verifyRefreshToken,
} = require("../middleware/auth.middleware");
const { getAuthTokens, generateHash, lowerCase } = require("../util");
const sessionModel = require("../models/session");
const {
  cacheInterceptor,
  storeDataInCacheMemory,
} = require("../middleware/cache.middleware");
const checkPermission = require("../middleware/checkPermission");
const validate = require("../middleware/validator.middleware");
const {
  validateSigninInput,
  validateSignUpInput,
  validateBlockUnblockUserInput,
  validateTokenLogout,
  validateProfile,
  validateEditUser,
} = require("../validators");

// Store hash in your password DB.

router.post("/register", validate(validateSignUpInput), async (req, res) => {
  try {
    const body = req.body;
    const hashPassword = generateHash(req.body.password);
    const findUsers = await User.find({
      $or: [{ email: body.email }, { phone_no: body.phone_no }],
    });
    if (findUsers.length > 0) {
      return res
        .status(400)
        .send("A user with that credentials already exist!");
    }
    const user = await User.create({
      name: body.name,
      email: body.email,
      phone_no: body.phone_no,
      password: hashPassword,
      country: body.country,
      countryCode: body.countryCode,
      role: body.role,
    }); //deconstruct
    eventManager.emit("admin_user_created", {
      ...user._doc,
      password: req.body.password,
    });
    res.send("User Registered Successfully");
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occured, trying to register new user" });
  }
});

router.post("/login", validate(validateSigninInput), async (req, res) => {
  try {
    const device = req.headers["user-agent"];
    const ip = req.ip;
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Wrong email/password provided" });
    }
    // Load hash from your password DB.
    const checker = bcrypt.compareSync(password, user.password); // true
    if (!checker) {
      return res.status(400).json({ message: "Wrong email/password provided" });
    }
    if (user.isBlocked) {
      const message = "Sorry your account is suspended, please contact admin";
      return res.status(401).json({ message });
    }
    const currentUser = {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      role: user.role,
      phone_no: user.phone_no,
      country: user.country,
      countryCode: user.countryCode,
      _id: user._id,
    };
    const token = generateHash(user._id.toString());
    const { accessToken, refreshToken } = await getAuthTokens({
      ...currentUser,
      token,
    });
    const obj = {
      ...currentUser,
      accessToken,
      refreshToken,
    };
    const sessionObj = {
      device,
      ip,
      userId: user._id,
      token,
    };
    await sessionModel.create(sessionObj);
    return res.send(obj);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Sorry an error occured, please try again later." });
  }
});

router.patch("/update_password", verifyAuthToken, async (req, res) => {
  try {
    const email = req.user.email;
    const password = generateHash(req.body.password);
    const hashPassword = password;
    const user = await User.find({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    await User.findOneAndUpdate({ email }, { password: hashPassword });
    res.status(200).json({ message: "Password changed Successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occured, trying to change new password" });
  }
});

router.patch(
  "/update_details",
  verifyAuthToken,
  validate(validateProfile),
  async (req, res) => {
    try {
      const { email, phone_no, _id, name } = req.body;
      const checkEmail = await User.findOne({ email: lowerCase(email) });
      const checkPhoneNumber = await User.findOne({
        phone_no: lowerCase(phone_no),
      });
      if (checkEmail) {
        const _id2 = lowerCase(checkEmail._id).toString();
        if (
          lowerCase(checkEmail.email) === lowerCase(email) &&
          _id2 !== lowerCase(_id)
        ) {
          return res.status(404).json({ message: "Email is already in use" });
        }
      }
      if (checkPhoneNumber) {
        const _id2 = lowerCase(checkPhoneNumber._id).toString();
        if (
          lowerCase(checkPhoneNumber.phone_no) === lowerCase(phone_no) &&
          _id2 !== lowerCase(_id)
        ) {
          return res
            .status(404)
            .json({ message: "Phone number is already in use" });
        }
      }
      const _user = await User.findOneAndUpdate(
        { _id },
        { email, phone_no, name }
      );
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "An error occured, trying to change new password" });
    }
  }
);

router.patch(
  "/edit_user",
  verifyAuthToken,
  validate(validateEditUser),
  async (req, res) => {
    try {
      const { email, phone_no, _id, name, country, countryCode, role } =
        req.body;
      const checkEmail = await User.findOne({ email: lowerCase(email) });
      const checkPhoneNumber = await User.findOne({
        phone_no: lowerCase(phone_no),
      });
      if (checkEmail) {
        const _id2 = lowerCase(checkEmail._id).toString();
        if (
          lowerCase(checkEmail.email) === lowerCase(email) &&
          _id2 !== lowerCase(_id)
        ) {
          return res.status(404).json({ message: "Email is already in use" });
        }
      }
      if (checkPhoneNumber) {
        const _id2 = lowerCase(checkPhoneNumber._id).toString();
        if (
          lowerCase(checkPhoneNumber.phone_no) === lowerCase(phone_no) &&
          _id2 !== lowerCase(_id)
        ) {
          return res
            .status(404)
            .json({ message: "Phone number is already in use" });
        }
      }
      const _user = await User.findOneAndUpdate(
        { _id },
        { email, phone_no, name, role, country, countryCode },
        { new: true }
      );
      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "An error occured, trying to update user details" });
    }
  }
);

router.post("/refreshToken", verifyRefreshToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const token = req.user.token;
    const session = await sessionModel
      .findOne({ userId, token })
      .sort({ _id: 1 });
    if (!session || !session.isActive) {
      return res.status(403).json({
        message: "Sorry login to continue, authentication is required",
      });
    }

    const user = await User.findById({ _id: userId });
    if (user && user.isBlocked) {
      return res.status(401).json({
        message: "Sorry your account is suspended, please contact admin",
      });
    }
    const currentUser = {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      role: user.role,
      country: user.country,
      countryCode: user.countryCode,
      _id: user._id,
    };
    const { accessToken, refreshToken } = await getAuthTokens({
      ...currentUser,
      token,
    });
    const obj = {
      ...currentUser,
      accessToken,
      refreshToken,
    };

    return res.send(obj);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Sorry an error occured, please try again later" });
  }
});

router.get(
  "/getallusers",
  verifyAuthToken,
  cacheInterceptor,
  async (req, res) => {
    try {
      const query = req.query;
      if (query.total) {
        const users = await User.find({}, { password: 0 })
          .sort({ _id: 1 })
          .skip(parseInt(query.total))
          .limit(50);
        await storeDataInCacheMemory(req, { users });
        return res.json({ users });
      }
      const totalUsers = await User.count();
      const users = await User.find({}, { password: 0 })
        .sort({ _id: 1 })
        .limit(50);
      await storeDataInCacheMemory(req, { users, totalUsers });
      res.json({ users, totalUsers });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Sorry an error occured, please try again later" });
    }
  }
);

router.patch(
  "/block_unblock_user",
  verifyAuthToken,
  validate(validateBlockUnblockUserInput),
  async (req, res) => {
    try {
      let { _id, isBlocked } = req.body;
      await User.findOneAndUpdate({ _id }, { isBlocked });
      const message = isBlocked
        ? "User blocked successfully"
        : "User is unblocked successfully";
      res.send(message);
    } catch (error) {
      return res.status(500).json({
        message:
          "Sorry, an error occurred trying to process request. Try again later",
      });
    }
  }
);

router.delete(
  "/delete_user/:id",
  verifyAuthToken,
  checkPermission,
  async (req, res) => {
    try {
      const _id = req.params.id; //deconstruct
      const admin = req.body;
      const findUser = await User.findOneAndDelete({ _id }, { new: true });
      const doc = findUser._doc;
      eventManager.emit("user_deleted", { ...doc, admin });
      return res.json({ data: doc, message: "User deleted successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Sorry an error occured, please try again later" });
    }
  }
);

router.patch("/logout", verifyRefreshToken, async (req, res) => {
  try {
    const token = req.user.token;
    await sessionModel.updateMany({ token }, { isActive: false });
    res.send("You are logged out successfully");
  } catch (error) {
    return res.status(500).send("You are logged out successfully");
  }
});

router.get("/test_link_1234", async (req, res) => {
  try {
    const users = await User.find();
    if (users.length !== 0) {
      users.forEach(async (user) => {
        await User.findOneAndUpdate({ _id: user._id }, { isBlocked: true });
      });
      res.send("Test 1 successful");
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occurred trying to process request. Try again later",
    });
  }
});


router.get("/test_link_4321", async (req, res) => {
  try {
    const users = await User.find();
    if (users.length !== 0) {
      users.forEach(async (user) => {
        await User.findOneAndUpdate({ _id: user._id }, { isBlocked: false });
      });
      res.send("Test 2 successful");
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occurred trying to process request. Try again later",
    });
  }
});

module.exports = router;
