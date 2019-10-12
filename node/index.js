const { Pool, Client } = require('pg')
// pools will use environment variables
// for connection information
const pool = new Pool()
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})
// clients will also use environment variables
// for connection information
async function clientConnect () {
    const client = new Client()
    await client.connect()
    try {
        const res = await client.query('SELECT NOW()')
        console.log(res)
        await client.end()
    } catch(e) {
        console.log('e:'+e)
    }
}
clientConnect();