var nightwatch = require("nightwatch")
var child_process = require("child_process")

var httpServerProc = child_process.spawn("node", ["./test-browser/server.js"], {
    stdio: "inherit",
})

try {
    nightwatch.cli(function (argv) {
        argv._source = argv["_"].slice(0)

        const runner = nightwatch.CliRunner(argv)
        runner
            .setup()
            .startWebDriver()
            .catch((err) => {
                throw err
            })
            .then(() => {
                return runner.runTests()
            })
            .catch((err) => {
                runner.processListener.setExitCode(10)
            })
            .then(() => {
                httpServerProc.kill("SIGINT")
                return runner.stopWebDriver()
            })
            .catch((err) => {
                Logger.error(err)
            })
    })
} catch (err) {
    err.message = "An error occurred while trying to start the Nightwatch Runner: " + err.message
    console.error(err)
    process.exit(2)
}
