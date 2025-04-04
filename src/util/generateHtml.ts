export function generateHtml(additionalScripts?: string[]): string {
    return `<!DOCTYPE html>
<html>
    <head>
        <title>Mocha Tests</title>
    </head>

    <body>
        <div id="mocha"></div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/mocha/10.2.0/mocha.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/chai/4.3.7/chai.min.js"></script>
        <script>
            mocha.setup("bdd")
            mocha.reporter("spec")
        </script>
        <script>
            ${additionalScripts ? additionalScripts.join("\n") : ""}
        </script>
        
        <div id="main">Test</div>
    </body>
</html>`
}
