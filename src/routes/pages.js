const { default: axios } = require("axios");
const express = require("express");
const {
  authMiddleware,
  isAuthenticate,
} = require("../middlewares/authMiddleware");
const { connect } = require("../db");
const { formatDate, formatDateBR } = require("../helpers/helpers");

const router = express.Router();

router.get("/", isAuthenticate, (request, response) => {
  const { message } = request.session;

  response.render("index", { layout: false, message });
});

router.get("/register", isAuthenticate, (request, response) => {
  const { message } = request.session;

  response.render("register", { layout: false, message });
});

router.get("/forgot", isAuthenticate, (request, response) => {
  const { message } = request.session;

  response.render("forgot", { layout: false, message });
});

router.get("/reset", isAuthenticate, (request, response) => {
  const { message } = request.session;
  const { token } = request.query;

  if (!token) {
    request.session.message = "Token not found";
    response.redirect("/");
    return;
  }

  response.render("reset", { layout: false, message, token });
});

router.get("/dashboard", authMiddleware, async (request, response) => {
  try {
    const data = await axios.get(
      "https://www.mercadobitcoin.net/api/BTC/ticker/"
    );

    const { ticker } = data.data;

    let bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(ticker?.buy);

    const connection = await connect();

    const [[row]] = await connection.query(
      `SELECT sum(amount) as amount, sum(qty) as qty FROM transactions WHERE user_id  = ?`,
      [request.session.userid]
    );

    const [rows] = await connection.query(
      `SELECT created_at, qty FROM transactions WHERE user_id  = ? ORDER BY created_at ASC`,
      [request.session.userid]
    );

    return response.render("dashboard", {
      transactionSum: row,
      bitcoinBuy,
      transactions: encodeURIComponent(JSON.stringify(rows)),
    });
  } catch (error) {}
});

router.get("/transactions", authMiddleware, async (request, response) => {
  const { message, userid } = request.session;

  try {
    const data = await axios.get(
      "https://www.mercadobitcoin.net/api/BTC/ticker/"
    );

    const { ticker } = data.data;

    let bitcoinBuy = ticker?.buy;

    const connection = await connect();

    const [rows] = await connection.query(
      `SELECT * FROM transactions WHERE user_id  = ? ORDER BY created_at ASC`,
      [userid]
    );

    const transactions = rows.map((item) => ({
      ...item,
      created_at: formatDateBR(item.created_at),
      compare: item.priceBitcoin > bitcoinBuy ? false : true,
    }));

    return response.render("transactions", {
      message,
      bitcoinBuy: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(bitcoinBuy),
      transactions,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/transactions/add", authMiddleware, async (request, response) => {
  const data = await axios.get(
    "https://www.mercadobitcoin.net/api/BTC/ticker/"
  );

  const { ticker } = data.data;

  let bitcoinBuy = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(ticker?.buy);

  response.render("transactions_add", { bitcoinBuy });
});

router.get("/transactions/edit", authMiddleware, async (request, response) => {
  const { id } = request.query;

  try {
    const data = await axios.get(
      "https://www.mercadobitcoin.net/api/BTC/ticker/"
    );

    const { ticker } = data.data;

    let bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(ticker?.buy);

    const connection = await connect();

    const [[row]] = await connection.query(
      `SELECT * FROM transactions WHERE id = ? AND user_id = ?`,
      [id, request.session.userid]
    );

    const newData = {
      ...row,
      created_at: formatDate(row.created_at),
    };

    return response.render("transactions_edit", {
      bitcoinBuy,
      transaction: newData,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/transactions/del", authMiddleware, async (request, response) => {
  let session = request.session;
  const { id } = request.query;

  try {
    const connection = await connect();

    await connection.query(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [id, session.userid]
    );

    session.message = "Transaction deleted";

    return response.redirect("/transactions");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
