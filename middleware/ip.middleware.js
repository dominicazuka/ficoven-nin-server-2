const RequestIp = require("@supercharge/request-ip");

const ipMiddleware = (req, res, next) => {
  const client = RequestIp.getClientIp(req);
  req.ip = client;
  next();
};

module.exports = ipMiddleware;
