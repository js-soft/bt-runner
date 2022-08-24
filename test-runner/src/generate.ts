import * as fs from "fs"
import * as path from "path"
import { IRunner } from "./IRunner"

export default function generate(runners: IRunner[], additionalScripts: string[] | undefined): string {
    const outputPath = fs.mkdtempSync(path.join(__dirname, "..", "tmp", "browsertests-"))

    runners.forEach((runner, index) => {
        writeHtml(outputPath, index + 1, runner.dependencies, additionalScripts)
    })

    return outputPath
}

function writeHtml(
    outputPath: string,
    runnerNumber: number,
    dependencies: string[],
    additionalScripts: string[] | undefined
) {
    const html = `<!DOCTYPE html>
<html>
    <head>
        <title>Mocha Tests</title>
    </head>

    <body>
        <div id="mocha"></div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/10.0.0/mocha.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.6/chai.min.js"></script>
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

    fs.writeFileSync(path.join(outputPath, `index${runnerNumber}.html`), html)
}
