import express from "express"
import { Server } from "http"
import { Config } from "./Config"

let server: Server | undefined

export function start(config: Config, testFolder: string, tempFolder: string, port = 7777) {
    const app = express()

    app.use("/test-browser", express.static(tempFolder))
    app.use("/test", express.static(testFolder))

    if (config.proxies) {
        const httpproxy = require("express-http-proxy")

        for (const proxy of config.proxies) {
            app.use(proxy.local, httpproxy(proxy.remote))
        }
    }

    server = app.listen(port, () => {})
}

export function stop() {
    server?.close()
}
