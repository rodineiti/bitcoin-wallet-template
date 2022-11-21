const express = require("express");
const {
  authMiddleware,
  isAuthenticate
} = require("../middlewares/authMiddleware");
const { connect } = require("../db");
const {
  formatDate,
  formatDateBR,
  calculateBitcoin
} = require("../helpers/helpers");
const { getBuy } = require("../helpers/bitcoin");

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
    let bitcoinBuy = await getBuy();

    const connection = await connect();

    const row = await connection.get(
      `SELECT sum(amount) as amount, sum(qty) as qty FROM transactions WHERE user_id  = ? LIMIT 1`,
      [request.session.userid]
    );

    const rows = await connection.all(
      `SELECT created_at, qty, amount FROM transactions WHERE user_id  = ? ORDER BY created_at ASC`,
      [request.session.userid]
    );

    const transactionsCompare = rows.map(item => {
      return {
        ...item,
        qty: calculateBitcoin(item.amount, bitcoinBuy)
      };
    });

    return response.render("dashboard", {
      transactionSum: {
        ...row,
        qty: row?.qty || 0,
        amount: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(row.amount)
      },
      bitcoinBuy: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(bitcoinBuy),
      transactions: encodeURIComponent(JSON.stringify(rows)),
      transactionsCompare: encodeURIComponent(
        JSON.stringify(transactionsCompare)
      )
    });
  } catch (error) {}
});

router.get("/transactions", authMiddleware, async (request, response) => {
  const { message, userid } = request.session;

  try {
    let bitcoinBuy = await getBuy();

    const connection = await connect();

    const rows = await connection.all(
      `SELECT * FROM transactions WHERE user_id  = ? ORDER BY created_at ASC`,
      [userid]
    );

    const transactions = rows.map(item => ({
      ...item,
      created_at: formatDateBR(item.created_at),
      compare: item.priceBitcoin > bitcoinBuy ? false : true
    }));

    return response.render("transactions", {
      message,
      bitcoinBuy: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(bitcoinBuy),
      transactions
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/transactions/add", authMiddleware, async (request, response) => {
  let bitcoinBuy = await getBuy();

  bitcoinBuy = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(bitcoinBuy);

  response.render("transactions_add", { bitcoinBuy });
});

router.get("/transactions/edit", authMiddleware, async (request, response) => {
  const { id } = request.query;

  try {
    let bitcoinBuy = await getBuy();

    bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(bitcoinBuy);

    const connection = await connect();

    const row = await connection.get(
      `SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, request.session.userid]
    );

    const newData = {
      ...row,
      created_at: formatDate(row.created_at)
    };

    return response.render("transactions_edit", {
      bitcoinBuy,
      transaction: newData
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/transactions/del", authMiddleware, async (request, response) => {
  let session = request.session;
  const { id } = request.query;

  try {
    const connection = await connect();

    await connection.run(
      `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
      [id, session.userid]
    );

    session.message = "Transaction deleted";

    return response.redirect("/transactions");
  } catch (error) {
    console.error(error);
  }
});

router.get("/users", authMiddleware, async (request, response) => {
  const { message } = request.session;

  try {
    let bitcoinBuy = await getBuy();

    bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(bitcoinBuy);

    const connection = await connect();

    const rows = await connection.all(
      `SELECT * FROM users ORDER BY created_at ASC`
    );

    const users = rows.map(item => ({
      ...item,
      created_at: formatDateBR(item.created_at)
    }));

    return response.render("users", {
      message,
      users,
      bitcoinBuy
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/users/add", authMiddleware, async (request, response) => {
  try {
    let bitcoinBuy = await getBuy();

    bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(bitcoinBuy);

    response.render("users_add", {
      bitcoinBuy
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/users/edit", authMiddleware, async (request, response) => {
  const { id } = request.query;

  try {
    let bitcoinBuy = await getBuy();

    bitcoinBuy = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(bitcoinBuy);

    const connection = await connect();

    const row = await connection.get(
      `SELECT * FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    const newData = {
      ...row,
      created_at: formatDate(row.created_at)
    };

    return response.render("users_edit", {
      user: newData,
      bitcoinBuy
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/users/del", authMiddleware, async (request, response) => {
  let session = request.session;
  const { id } = request.query;

  try {
    const connection = await connect();

    await connection.run(`DELETE FROM users WHERE id = ?`, [id]);

    session.message = "User deleted";

    return response.redirect("/users");
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
