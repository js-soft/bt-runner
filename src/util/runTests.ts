import puppeteer from "puppeteer"
import { IRunner } from "./Config"

export async function runTests(serverPort: number, testRunners: IRunner[], debug: boolean): Promise<boolean> {
    const browser = await puppeteer.launch({
        headless: !debug,
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

        // patch all process.env variables into the browsers "process.env"
        await page.evaluate((params: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            globalThis.process = globalThis.process ?? { env: {} }

            globalThis.process.env = { ...globalThis.process.env, ...params }
        }, process.env)

        for (const dependency of runner.dependencies) {
            await page.addScriptTag({ url: `/test/${dependency}` })
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

            return await new Promise<{ failures: number }>((resolve) =>
                (window as any).mocha.run(function (failures: number) {
                    resolve({ failures: failures })
                })
            )
        }, runner.globals ?? [])

        if (debug) {
            console.log("Press any key to continue...")
            await new Promise((resolve) => process.stdin.once("data", resolve))
        }

        if (result.failures !== 0) {
            await browser.close()
            return false
        }

        console.log()
        console.log()
    }

    await browser.close()
    return true
}
