const express = require("express")
const config = require("config")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()

app.use(cors())

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth-routes'))

const PORT = config.get("port") || 3000

async function start() {
    try {
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
    } catch (error) {
        console.log("Server Error", error.message)
        process.exit(1)
    }
}

start()

