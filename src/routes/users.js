const express = require("express");
const bcrypt = require("bcryptjs");
const { connect } = require("../db");

const router = express.Router();

router.post("/store", async (request, response) => {
  const { name, email, password } = request.body;
  let session = request.session;

  if (name != "" && email != "" && password != "") {
    try {
      const connection = await connect();

      const [row] = await connection.query(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email]
      );

      if (!row.length) {
        let hashPassword = await bcrypt.hash(password, 8);

        await connection.query(
          `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
          [name, email, hashPassword]
        );
        session.message = "Congratulations, created with successfully";
      } else {
        session.message = "There is already a user with this email";
      }
    } catch (error) {
      console.error(error);
      session.message = "Error when trying to register the user";
    }
  } else {
    session.message = "Please enter your data to register in the system";
  }

  response.redirect("/users");
});

router.post("/update", async (request, response) => {
  const { name, email, password, id } = request.body;
  let session = request.session;

  if (id != "" && name != "" && email != "" && password != "") {
    try {
      const connection = await connect();

      const [[row]] = await connection.query(
        `SELECT * FROM users WHERE id = ? LIMIT 1`,
        [id]
      );

      if (row) {
        let hashPassword = await bcrypt.hash(password, 8);

        await connection.query(
          `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`,
          [name, email, hashPassword, row.id]
        );

        session.message = "Congratulations, updated with successfully";
      } else {
        session.message = "User not found";
      }
    } catch (error) {
      console.error(error);
      session.message = "Error when trying saving user";
    }
  } else {
    session.message = "Please enter value to your user";
  }

  response.redirect("/users");
});

module.exports = router;
