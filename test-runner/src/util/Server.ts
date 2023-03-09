import express from "express"
import { Server as HttpServer } from "http"
import * as path from "path"
import { Config, IProxy } from "./Config"
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

            const proxies = this.config.proxies.map((proxy) => this.transformProxy(proxy))
            for (const proxy of proxies) {
                app.use(proxy.local, httpproxy(proxy.remote))
            }
        }

        this.server = app.listen(this.port, () => {})

        return this
    }

    private transformProxy(proxy: IProxy): IProxy {
        let remote = proxy.remote

        const regex = /{{([a-z_]+)}}/i
        while (regex.test(remote)) {
            const match = regex.exec(remote)

            if (match) {
                const envVar = match[1]
                const envValue = process.env[envVar]

                if (!envValue) throw new Error(`Environment variable ${envVar} is not defined`)
                remote = remote.replace(match[0], envValue)
            }
        }

        return { local: proxy.local, remote }
    }

    public stop() {
        this.server?.close()
    }
}
