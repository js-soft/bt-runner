#!/usr/bin/env node

import * as child_process from "child_process"
import * as Nightwatch from "nightwatch"
import * as path from "path"
import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import * as generator from "./generator"
import rimraf = require("rimraf")

Nightwatch.cli(async function (argv) {
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

    const nbt = require(path.join(process.cwd(), args.config))
    const tempFolder = generator.generate(nbt.runners, nbt.additionalScripts, false, args.port)
    const testFolder = path.resolve(nbt.testFolder)

    var httpServerProc = child_process.spawn("node", [`${__dirname}/server.js`, tempFolder, testFolder], {
        stdio: "inherit"
    })

    argv.config = path.join(tempFolder, "nightwatch.json")
    const runner = Nightwatch.CliRunner(argv)

    try {
        await runner.setup({})
        await runner.runTests()
    } catch (err) {
        console.error("An error occurred:", err)
    } finally {
        cleanup(httpServerProc, tempFolder)
    }
})

function cleanup(httpServerProc: child_process.ChildProcess, tempFolder: string) {
    httpServerProc.kill("SIGINT")
    rimraf.sync(tempFolder)
    process.exit(0)
}
