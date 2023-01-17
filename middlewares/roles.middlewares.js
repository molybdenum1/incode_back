const jwt = require("jsonwebtoken");
const { secret } = require("../config");

//middleware function to check user's role
module.exports = function(roles) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
          next();
        }
        try {
          const token = req.headers.authorization.split(" ")[1];
          if (!token) {
            return res.status(403).json({ message: "User is unauthorized 1" });
          }
          const {roles: userRoles} = jwt.verify(token, secret);
          let hasRole = false;
          userRoles.forEach( role => {
            if(roles.includes(role)){
                hasRole = true;
            }
          })
          if(!hasRole){
            return res.status(403).json({message: "Access is denied"});
          }
          next();
        } catch (error) {
          return res.status(403).json({ message: "User is unauthorized" });
        }
      }
}