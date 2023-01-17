const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Role = require("../models/Role.model");
const { secret } = require("../config");

const { validationResult } = require("express-validator");

//function for access jwt token generation 
const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class AuthController {
  // registrate new users
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Incorrect password or username", errors });
      }
      const { username, password } = req.body;
      const candidate = await User.findOne({ username });
      if (candidate) {
        return res.status(400).json({ message: "User is exist" });
      }
      const hashPass = bcrypt.hashSync(password, 6);
      const userRole = await Role.findOne({ value: "boss" });
      const user = new User({
        username,
        password: hashPass,
        roles: [userRole.value],
      });
      await user.save();
      return res.json({ message: "User succsesfully registrate" });
    } catch (error) {
      res.status(400).json({ message: "Registration error" });
    }
  }
  //login users with 'user' role by default
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: `User ${username} doesn't exist.` });
      }
      const validPass = bcrypt.compareSync(password, user.password);
      if (!validPass) {
        return res.status(400).json({ message: `Not valid password` });
      }
      const token = generateAccessToken(user._id, user.roles);
      return res.json({ token });
    } catch (error) {
      res.status(400).json({ message: "Login error" });
    }
  }

  //getting users depending on the role
  async getUsers(req, res) {
    try {
      const userToken = req.headers.authorization.split(" ")[1];
      const { id } = jwt.verify(userToken, secret);
      const user = await User.findById(id);
      const users = [];
      if (user.roles[0] === "admin") {
        return res.json(await User.find());
      }
      if (user.roles[0] === "boss") {
        users.push(user);
        users.push(await User.findById(user.subordinates).exec());
        return res.json(users);
      }
      if (user.roles[0] === "user") {
        return res.json(user);
      } else {
        return res.json({});
      }
    } catch (error) {
      res.status(400).json({ message: "Getting users error" });
    }
  }

  //adding boss subordinates by boss
  async addSub(req, res) {
    try {
      const { username } = req.body;
      const user = await User.findOne({ username });
      const bossToken = req.headers.authorization.split(" ")[1];
      const { id } = jwt.verify(bossToken, secret);
      const boss = await User.findById(id);
      if (boss.subordinates.filter((id) => id === user._id)) {
        return res
          .status(400)
          .json({ message: `User has already been added.` });
      }
      boss.subordinates.push(user._id);
      await boss.save();
      res.json(boss);
    } catch (error) {
      res.status(400).json({ message: "Adding subordinate error" });
    }
  }

}

module.exports = new AuthController();
