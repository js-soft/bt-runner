#!/usr/bin/env node

import express from "express"
import httpproxy from "express-http-proxy"
import * as path from "path"
import generate from "./generate"
const app = express()

const nbt = require(path.join(process.cwd(), "nbt.json"))
const outputPath = generate(nbt.runners, nbt.additionalScripts)

app.use("/test-browser", express.static(outputPath))
app.use("/test", express.static(path.resolve(nbt.testFolder)))

if (nbt.proxies) {
    for (const proxy of nbt.proxies) {
        app.use(proxy.local, httpproxy(proxy.remote))
    }
}

const urls = (nbt.runners as Array<any>)
    .map((_runner, index) => `- http://localhost:7777/test-browser/index${index + 1}.html`)
    .join("\n")
console.log(`Server Started. Open under the following URL's
${urls}
and type "mocha.run()" in the debug console to run the tests.`)
app.listen(7777, () => {})
