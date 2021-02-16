#!/usr/bin/env node

import * as path from "path"
import { hideBin } from "yargs/helpers"
import yargs from "yargs/yargs"
import * as generator from "./generator"
import * as nightwatch from "./nightwatch"

const args = yargs(hideBin(process.argv)).option("config", {
    alias: "c",
    type: "string",
    description: "select a config file",
    default: "nbt.json",
}).argv

const nbt = require(path.join(process.cwd(), args.config))
const outputPath = generator.generate(nbt.runners, nbt.additionalScripts)
nightwatch.runNightwatch(outputPath, path.resolve(nbt.testFolder))
