#!/usr/bin/env node

import * as path from "path"
import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import { Config } from "./Config"
import generate from "./generate"
import getPort from "./getPort"
import { runTests } from "./runTests"
import * as server from "./server"
import rimraf = require("rimraf")

async function run() {
    const port = await getPort()

    const args = await yargs(hideBin(process.argv))
        .option("config", {
            alias: "c",
            type: "string",
            description: "select a config file",
            default: "nbt.json"
        })
        .option("port", {
            alias: "p",
            type: "number",
            description: "select a port",
            default: 9515
        }).argv

    const nbt: Config = require(path.join(process.cwd(), args.config))
    const tempFolder = generate(nbt.runners, nbt.additionalScripts)
    const testFolder = path.resolve(nbt.testFolder)

    server.start(nbt, testFolder, tempFolder, port)

    let exitCode = 0
    try {
        const success = await runTests(port, nbt.runners)
        if (!success) exitCode = 1
    } catch (e) {
        console.error(e)
        exitCode = 1
    } finally {
        server.stop()
        rimraf.sync(tempFolder)
    }

    process.exit(exitCode)
}

run()
