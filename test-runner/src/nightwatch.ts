import * as child_process from "child_process"
import * as nightwatch from "nightwatch"
import * as path from "path"
import rimraf = require("rimraf")

export function runNightwatch(tempFolder: string, testFolder: string) {
    var httpServerProc = child_process.spawn("node", [`${__dirname}/server.js`, tempFolder, testFolder], {
        stdio: "inherit",
    })
    nightwatch.cli(function (argv) {
        argv.config = path.join(tempFolder, "nightwatch.json")
        const runner = nightwatch.CliRunner(argv)
        runner
            .setup()
            .startWebDriver()
            .catch((err) => {
                console.error(err)
                cleanup(httpServerProc, tempFolder)
            })
            .then(() => {
                return runner.runTests()
            })
            .catch((err) => {
                console.error(err)
                runner.processListener.setExitCode(10)
                cleanup(httpServerProc, tempFolder)
            })
            .then(() => {
                return runner.stopWebDriver()
            })
            .then(() => {
                cleanup(httpServerProc, tempFolder)
            })
            .catch((err) => {
                console.error(err)
                cleanup(httpServerProc, tempFolder)
            })
    })
}

function cleanup(httpServerProc: child_process.ChildProcess, tempFolder: string) {
    httpServerProc.kill("SIGINT")
    rimraf.sync(tempFolder)
    process.exit(0)
}
