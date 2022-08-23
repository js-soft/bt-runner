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
        await sleep(6000)
    }).timeout(7000)
})
