const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connect } = require("../db");

const router = express.Router();

router.post("/login", async (request, response) => {
  const { email, password } = request.body;
  let message;

  if (email != "" && password != "") {
    try {
      const connection = await connect();

      const [[row]] = await connection.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );

      if (row) {
        if (!bcrypt.compareSync(password, row.password)) {
          message = "Could not find a user with these credentials";
          return response.json({ error: true, message });
        }

        const token = jwt.sign(
          { userid: row.id, email: row.email },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        return response.json({ error: false, token });
      } else {
        message = "Could not find a user with these credentials";
      }
    } catch (error) {
      console.log(error);
      message = "Error trying to login";
    }
  } else {
    message = "Please enter your credentials to enter the system";
  }

  return response.json({ error: true, message });
});

module.exports = router;
