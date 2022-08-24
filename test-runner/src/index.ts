#!/usr/bin/env node

import * as child_process from "child_process"
import * as path from "path"
import puppeteer from "puppeteer"
import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import generate from "./generate"
import getPort from "./getPort"
import { IRunner } from "./IRunner"
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

    const nbt = require(path.join(process.cwd(), args.config))
    const tempFolder = generate(nbt.runners, nbt.additionalScripts)
    const testFolder = path.resolve(nbt.testFolder)
    const httpServerProc = child_process.spawn("node", [`${__dirname}/../dist/server.js`, tempFolder, testFolder], {
        stdio: "inherit",
        env: { PORT: port.toString() }
    })

    let exitCode = 0
    try {
        const success = await runTests(port, nbt.runners)
        if (!success) exitCode = 1
    } catch (e) {
        console.error(e)
        exitCode = 1
    } finally {
        httpServerProc.kill("SIGINT")
        rimraf.sync(tempFolder)
    }

    process.exit(exitCode)
}

async function runTests(serverPort: number, testRunners: IRunner[]) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox"]
    })

    const page = await browser.newPage()

    page.on("console", (message) => {
        console.log.apply(
            console,
            message.args().map((arg) => arg.remoteObject().value)
        )
    })

    for (let i = 0; i < testRunners.length; i++) {
        const runner = testRunners[i]
        const runnerNumber = i + 1

        console.log(`Running test runner ${runnerNumber}`)

        await page.goto(`http://localhost:${serverPort}/test-browser/index${runnerNumber}.html`)

        const globals = runner.globals ?? []
        globals.push("mocha")

        const result = await page.evaluate(async (globals) => {
            for (const glob of globals) {
                if (typeof window[glob] === "undefined") {
                    console.log(`Required library '${glob}' not loaded. Aborting...`)
                    return { failures: 1 }
                }
            }

            return new Promise<{ failures: number }>((resolve) =>
                (window as any).mocha.run(function (failures: number) {
                    resolve({ failures: failures })
                })
            )
        }, runner.globals ?? [])

        if (result.failures != 0) {
            await browser.close()
            return false
        }

        console.log()
        console.log()
    }

    await browser.close()
    return true
}

function cleanup(httpServerProc: child_process.ChildProcess, tempFolder: string) {}

run()
