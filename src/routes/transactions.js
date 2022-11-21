const express = require("express");
const { connect } = require("../db");
const { calculateBitcoin } = require("../helpers/helpers");
const { getAvgPrice } = require("../helpers/bitcoin");

const router = express.Router();

router.post("/store", async (request, response) => {
  const { amount, created_at, priceBitcoin } = request.body;
  let session = request.session;

  if (amount != "" && created_at != "" && priceBitcoin != "") {
    try {
      const connection = await connect();

      const qty = calculateBitcoin(amount, priceBitcoin);

      await connection.run(
        `INSERT INTO transactions (amount, qty, priceBitcoin, created_at, user_id) VALUES (?, ?, ?, ?, ?)`,
        [
          parseFloat(amount),
          qty,
          parseFloat(priceBitcoin),
          created_at,
          session.userid
        ]
      );

      session.message = "Congratulations, your transaction has been success";
    } catch (error) {
      console.error(error);
      session.message = "Error when trying saving transaction";
    }
  } else {
    session.message = "Please enter value to your transaction";
  }

  response.redirect("/transactions");
});

router.post("/update", async (request, response) => {
  const { amount, priceBitcoin, id } = request.body;
  let session = request.session;

  if (amount != "" && id != "" && priceBitcoin != "") {
    try {
      const connection = await connect();

      const row = await connection.get(
        `SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1`,
        [id, session.userid]
      );

      if (row) {
        const qty = calculateBitcoin(amount, priceBitcoin);

        await connection.run(
          `UPDATE transactions SET amount = ?, qty = ?, priceBitcoin = ? WHERE id = ? AND user_id = ?`,
          [amount, qty, priceBitcoin, row.id, session.userid]
        );

        session.message =
          "Congratulations, your transaction has been success updated";
      } else {
        session.message = "Transaction not found";
      }
    } catch (error) {
      console.error(error);
      session.message = "Error when trying saving transaction";
    }
  } else {
    session.message = "Please enter value to your transaction";
  }

  response.redirect("/transactions");
});

router.post("/get-price", async (request, response) => {
  const { created_at, amount } = request.body;

  if (created_at != "" && amount != "") {
    try {
      const data = getAvgPrice(created_at);

      let bitcoinBuy = data?.avg_price || 0;

      const qty = calculateBitcoin(amount, bitcoinBuy);

      let newData = {
        qtyBitcoin: qty,
        priceValue: parseFloat(bitcoinBuy),
        valueTransaction: parseFloat(amount)
      };

      const mergeData = Object.assign(data, newData);

      return response.json({ error: false, data: mergeData });
    } catch (error) {
      console.error(error);
      return response.json({ error: true, message: "Price not found" });
    }
  } else {
    return response.json({ error: true, message: "Please enter date value" });
  }
});

module.exports = router;
