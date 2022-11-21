const { connect } = require("../../../db");
const { createTableTransactions } = require("./create-table-transactions");
const { createTableUsers } = require("./create-table-users");

const runMigrations = async () => {
  const connection = await connect();

  try {
    await connection.exec(createTableUsers);
    await connection.exec(createTableTransactions);
  } catch (error) {
    console.error("Error in migrations => ", error);
  }
};

module.exports = runMigrations;
