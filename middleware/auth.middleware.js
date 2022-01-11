const jwt = require("jsonwebtoken");
const { jwtKeys } = require("../config");

const verifyAuthToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res
      .status(403)
      .send({ message: "Unauthenticated! Please login to continue" });
  }

  jwt.verify(token, jwtKeys.public, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ message: "Unauthorized! Please login to continue" });
    }
    req.user = decoded;
    next();
  });
};

const verifyRefreshToken = (req, res, next) => {
  let token = req.body.refreshToken;
  if (!token) {
    return res
      .status(403)
      .send({ message: "Unauthenticated! Please login to continue" });
  }

  jwt.verify(token, jwtKeys.secret, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .send({ message: "Unauthenticated! Please login to continue" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { verifyAuthToken, verifyRefreshToken };
