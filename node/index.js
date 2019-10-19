'use strict';

const express = require('express');
const { Client } = require('pg')

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const connectionString = 'postgresql://stockx:challenge@db:5432/stockx'
const client = new Client({
  connectionString: connectionString,
})

// Appf
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
}).get('/testdbconnection', (req, res) => testDB(req, res));

async function testDB(req, res) {
  try {
    client.connect();
    await client.query('SELECT $1::text as message', ['Hello world!'], (err, result) => {
      try {
        console.log(err ? err.stack : result.rows[0].message) // Hello World!
        client.end(err => {
          console.log('client has disconnected line 27');
          if (err) {
            console.log('error during disconnection'. err.stack);
          }
        });
        res.send({ success: 'Hello World!'});
      } catch (error) {
        client.end(err => {
          console.log('client has disconnected line 35');
          if (err) {
            console.log('error during disconnection'. err.stack);
          }
        });
        res.send({ error: error.message,
          errorStack: error.stack });
      }
    });
  } catch (error) {
    client.end(err => {
      console.log('client has disconnected line 45');
      if (err) {
        console.log('error during disconnection'. err.stack);
      }
    });
    res.send({ error: error.message,
      errorStack: error.stack });
  }
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);