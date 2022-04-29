// Requirements
const express = require("express")
const fs = require("fs")
const morgan = require("morgan")
const args = require("util/types")
const logdb = require("./src/services/database.js")

// Start up app
var app = express()
app.use(express.json())

// Help text for terminal call
// If --help or -h is called from the terminal, give help
const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`)

if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Set the server port, default is port 5000
const port = args.port || args.p || process.env.PORT || 5555

// If --log=false, then do not create log file
if (args.log == 'false') {
    console.log("NOTICE: not creating file access.log")
} else {
    const logdir = "./log/"
    if(!fs.existsSync(logdir)) { fs.mkdirSync(logdir) }
    const accessLog = fs.createWriteStream(logdir + "access.log", {flags:"a"})
    app.use(morgan("combined", {stream:accessLog}))
}

// If --debug=true, then release the accesslog
if (args.debug || args.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare("SELECT * FROM accesslog").all();
	    res.status(200).json(stmt);
    })
    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error test works.')
    })
}

// Log to the database
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
        referrer: req.headers['referer'],
        useragent: req.headers['user-agent']
    };
    const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
    next();
})

// ------- COIN FUNCTIONS ------- //

// Flip one coin
function coinFlip() {
    return Math.random() > 0.5 ? ("heads") : ("tails")
}

// Flip multiple coins
function coinFlips(flips) {
    const record = []
    for (let i = 0; i < flips; i++) {
      record[i] = coinFlip()
    }
    return record
}

// Count the coin flips
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

// Guess a coin flip
function flipACoin(call) {
    let flip = coinFlip();
    return {call: call, flip: flip, result: flip == call ? "win" : "lose" }
}

//  ------- ENDPOINTS ------- //

// Use the HTML in the public file
app.use(express.static("./public"))

// Show that app works at its root endpoint
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"})
    res.status(200)
})

// Endpoint for coinFlip()
app.get("/app/flip/", (req, res) => {
    const flip = coinFlip()
    res.status(200).json({"flip":flip})
})

// Endpoint for counting set number of flips - using body
app.post("/app/flip/coins/", (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips, "summary":count})
})

// Endpoint for counting set number of flips - using params
app.get('/app/flips/:number', (req, res, next) => {
    const flips = coinFlips(req.params.number) 
    const count = countFlips(flips)
    res.status(200).json({"raw":flips, "summary":count})
})

// Endpoint for guessing a coin flip - using body
app.post("/app/flip/call/", (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

// Endpoint for guessing a coin flip - using params
app.get("/app/flip/call/:guess(heads|tails)/", (req, res, next) => {
    const game = flipACoin(req.params.guess)
    res.status(200).json(game)
})

// Default endpoint
app.use(function(req, res) {
    const statusCode = 404
    const statusMessage = "NOT FOUND"
    res.status(statusCode).end(statusCode + " " + statusMessage)
})

//  ------- START/END SERVER ------- //

// Start the server
const server = app.listen(port, () => {
    console.log("Sever running on port %PORT%".replace("%PORT%", port))
})

// Log that the sever has stopped
process.on("SIGINT", () => {
    server.close(() => {
        console.log("\nApp stopped.")
    })
})