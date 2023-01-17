var fs = require("fs")

// spell: ignore: formatlink, rawinclude

/**
 * Reads info from the package.json file.
 * @see [docs.hbs](docs.hbs) for an example of how to use this function
 *
 * @function package
 *
 * @param {string} key - The package property you want returned
 *
 * @returns {*}
 */
const path = require("path")
const packageJson = require(path.resolve(process.cwd(), "package.json"))
exports.package = (key) => packageJson[key]

const changeCase = require("change-case")
exports.changeCase = (to, string) => {
    if (to === "title") {
        to = "capitalCase"
    }
    if (to.indexOf("Case") === -1) {
        to += "Case"
    }
    return changeCase[to](string)
}

/**
 * Prefixes a string to the beginning of each line in the first string
 *
 * @function prefixLines
 *
 * @param {string} string - The string to modify
 * @param {string} replacer - The string to prefix to each line
 *
 * @returns {string}
 */
exports.prefixLines = (string, replacer = "") =>
    string ? replacer + string.replace(/[\r\n]/g, "$&" + replacer) : ""

/**
 * Finds an object in an array with a matching key: value
 *
 * @function findBy
 *
 * @param {array} array - The array to search
 * @param {string} key - The key to compare
 * @param {string} value - The value to find
 *
 * @returns {array}
 */
exports.findBy = (array, key, value) =>
    [array.find((item) => item[key] === value)].filter(Boolean)

/**
 * Calls string.replace
 *
 * @function replace
 *
 * @param {string} string - The string to modify
 * @param {string} pattern - The first arg for string.replace
 * @param {string} newString - The second arg for string.replace
 *
 * @returns {string}
 */
exports.replace = (string = "", pattern, newString) =>
    string.replace(pattern, newString)

/**
 * Determines if the provided string is truthy and is different than the string provided the previous time this function was called
 *
 * @function isNew
 *
 * @param {string} string
 *
 * @returns {boolean}
 */
let current = ""
exports.isNew = function (string) {
    const isNew = string !== current
    current = string
    return string && isNew
}

exports.formatlink = (string) => {
    if (string === undefined) return string
    return string.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

exports.tolowercase = (string) => {
    console.log("tolowercase")
    return string.toLowerCase()
}

exports.touppercase = (string) => {
    return string.toUpperCase()
}

exports.rawinclude = (path) => {
    return fs.readFileSync(path)
}
