#!/usr/bin/env node

import * as express from "express"
import * as httpproxy from "express-http-proxy"
import * as path from "path"
import * as generator from "./generator"
const app = express()

const nbt = require(path.join(process.cwd(), "nbt.json"))
const outputPath = generator.generate(nbt.runners, nbt.additionalScripts)

app.use("/test-browser", express.static(outputPath))
app.use("/test", express.static(path.resolve(nbt.testFolder)))

if (nbt.proxies) {
    for (const proxy of nbt.proxies) {
        app.use(proxy.local, httpproxy(proxy.remote))
    }
}

app.listen(7777, () => {})
