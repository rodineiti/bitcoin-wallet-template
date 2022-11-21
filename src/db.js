const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const path = require("path");

exports.connect = async () => {
  const connection = await sqlite.open({
    filename: path.resolve(__dirname, "database", "database.sqlite"),
    driver: sqlite3.Database
  });

  await connection.run("PRAGMA foreign_keys = ON");

  console.log("Sqlite Connected");

  return connection;
};
