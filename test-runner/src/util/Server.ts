import express from "express"
import { Server as HttpServer } from "http"
import * as path from "path"
import { Config } from "./Config"
import { generateHtml } from "./generateHtml"

export class Server {
    private readonly testFolder: string
    private server: HttpServer | undefined

    private constructor(private readonly config: Config, private readonly port: number) {
        this.testFolder = path.resolve(config.testFolder)
    }

    public static create(config: Config, port = 7777): Server {
        return new Server(config, port)
    }

    public start(): this {
        const app = express()

        this.config.runners.forEach((runner, i) => {
            app.get(`/test-browser/index${i + 1}.html`, (_req, res) => {
                const html = generateHtml(runner.dependencies, this.config.additionalScripts)
                res.status(200).send(html)
            })
        })

        app.use("/test", express.static(this.testFolder))

        if (this.config.proxies) {
            const httpproxy = require("express-http-proxy")

            for (const proxy of this.config.proxies) {
                app.use(proxy.local, httpproxy(proxy.remote))
            }
        }

        this.server = app.listen(this.port, () => {})

        return this
    }

    public stop() {
        this.server?.close()
    }
}
