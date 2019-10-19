'use strict';

const express = require('express');
const { Pool } = require('pg')

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const pool = new Pool()
const errorLogType = 'Error';
const infoLogType = 'Info';
const debugLogType = 'Debug';

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})


// Appf
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
}).get('/testdbconnection', (req, res) => testDB(req, res));

// Log Helper Function that'll attempt to log but if the logging fails, the most we can do is output to console for monitoring.
async function log(type, message) {
  try {
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query('insert into Logs (Type, Message) values ($1, $2)', [type, message], (error, result) => {
        done();
        if (error) {
          console.log(error.stack);
        }
      })
    });
  } catch (error) {
    console.log(error.stack);
  }
}

async function testDB(req, res) {
  try {
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query('select * from Shoes', (error, result) => {
        done();
        if (error) {
          console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
          res.send({ error: "Failed Connection, check the logs." });
          log(errorLogType, error.message);
        } else {
          console.log(`Successful Response: { success: ${JSON.stringify(result.rows[0])} }`);
          res.send({ success: result.rows[0] });
          log(infoLogType, `Successful Response: { success: ${JSON.stringify(result.rows[0])} }`);
        }
      })
    });
  } catch (error) {
    console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
    res.send({ error: "Failed Connection, check the logs." });
    log(errorLogType, error.message);
  }
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);