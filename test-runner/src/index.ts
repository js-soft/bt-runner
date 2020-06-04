#!/usr/bin/env node

import * as path from "path"
import * as generator from "./generator"
import * as nightwatch from "./nightwatch"

const nbt = require(path.join(process.cwd(), "nbt.json"))
const outputPath = generator.generate(nbt.runners)
nightwatch.runNightwatch(outputPath, path.resolve(nbt.testFolder))
