#!/usr/bin/env node

import * as path from "path"
import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import { Config, getPort, runTests, Server } from "./util"

async function run() {
    const port = await getPort()

    const args = await yargs(hideBin(process.argv))
        .option("config", {
            alias: "c",
            type: "string",
            description: "select a config file",
            default: "nbt.json"
        })
        .option("debug", {
            alias: "d",
            type: "boolean",
            description: "run in debug mode",
            default: false
        }).argv

    const config: Config = require(path.join(process.cwd(), args.config))
    const server = Server.create(config, port).start()

    let exitCode = 0
    try {
        const success = await runTests(port, config.runners, args.debug)
        if (!success) exitCode = 1
    } catch (e) {
        console.error(e)
        exitCode = 1
    } finally {
        server.stop()
    }

    process.exit(exitCode)
}

run().catch((e) => {
    console.error(e)
    process.exit(1)
})
