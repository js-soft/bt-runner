import * as express from "express"
const app = express()

app.use("/test-browser", express.static(process.argv[2]))
app.use("/mocha", express.static(__dirname + "/../node_modules/mocha/"))
app.use("/chai", express.static(__dirname + "/../node_modules/chai/"))
app.use("/test", express.static(process.argv[3]))

const port = 7777
app.listen(7777, () => {})
