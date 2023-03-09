function sleep(ms: number = 500): Promise<void> {
    if (ms <= 0) throw new Error("Please enter a positive value greater than 0.")

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

describe("Long running tests", function () {
    it("should do this", async function () {
        await sleep(3000)
    }).timeout(7000)
})

const testVar = process.env.TEST_VAR
describe("env var mounting", function () {
    it("should mount env vars on the root", async function () {
        if (testVar != "test") throw new Error("TEST_VAR is not set to 'test'")
    })

    it("should mount env vars", async function () {
        if (process.env.TEST_VAR != "test") throw new Error("TEST_VAR is not set to 'test'")
    })
})
