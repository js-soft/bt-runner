import puppeteer from "puppeteer"
import { IRunner } from "./Config"

export async function runTests(serverPort: number, testRunners: IRunner[]) {
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

        const environment = runner.environment ?? []

        for (const key of environment) {
            const value = process.env[key]
            if (value == null) {
                throw new Error(`Required environment variable '${key}' not set. Aborting...`)
            }

            await page.evaluate((params: any) => (globalThis[params.key] = params.value), { key, value })
        }

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
