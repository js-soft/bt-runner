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

        const matchingEnvVars = Object.entries(process.env).filter(([key]) => environment.includes(key))
        const newProcessEnv = Object.fromEntries(matchingEnvVars)

        await page.evaluate((params: any) => {
            // @ts-expect-error
            globalThis.process = globalThis.process ?? {}
            globalThis.process.env = globalThis.process.env ?? {}

            globalThis.process.env = { ...globalThis.process.env, ...params }
        }, newProcessEnv)

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
