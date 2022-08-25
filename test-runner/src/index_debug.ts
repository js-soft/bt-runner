#!/usr/bin/env node

import * as path from "path"
import { Config, Server } from "./util"

const port = 7777
const config: Config = require(path.join(process.cwd(), "nbt.json"))
const server = Server.create(config, port).start()

const urls = (config.runners as Array<any>)
    .map((_runner, index) => `- http://localhost:7777/test-browser/index${index + 1}.html`)
    .join("\n")
console.log(`Server Started. Open under the following URL's
${urls}
and type "mocha.run()" in the debug console to run the tests.`)

const signals = [
    "SIGHUP",
    "SIGINT",
    "SIGQUIT",
    "SIGILL",
    "SIGTRAP",
    "SIGABRT",
    "SIGBUS",
    "SIGFPE",
    "SIGUSR1",
    "SIGSEGV",
    "SIGUSR2",
    "SIGTERM"
]

for (const signal of signals) {
    process.on(signal, () => {
        server.stop()
        process.exit(0)
    })
}
