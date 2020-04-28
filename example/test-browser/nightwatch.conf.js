function requireGlobal(packageName) {
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

module.exports = (function (settings) {
    settings = {
        src_folders: ["./"],
        exclude: ["./server.js"],

        webdriver: {
            start_process: true,
            server_path: "",
            port: 9515,
        },

        test_runner: {
            type: "mocha",
            options: {
                ui: "bdd",
                reporter: "list",
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

    if (process.platform === "win32" || process.platform === "win64") {
        settings.test_settings.default.desiredCapabilities.chromeOptions.binary =
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    }
    settings.webdriver.server_path = requireGlobal("chromedriver").path

    return settings
})(require("./nightwatch.json"))
