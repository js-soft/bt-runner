import express from "express"
import path = require("path")
const app = express()

app.use("/test-browser", express.static(process.argv[2]))
app.use("/test", express.static(process.argv[3]))

const config: any = require(path.join(process.cwd(), "nbt.json"))
if (config && config.proxies) {
    const httpproxy = require("express-http-proxy")

    for (const proxy of config.proxies) {
        app.use(proxy.local, httpproxy(proxy.remote))
    }
}

app.listen(process.env["PORT"] ?? 7777, () => {})
