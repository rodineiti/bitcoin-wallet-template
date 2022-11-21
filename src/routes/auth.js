const express = require("express");
const bcrypt = require("bcryptjs");
const mailer = require("nodemailer");
const { connect } = require("../db");

const transporter = mailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECURE,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  },
  tls: {
    rejectUnauthorized: true
  }
});

const router = express.Router();

router.post("/login", async (request, response) => {
  const { email, password } = request.body;
  let session = request.session;

  if (email != "" && password != "") {
    try {
      const connection = await connect();

      const row = await connection.get(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email]
      );

      if (row) {
        if (!bcrypt.compareSync(password, row.password)) {
          session.message = "Could not find a user with these credentials";
          response.redirect("/");
          return;
        }

        session.userid = row.id;
        session.username = row.name;
        response.redirect("/dashboard");
        return;
      } else {
        session.message = "Could not find a user with these credentials";
      }
    } catch (error) {
      console.log(error);
      session.message = "Error trying to login";
    }
  } else {
    session.message = "Please enter your credentials to enter the system";
  }

  response.redirect("/");
});

router.post("/register", async (request, response) => {
  const { name, email, password } = request.body;
  let session = request.session;

  if (name != "" && email != "" && password != "") {
    try {
      const connection = await connect();

      const row = await connection.get(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email]
      );

      if (!row) {
        let hashPassword = await bcrypt.hash(password, 8);

        await connection.run(
          `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
          [name, email, hashPassword]
        );
        session.message =
          "Congratulations, your registration has been completed, you can login";
      } else {
        session.message =
          "There is already a user with this email, try another one or login";
      }
    } catch (error) {
      console.log(error);
      session.message = "Error when trying to register the user";
    }
  } else {
    session.message = "Please enter your data to register in the system";
  }

  response.redirect("/");
});

router.post("/forgot", async (request, response) => {
  const { email } = request.body;
  let session = request.session;

  if (email != "") {
    try {
      const connection = await connect();

      const row = await connection.get(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email]
      );

      if (row) {
        const token = `${new Date().getTime()}-${new Date().getTime() + 10}`;

        await connection.run(`UPDATE users SET token_forget = ? WHERE id = ?`, [
          token,
          row.id
        ]);

        let link = `http://localhost:9009/reset?token=${token}`;

        const data = {
          from: process.env.MAILER_FROM,
          to: row.email,
          subject: "Password recovery",
          text: `Follow the link to recover your password, please login and follow the instructions: ${link}`
        };

        transporter.sendMail(data, (error, info) => {
          if (error) console.log(error);
          return true;
        });

        session.message = `We have sent you an email with the link to retrieve your password, please login and follow the instructions: ${link}`;
      } else {
        session.message = "We couldn't find a user with this email.";
      }
    } catch (error) {
      console.log(error);
      session.message = "Error trying to recover password";
    }
  } else {
    session.message = "Please enter your email to retrieve your password";
  }

  response.redirect("/forgot");
});

router.post("/reset", async (request, response) => {
  const { email, password, token } = request.body;
  let session = request.session;

  if (email != "" && password != "" && token != "") {
    try {
      const connection = await connect();

      const row = await connection.get(
        `SELECT * FROM users WHERE token_forget = ? LIMIT 1`,
        [token]
      );

      if (row) {
        let hashPassword = await bcrypt.hash(password, 8);

        await connection.run(
          `UPDATE users SET token_forget = null, password = ? WHERE id = ?`,
          [hashPassword, row.id]
        );

        session.message = "Congratulations your password has been updated";
      } else {
        session.message = "Could not find a user with this email and token";
      }
    } catch (error) {
      console.log(error);
      session.message = "Error trying to reset password";
    }
  } else {
    session.message = "Please enter the data to reset your password";
  }

  response.redirect(`/reset?token=${token}`);
});

router.get("/logout", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

module.exports = router;
