'use strict';

const express = require('express');
const { Pool } = require('pg')

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';
const pool = new Pool()
const errorLogType = 'Error';
const infoLogType = 'Info';

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
.get('/TrueToSizeCalculation', (req, res) => getShoeRating(req, res))
.put('/AddShoeRating', (req, res) => addShoeRating(req, res));

// Log Helper Function that'll attempt to log but if the logging fails, the most we can do is output to console for monitoring.
async function log(type, message) {
  try {
    console.log(`${type}: ${message}`);
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query('insert into Logs (Type, Message) values ($1, $2)', [type, message], (error, result) => {
        done();
        if (error) {
          console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
        }
      })
    });
  } catch (error) {
    console.log(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
  }
}

// Log Error Helper function since it comes up in every try catch
async function logError(message) {
  log(errorLogType, message);
}

async function testDB(req, res) {
  try {
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query('select * from Shoes', (error, result) => {
        done();
        if (error) {
          logError(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
          res.send({ error: "Failed Connection, check the logs." });
        } else {
          log(infoLogType, `Successful Response: { success: ${JSON.stringify(result.rows[0])} }`);
          res.send({ success: result.rows[0] });
        }
      })
    });
  } catch (error) {
    logError("Failed Connection, check the logs.");
    res.send({ error: "Failed Connection, check the logs." });
  }
}

async function addShoeRating(req, res) {
  try {
    // log that we hit the function and the query object
    console.log(`hit addShoeRating(req, res) | req.query = ${JSON.stringify(req.query)}`);
    // check that we have both of the required properties and they're the correct values
    let nameFound = req.query.hasOwnProperty('name');
    let ratingFound = req.query.hasOwnProperty('rating');
    if (!nameFound || !ratingFound) {
      res.send({ failed: `You're missing ${!nameFound && !ratingFound ? 'name and rating':
        !nameFound ? 'name': 
        !ratingFound ? 'rating': 
        '' /* we should never hit this portion */} for this api call.`});
        return;
    }
    if (Number.isInteger(req.query.rating) && 0 < req.query.rating <= 5) {
      res.send({ failed: 'The rating parameter value must be a integer between 1 and 5.' });
      return;
    }
    if (req.query.name.length >= 128) {
      res.send({ failed: 'The name parameter value must be a length 128 or lower.' });
      return;
    }
    performQuery('SELECT addShoeRating($1, $2)', [req.query.name, req.query.rating], function (success, result) {
      if (success) {
        // If the call succeeds, return success
        res.send({ AddShoeRating: result.rows[0].addshoerating});
      } else {
        res.send({ error: 'Call Failed', result: result });
      }
    });
  } catch (error) {
    logError(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
    res.send({ error: "Error Occurred in addShoeRating, check the logs." });
  }
}

async function getShoeRating(req, res) {
  try {
    // log that we hit the function and the query object
    console.log(`hit getShoeRating(req, res) | req.query = ${JSON.stringify(req.query)}`);
    // check that we have both of the required properties and they're the correct values
    let nameFound = req.query.hasOwnProperty('name');
    if (!nameFound) {
      res.send({ failed: `You're missing the name for this api call.`});
      return;
    }
    if (req.query.name.length >= 128) {
      res.send({ failed: 'The name parameter value must be a length 128 or lower.' });
      return;
    }
    performQuery('SELECT getShoeRating($1)', [req.query.name], function (success, result) {
      if (success) {
        // If the call succeeds, return the calculation as long as the value isn't -1
        if (result.rows[0].getshoerating > 0) {
          res.send({ TrueToSizeCalcuation: result.rows[0].getshoerating});
        } else {
          res.send({ failed: 'Could not find the name you requested.' });
        }
      } else {
        res.send({ error: 'Call Failed', result: result });
      }
    });
  } catch (error) {
    logError(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
    res.send({ error: "Error Occurred in getShoeRating, check the logs." });
  }
}

async function performQuery(query, parameters, callback) {
  try {
    log(infoLogType, `Performing Query: ${query} [${parameters}]`);
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query(query, parameters, (error, result) => {
        done();
        if (error) {
          logError(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
          return callback(false, "Failed Connection, check the logs.");
        } else {
          log(infoLogType, `Successful Response returned rowCount: ${result.rowCount}`);
          return callback(true, result);
        }
      })
    });
  } catch (error) {
    logError(`Error Message: ${error.message}; Error Stack: ${error.stack}`);
    return callback(false, "Failed Connection, check the logs.");
  }
}

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);