import * as express from "express"
const app = express()

app.use("/test-browser", express.static(process.argv[2]))
app.use("/test", express.static(process.argv[3]))

app.listen(7777, () => {})
