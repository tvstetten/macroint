import { htmlEscape } from "escape-goat"
import { MacroInt } from ".."

function register_htmlEscape(macroInt) {
    MacroInt.modifiers.register(
        ["htmlEscape", "-he"],
        (macroInt, parameters) => {
            if (typeof macroInt.result === "string")
                macroInt.result = htmlEscape(macroInt.result)
        }
    )
}
