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
}).get('/testdbconnection', (req, res) => testDB(req, res))
.get('/AddShoeRating', (req, res) => addShoeRating(req, res));

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

// Log Error Helper function since it comes up in every try catch
async function logError(error, message) {
  console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
  log(errorLogType, error.message);
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
    logError(error, "Failed Connection, check the logs.");
    res.send({ error: message });
  }
}

async function addShoeRating(req, res) {
  try {
    // log that we hit the function and the query object
    console.log(`hit addShoeRating(req, res) | req.query = ${JSON.stringify(req.query)}`);
    // check that we have both of the required properties
    let nameFound = req.query.hasOwnProperty('name');
    let ratingFound = req.query.hasOwnProperty('rating');
    if (!nameFound || !ratingFound) {
      res.send({ failed: `You're missing ${!nameFound && !ratingFound ? 'name and rating':
        !nameFound ? 'name': 
        !ratingFound ? 'rating': 
        '' /* we should never hit this portion */} for this api call.`});
        return;
    }
    //performQuery(``, [], req, res);
  } catch (error) {
    logError(error, "Error Occurred in addShoeRating, check the logs.");
    res.send({ error: message });
    return;
  }
}

async function performQuery(query, parameters, req, res) {
  try {
    console.log(`Performing Query: ${query} | ${parameters}`);
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query(query, parameters, (error, result) => {
        done();
        if (error) {
          console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
          log(errorLogType, error.message);
          res.send({ error: "Failed Connection, check the logs." });
          return false;
        } else {
          console.log(`Successful Response: { success: ${JSON.stringify(result.rows[0])} }`);
          res.send({ success: result.rows[0] });
          log(infoLogType, `Successful Response: { success: ${JSON.stringify(result.rows[0])} }`);
          return true;
        }
      })
    });
  } catch (error) {
    console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
    res.send({ error: "Failed Connection, check the logs." });
    log(errorLogType, error.message);
    return false;
  }
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);