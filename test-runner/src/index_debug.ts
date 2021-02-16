#!/usr/bin/env node

import express from "express"
import httpproxy from "express-http-proxy"
import * as path from "path"
import * as generator from "./generator"
const app = express()

const nbt = require(path.join(process.cwd(), "nbt.json"))
const outputPath = generator.generate(nbt.runners, nbt.additionalScripts, true)

app.use("/test-browser", express.static(outputPath))
app.use("/test", express.static(path.resolve(nbt.testFolder)))

if (nbt.proxies) {
    for (const proxy of nbt.proxies) {
        app.use(proxy.local, httpproxy(proxy.remote))
    }
}

console.log("Server Started. Open at http://localhost:7777/test-browser/index1.html.")
app.listen(7777, () => {})
