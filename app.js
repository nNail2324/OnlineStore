const express = require("express")
const config = require("config")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth'))
app.use("/api/category", require("./routes/category"))
app.use("/api/subcategory", require("./routes/subcategory"))
app.use("/api/product", require("./routes/product"))
app.use("/api/cart", require("./routes/cart"))
app.use("/api/favorite", require("./routes/favorite"))
app.use("/api/profile", require("./routes/profile"))
app.use("/api/locations", require("./routes/locations"));
app.use("/api/order", require("./routes/order"));
app.use('/api/request', require("./routes/request"));
app.use("/images", express.static(path.join(__dirname, "server-image")));

app.use('/api/users', require("./routes/users"));

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

