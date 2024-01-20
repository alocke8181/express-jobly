"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    //host: "/var/run/postgresql",
    //database: getDatabaseUri(),
    connectionString : 'postgresql://neaeugqr:ycBYkLf3psOqb4QtEy2N9LzECZMSN8w4@heffalump.db.elephantsql.com/neaeugqr',
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString : 'postgres://neaeugqr:ycBYkLf3psOqb4QtEy2N9LzECZMSN8w4@heffalump.db.elephantsql.com/neaeugqr'
  });
}

console.log(getDatabaseUri());

db.connect();

module.exports = db;