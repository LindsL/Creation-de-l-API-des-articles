const UnauthorizedError = require("../errors/unauthorized");
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      throw "not token";
    }
    const decoded = jwt.verify(token, config.secretJwtToken);
    console.log("decoded body: ", decoded);

    req.user = decoded.user;

    next();
  } catch (message) {
    next(new UnauthorizedError(message));
  }
};
