async function build() {
    const jsdoc2md = require("jsdoc-to-markdown")
    const fs = require("fs")

    const templateDir = "./jsdoc2md"
    const outputFile = "./README.md"

    const template = fs.readFileSync(templateDir + "/template.hbs", "utf8")
    data = await jsdoc2md
        // .render({ files: "index.js", template: template })
        .render({
            files: "./index.js",
            template: template,
            partial: templateDir + "/**/*.hbs",
            "example-lang": "js",
            helper: templateDir + "/jsdoc2md-helper.js",
        })
        .then((output) => {
            fs.writeFileSync(outputFile, output)
            console.log(`${outputFile} created.`)
        })
        .catch((err) => console.log("ERROR:", err.toString()))
}

build()
