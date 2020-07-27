import * as fs from "fs"
import * as path from "path"

export interface IRunner {
    dependencies: string[]
    globals: string[]
}

export function generate(runners: IRunner[], additionalScripts: string[] | undefined, debug: boolean = false): string {
    const outputPath = fs.mkdtempSync(path.join(__dirname, "..", "tmp", "browsertests-"))

    let it = 1
    for (const runner of runners) {
        writeHtml(outputPath, it, runner.dependencies, additionalScripts, debug)
        if (!debug) {
            if (!runner.globals) {
                runner.globals = []
            }
            writeTestFile(outputPath, it, runner.globals)
        }
        it++
    }

    if (!debug) {
        writeConfig(outputPath)
    }

    return outputPath
}

function writeHtml(
    outputPath: string,
    iteration: number,
    dependencies: string[],
    additionalScripts: string[] | undefined,
    debug: boolean
) {
    const html = `<!DOCTYPE html>
<html>
    <head>
        <title>Mocha Tests</title>
    </head>

    <body>
        <div id="mocha"></div>
        
        ${
            debug
                ? ""
                : `
        <script>
            window.logs = []
            console.log = function () {
                window.logs.push(Array.from(arguments))
            }
        </script>
        `
        }

        <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/7.2.0/mocha.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/chai/4.2.0/chai.min.js"></script>
        <script>
            mocha.setup("bdd")
            mocha.reporter("spec")
        </script>
        <script>
            ${additionalScripts ? additionalScripts.join("\n") : ""}
        </script>
        
        ${dependencies.map((dependency) => `        <script src="/test/${dependency}"></script>`).join("\n")}

        <div id="main">Test</div>
    </body>
</html>`

    fs.writeFileSync(path.join(outputPath, `index${iteration}.html`), html)
}

function writeTestFile(outputPath: string, iteration: number, globals: string[]) {
    const joined = globals.join("|| !window.")
    const globalsString = joined === "" ? "" : `|| !window.${globals}`

    const testContent = `const expect = require("chai").expect

    describe("Browser Mocha Tests", function () {
        beforeEach((client, done) => {
            client.url("http://localhost:7777/test-browser/index${iteration}.html")
            done()
        })
    
        after((client, done) => {
            client.end(() => done())
        })
    
        it("Should run the Mocha tests without error", (client) => {
            client.waitForElementVisible("#main")
            client.timeoutsAsyncScript(200000).executeAsync(
                function (done) {
                    const mocha = window.mocha
    
                    //add required test librarys in this if statement
                    if (!mocha ${globalsString}) {
                        logs.push(["Required library not loaded. Aborting..."])
                        done({ failures: 1, logs: logs })
                        return
                    }
    
                    mocha.run(function (failures) {
                        done({ failures: failures, logs: logs })
                    })
                },
                [],
                (result) => {
                    console.log("\\n--- browser mocha output ---")
    
                    for (const logs of result.value.logs) {
                        console.log.apply(null, logs)
                    }
    
                    console.log("--- finished browser mocha output ---")
    
                    expect(result.value.failures).to.equal(0)
                }
            )
        })
    })`
    fs.writeFileSync(path.join(outputPath, `mocha${iteration}.test.js`), testContent)
}

function requireGlobal(packageName: string) {
    var childProcess = require("child_process")
    var path = require("path")
    var fs = require("fs")

    var globalNodeModules = childProcess.execSync("npm root -g").toString().trim()
    var packageDir = path.join(globalNodeModules, packageName)
    if (!fs.existsSync(packageDir)) packageDir = path.join(globalNodeModules, "npm/node_modules", packageName) //find package required by old npm

    if (!fs.existsSync(packageDir)) throw new Error("Cannot find global module '" + packageName + "'")

    var packageMeta = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json")).toString())
    var main = path.join(packageDir, packageMeta.main)

    return require(main)
}

function writeConfig(outputPath: string) {
    const settings = {
        src_folders: [outputPath],
        filter: "*.test.js",

        webdriver: {
            start_process: true,
            server_path: "",
            port: 9515,
        },

        test_runner: {
            type: "mocha",
            options: {
                ui: "bdd",
                reporter: "spec",
            },
        },

        test_settings: {
            default: {
                desiredCapabilities: {
                    javascriptEnabled: true,
                    acceptSslCerts: true,
                    acceptInsecureCerts: true,
                    browserName: "chrome",
                    chromeOptions: {
                        args: [
                            "headless",
                            "disable-gpu",
                            "ignore-certificate-errors",
                            "no-sandbox",
                            "disable-features=NetworkService",
                        ],
                        binary: "/usr/bin/google-chrome",
                    },
                },
            },
        },
    }

    //@ts-ignore
    if (process.platform === "win32" || process.platform === "win64") {
        settings.test_settings.default.desiredCapabilities.chromeOptions.binary =
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    }
    settings.webdriver.server_path = requireGlobal("chromedriver").path

    fs.writeFileSync(path.join(outputPath, `nightwatch.json`), JSON.stringify(settings))
}
