const express = require("express")
const app = express()

app.use("/test-browser", express.static("./test-browser"))
app.use("/mocha", express.static("./node_modules/mocha/"))
app.use("/chai", express.static("./node_modules/chai/"))
app.use("/test", express.static("./test"))

const port = 7777
app.listen(port, () => {
    console.log("Express started on port " + port)
})
