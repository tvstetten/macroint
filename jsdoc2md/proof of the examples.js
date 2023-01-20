const MacroInt = require("..")

function basics() {
    // const MacroInt = require("macroint")

    // Create an instance of MacroInt and provide the object that contains the macroKey-results.
    mi = new MacroInt({ url: "localhost", user: { name: "Tom" }, id: 123 })

    // The whole expression is a macro
    console.log(mi.resolve("${url}")) // => localhost

    // Multiple macros in one string & macro with property-path (user.name) and modifier (upper)
    console.log(mi.resolve("Name='${user.name | upper}', id=${id}.")) // => Name='TOM', id=123.

    // Use the default 'unknown' because macroKey (xxx) is undefined.
    console.log(mi.resolve("xxx is ${xxx | default: 'unknown'}")) // => xxx is unknown

    // Throw an error because macro-result for xxx is 'undefined'
    try {
        console.log(mi.resolve("${xxx | mandatory}"))
    } catch (e) {
        console.log(e) // => Error: The result of the mandatory expression is undefined. <== ${xxx | mandatory}
    }
}

function modifiers() {
    mi = new MacroInt({ name: "macroint", foo: "Bar" })

    // Convert the result to uppercase (modifier-key: "uppercase" / "-u")
    console.log(mi.resolve("${name | upper}")) // => MACROINT

    // Use a default in case the macroKey is undefined (modifier-key: "default" / "-d").
    console.log(mi.resolve("${xxx | default: 'unknown'}")) // => unknown

    // Throw an error if macro-result is 'undefined' (modifier-key: "mandatory" / "-m").
    try {
        console.log(mi.resolve("${xxx | mandatory}"))
    } catch (e) {
        console.log(e)
    }

    // Multiple defaults. Only the 'foo' alternative can be found in the repository. Lowercase the result
    console.log(mi.resolve("${foo1 | -d:foo | -d:'not found' | lower}")) // => bar
    // No version of 'foo' alternatives can be found in the repository. Uppercase the result
    console.log(mi.resolve("${foo1 | -d:Foo2 | -d:'not found' | upper}")) // => NOT FOUND
    // Uppercase-modifier before the string-default => the "not found" is returned not uppercase.
    console.log(mi.resolve("${foo1 | -d:Foo2  | upper | -d:'not found'}")) // => not found
}

function objectParams() {
    // Assume we have a .env-file and it was loaded into process.env (e.g. via dotenv-extension).
    // (Note: For this example we simulate the .env-file)
    process.env.url = "www.github.com"
    process.env.user_name = "Tom"

    // Instead of providing the repository to the constructor register it separately.
    mi = new MacroInt()
    mi.registerRepository(process.env)

    config = {
        url: "${url}",
        user: "${user_name}",
        options: {
            id: "${id | default: '-1'| toNumber}",
        },
    }
    mi.resolve(config)
    console.log(config) // {url: 'www.github.com', user: 'Tom', options: { id: -1 }}
}

function diverse() {
    // Macro with a numeric result (because the whole expression is a macro) returns a number
    console.log(mi.resolve("${id}"), "=", typeof mi.resolve("${id}")) // => 123 = number
}

function otherModifiers() {
    // Convert the result to lowercase ("lowercase", "-l")
    console.log(mi.resolve("${user.name | -l}")) // => tom

    // Convert the result to a number ("toNumber" / "toNum" / "-tn")
    console.log(mi.resolve("${'123'|toNumber}")) // => 123
    // Convert the result to a number; use default-number if not a number
    console.log(mi.resolve("${'x123'|toNum:-1}")) // => -1

    // Convert the result to a boolean ("toBoolean" / "toBool" / "-tb")
    console.log(mi.resolve("${'false' | toBool}")) // => false
    console.log(mi.resolve("${'True' | tobool}")) // => true
    console.log(mi.resolve("${''|toBoolean}")) // => false
    console.log(mi.resolve("${'0'|-tb}")) // => false
    console.log(mi.resolve("${'123'|-tb}")) // => true
}

function ModifierCallback() {
    MacroInt.registerModifier(
        ["reverse", "-r"],
        (macroInt, macroValue, params) => {
            return ("" + macroValue).split("").reverse().join("")
        }
    )
    const macroInt = new MacroInt({ macro: "Hello" })
    console.log(macroInt.resolve("${macro | -r}")) // expected: olleH
}

function resolve() {
    macroInt = new MacroInt({
        what: "Universe",
        number: 42,
        foo: "FOO",
        bar: "12345",
    })
    str = macroInt.resolve("Hello ${what}! The answer is ${number}.")
    console.log(str) // => Hello Universe! The answer is 42.

    // Interpolate an object
    config = {
        foo: "${foo}",
        options: {
            bar: "${bar | default: '-1'| toNumber}",
            num: "${number}",
            what: "${what}",
        },
    }
    macroInt.resolve(config)
    console.dir(config) // => {foo: 'FOO', options: {bar: 12345, num: 42, what: "Universe"}}
    console.log() //
}

// basics()
// modifiers()
// objectParams()
// otherModifiers()
ModifierCallback()
// resolve()
