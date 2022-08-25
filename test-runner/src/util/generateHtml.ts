export function generateHtml(dependencies: string[], additionalScripts?: string[]): string {
    return `<!DOCTYPE html>
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
}
