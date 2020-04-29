const expect = require("chai").expect

describe("Browser Mocha Tests", function () {
    beforeEach((client, done) => {
        client.url(`http://localhost:7777/test-browser/index.html`)
        done()
    })

    after((client, done) => {
        client.end(() => done())
    })

    it("Should run the Mocha tests without error", (client) => {
        client.waitForElementVisible("#main")
        client.timeoutsAsyncScript(200000).executeAsync(
            function (done) {
                var mocha = window.mocha
                if (!mocha) return false

                mocha.run(function (failures) {
                    done({ failures: failures, logs: logs })
                })
                return true
            },
            [],
            (result) => {
                console.log("\n--- browser mocha output ---")

                for (const logs of result.value.logs) {
                    console.log.apply(null, logs)
                }

                console.log("--- finished browser mocha output ---")

                expect(result.value.failures).to.equal(0)
            }
        )
    })
})
