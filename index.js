// Requirements
const express = require('express')
const minimist = require('minimist')
const morgan = require('morgan')
const fs = require('fs')
const cors = require('cors')
const db = require('./src/services/database.js')

// Start the express app
const app = express()
app.use(express.static('./public'))
app.use(cors())
app.use(express.json())

const argv = (minimist)(process.argv.slice(2))
const port = argv.port || 5000
if (argv.help) {
    console.log('server.js [options]\
        \n\
        --port	Set the port number for the server to listen on. Must be an integer between 1 and 65535.\
        \n\
        --debug	If set to `true`, creates endlpoints /app/log/access/ which returns a JSON access log from the database and /app/error which throws an error with the message "Error test successful." Defaults to `false`.\
        \n\
        --log		If set to false, no log files are written. Defaults to true. Logs are always written to database.\
        \n\
        --help	Return this message and exit.')
  process.exit(0)
}

debug = false
log = true

if (argv.debug) {
    debug = true
}
if (!argv.log) {
    log = false
}

const server = app.listen(port, () => {
    console.log("App is running on port %PORT%".replace("%PORT%", port))
})

app.use((req, res, next) => {
    let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
    }
    const stmt = logdb.prepare('INSERT INTO accessLog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next()
    })
  
if (argv.debug || argv.d){
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare('SELECT * FROM accessLog').all()
        res.status(200).json(stmt)
    })
  
    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error')
    })
}

if (log) {
    const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' })
    app.use(morgan('combined', { stream: WRITESTREAM }))
}

app.get('/app/', (req, res) => {
    res.status(200).json({"message" : "Succces! (200)"})
});

app.get("/app/flip", (req, res) => {
    res.status(200).json({ "flip" : coinFlip() })
    console.log(res.getHeaders())
})

app.get("/app/flips/:number", (req, res) => {
    var array = coinFlips(req.params["number"])
    res.status(200).json({ "raw" : array, "summary" : { "tails" : countFlips(array).tails, "heads" : countFlips(array).heads }})
    console.log(res.getHeaders())
})

app.get("/app/flip/call/:this_call", (req, res) => {
    res.status(200).json(flipACoin(req.params["this_call"]))
    console.log(res.getHeaders())
})

app.post('/app/flip/coins/', (req, res, next) => {
    flips_counted = countFlips(coinFlips(req.body.number))
    res.status(200).json({"raw" : coin_flips, "summary" : flips_counted})
  });

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});

/* ------------ COIN FUNCTIONS ------------ */
function coinFlip() {
    return Math.random() > 0.5 ? ("heads") : ("tails")
}
app.get("/app/flip", (req, res) => {
    res.status(200).json({ "flip" : coinFlip() })
})

function coinFlips(flips) {
    const record = []
    for (let i = 0; i < flips; i++) {
      record[i] = coinFlip()
    }
    return record
} 

function countFlips(array) {
    let count = { heads: 0, tails: 0 }
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "heads") {
        count.heads++
      } else {
        count.tails++
      }
    }
    return count
}

function flipACoin(call) {
    let flip = coinFlip()
    return {call: call, flip: flip, result: flip == call ? "win" : "lose" }
}