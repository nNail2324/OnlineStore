const express = require("express")
const config = require("config")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()

app.use(cors())

app.use(express.json({ extended: true }))

console.log("Регистрация маршрута: /api/auth");
app.use("/api/auth", require("./routes/auth"));
console.log("Маршрут /api/auth зарегистрирован");
app.use("/api/category", require("./routes/category"))
app.use("/api/products", require("./routes/product"))

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

