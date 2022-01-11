const nodeMailer = require("nodemailer");
const { mailConfig, jwtKeys } = require("../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { host, port, info, noreply } = mailConfig;
const mailNoReplyDispatcher = async (options) => {
  try {
    let transporter = nodeMailer.createTransport({
      host,
      port,
      pool: true,
      maxConnections: 1,
      secure: port === 465 ? true : false,
      auth: {
        user: noreply.user,
        pass: noreply.password,
      },
    });
    let result = await transporter.sendMail({
      from: noreply.user,
      subject: options.subject,
      ...options,
    });
    return {
      error: false,
      result,
    };
  } catch (error) {
    return {
      error: true,
      result: error.message,
    };
  }
};

const mailInfoDispatcher = async (options) => {
  try {
    let transporter = nodeMailer.createTransport({
      host,
      port,
      pool: true,
      maxConnections: 1,
      secure: port === 465 ? true : false,
      auth: {
        user: info.user,
        pass: info.password,
      },
    });
    let result = await transporter.sendMail({
      from: info.user,
      subject: options.subject,
      ...options,
    });
    return {
      error: false,
      result,
    };
  } catch (error) {
    return {
      error: true,
      result: error.message,
    };
  }
};

const uniqueNumber = () => {
  const rand = Math.random().toString();
  const randString = rand.split(".").toString().substring(2, 7);

  return Number(randString);
};

const lowerCase = (str) => {
  str = !str ? "" : str;
  return str.toString().toLowerCase();
};

const generateHash = (str) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(str, salt);
  return hash;
};

const getAuthTokens = async (user) => {
  const { token, ...rest } = user;
  const accessToken = await jwt.sign(rest, jwtKeys.public, {
    expiresIn: "180000",
  });
  const refreshToken = await jwt.sign(
    { userId: rest._id, token },
    jwtKeys.secret,
    { expiresIn: "86400000" }
  );
  return { accessToken, refreshToken };
};

module.exports = {
  mailNoReplyDispatcher,
  mailInfoDispatcher,
  uniqueNumber,
  lowerCase,
  getAuthTokens,
  generateHash,
};
