const Router = require("express");
const controller = require("../controller/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/roles.middlewares");
const { check } = require("express-validator");

const router = new Router();

router.post(
  "/registrate", // middleware for data validation
  [
    check("username", "Username field can not be empty").notEmpty(),
    check(
      "password",
      "Password must be longer than 4 signs and shorter than 10"
    ).isLength({ max: 10, min: 4 }),
  ],
  controller.registration
);
//route to log in
router.post("/login", controller.login);
//route to get users 
router.get("/users", authMiddleware, controller.getUsers);
//route to add subordinate to boss
router.post("/addSub", roleMiddleware(['boss']), controller.addSub);



module.exports = router;
