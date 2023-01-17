const { expect, assert } = require("chai")
const MacroInt = require("../index.js")

// @ts-check   Enable TypeScript type checking in VScode Editor

describe("MacroInt module", function () {
    this.timeout(500000) // For debugging purposes
    /** @type {MacroInt} */
    let macroInt
    /** @type {Modifiers} */
    let modifiers
    /** @type {*} */
    let result
    /** @type {Object} */
    let originalModifiers

    describe("Modifiers", function () {
        def_callback = () => {}
        beforeEach(() => {
            // As we don't publish the Modifiers-class we need to create one this way
            // modifiers = MacroInt._modifiers
        })

        it(".register - string", function () {
            MacroInt.registerModifier("New", def_callback)
            assert.equal(MacroInt._modifiers.new, def_callback)
            MacroInt.unregisterModifier("New", def_callback)
            assert.equal(MacroInt._modifiers.new, undefined)
        })
        it(".register - umlauts", function () {
            MacroInt.registerModifier("ÄÖÜäöüßàÀ", def_callback) // spell: ignore ÄÖÜäöüßàÀ
            assert.equal(MacroInt._modifiers["äöüäöüßàà"], def_callback)
            MacroInt.unregisterModifier("ÄÖÜäöüßàÀ", def_callback)
            assert.equal(MacroInt._modifiers["ÄÖÜäöüßàÀ"], undefined)
        })
        it(".register - string-array", function () {
            const keys = ["new", "New_", "-new"]
            MacroInt.registerModifier(keys, def_callback)
            keys.forEach((key) =>
                assert.equal(
                    MacroInt._modifiers[key.toLowerCase()],
                    def_callback
                )
            )
            MacroInt.unregisterModifier(keys)
            keys.forEach((key) =>
                assert.equal(MacroInt._modifiers[key.toLowerCase()], undefined)
            )
        })
        it(".register - reject already registered", function () {
            MacroInt.registerModifier(["new"], def_callback)
            expect(() => {
                MacroInt.registerModifier("new", def_callback)
            }).to.throw(/Error in Modifiers.register.*/)
            MacroInt.unregisterModifier("new")
        })
        it(".register - callback must be provided", function () {
            expect(() => {
                MacroInt.registerModifier("new", undefined)
            }).to.throw(/Invalid callback-parameter.*/)
        })
        it(".register - callback must be a function", function () {
            expect(() => {
                MacroInt.registerModifier("new", "not a function")
            }).to.throw(/Invalid callback-parameter.*/)
        })

        it("Default-Modifiers (mandatory, default, upper, lower, toNum, toBool)", function () {
            macroInt = new MacroInt({ macro: "macro_result" })

            // [keyword(s), modifier-parameter(s), macro-value, expected-Result, [expected error-text]]
            ;[
                [["Mandatory", "-m"], undefined, "with_result", "with_result"],
                [["Mandatory", "-m"], undefined, "", ""],
                [["Mandatory", "-m"], undefined, 123, 123],
                [["Mandatory", "-m"], undefined, 0, 0],
                [
                    ["Mandatory", "-m"],
                    undefined,
                    undefined,
                    undefined,
                    "Undefined result for mandatory expression.",
                ],
                [["default", "-d"], "<default>", "default", "default"],
                [["default", "-d"], "macro", undefined, "macro_result"],
                [["default", "-d"], "'<default>'", undefined, "<default>"],
                [["default", "-d"], undefined, undefined, undefined],
                [["upper", "-u"], undefined, "toUpperCase", "TOUPPERCASE"], // spell: ignore TOUPPERCASE
                [["lower", "-l"], undefined, "toLowerCase", "tolowercase"], // spell: ignore tolowercase
                // emptyArray doesn't work here because it uses MacroInt.isOneMacro()
                // [["emptyArray"], undefined, "emptyArray", ["emptyArray"]],
                // [["emptyArray"], undefined, undefined, []],
                [
                    [["-u", "-d", "lower"]],
                    [undefined, "'DEFAULT'"],
                    undefined,
                    "default",
                ],
                [
                    [["-d", "-u"]],
                    ["'default'", undefined],
                    undefined,
                    "DEFAULT",
                ],
                [["toNumber", "toNum", "-tn"], undefined, "123", 123],
                [["toNumber", "toNum", "-tn"], undefined, 123, 123],
                [["toNumber", "toNum", "-tn"], "456", "x123", 456],
                [
                    ["toNumber", "toNum", "-tn"],
                    undefined,
                    "x123",
                    0,
                    'modifier toNumber: Unable to convert the macro-value "x123" to a number.',
                ],
                [["toBoolean", "toBool", "-tb"], undefined, "True", true],
                [["toBool"], undefined, "false", false],
                [["toboolean"], undefined, "", false],
                [["-tb"], undefined, "0", false],
                [["toBoolean"], undefined, "123", true],
                [["toBoolean"], undefined, 1, true],
                [["toBoolean"], undefined, 0, false],
                [["toBoolean"], undefined, true, true],
                [["toBoolean"], undefined, false, false],
                [["toBoolean"], undefined, {}, true],
                [["toBoolean"], undefined, [], true],
            ].forEach((subTest) => {
                keyWords =
                    typeof subTest[0] == "string" ? [subTest[0]] : subTest[0]
                keyWords.forEach((keyWord) => {
                    if (Array.isArray(keyWord)) {
                        _foundModifiers = []
                        keyWord.forEach((key, index) => {
                            _foundModifiers.push({
                                key: key,
                                params: subTest[1][index],
                            })
                        })
                    } else
                        _foundModifiers = [
                            {
                                key: keyWord,
                                params: subTest[1],
                            },
                        ]
                    result = macroInt._execModifiers(
                        _foundModifiers,
                        subTest[2]
                    )
                    if (subTest[4]) {
                        assert.isTrue(
                            macroInt.errors.includes(subTest[4]),
                            subTest.toString()
                        )
                    }
                    if (Array.isArray(subTest[3])) {
                        expect(result).deep.to.equal(
                            subTest[3],
                            subTest.toString()
                        )
                    } else {
                        assert.equal(result, subTest[3], subTest.toString())
                    }
                })
            })
        })

        it("Custom modifier", function () {
            macroInt = new MacroInt({ macro: "macro_result" })

            MacroInt.registerModifier(
                ["Custom", "-c"],
                (macroInt, macroValue, params) => {
                    assert.isTrue(macroInt instanceof MacroInt)
                    assert.isTrue(params === "<params>")
                    return "4321"
                }
            )
            _foundModifiers = [{ key: "-c", params: "<params>" }]
            assert.equal(
                macroInt._execModifiers(_foundModifiers, "1234"),
                "4321"
            )

            // reset!
            MacroInt.unregisterModifier(["-c", "custom"])
        })
    })

    describe("MacroInt class", function () {
        describe("constructor", function () {
            it("no parameters", function () {
                macroInt = new MacroInt()
                assert.equal(macroInt._usedSymbols.macroBegin, "${")
                assert.equal(macroInt._usedSymbols.macroEnd, "}")
                assert.equal(macroInt._usedSymbols.modifierSeparator, "|")
                assert.equal(macroInt._usedSymbols.modifierParamSeparator, ":")
                assert.equal(macroInt._usedSymbols.propertyPathIndicator, "^")
                assert.equal(
                    macroInt._usedSymbols.siblingsTemplateKey,
                    "$template"
                )
                assert.equal(
                    macroInt._usedSymbols.resultForUndefinedValues,
                    "$$-undefined-$$"
                )

                assert.isTrue(Array.isArray(macroInt._repositories))
                assert.equal(macroInt._repositories.length, 0)
                assert.equal(macroInt._modifiers, undefined)
                assert.isTrue(macroInt._allowUndefined)
                assert.isTrue(macroInt._throwErrors)

                assert.equal(macroInt._hasConstant, false)
                assert.equal(macroInt.errors.length, 0)
            })
            it("repositories = Object", function () {
                macroInt = new MacroInt({ x: 123 })
                assert.equal(macroInt._repositories.length, 1)
            })
            it("repositories = Array", function () {
                macroInt = new MacroInt([{ x: 123 }, { y: 456 }])
                assert.equal(macroInt._repositories.length, 2)
            })
        })

        describe("Symbols", function () {
            let oldDefaults
            this.beforeEach(() => {
                oldDefaults = Object.assign({}, MacroInt.defaultSymbols)
            })
            this.afterEach(() => {
                MacroInt.defaultSymbols = Object.assign({}, oldDefaults)
            })
            it("defaultSymbols", function () {
                MacroInt.defaultSymbols.macroBegin = "{{"
                MacroInt.defaultSymbols.macroEnd = "}}"
                macroInt = new MacroInt({ x: 123 })
                result = macroInt.resolve("{{x}}")
                assert.equal(result, 123)
            })
            it("constructor(options.symbols)", function () {
                macroInt = new MacroInt(
                    { x: 123 },
                    { symbols: { macroBegin: "{{", macroEnd: "}}" } }
                )
                result = macroInt.resolve("{{x}}/{{x}}")
                assert.equal(result, "123/123")
            })
            it("constructor(options.symbols)", function () {
                macroInt = new MacroInt(
                    { x: 123 },
                    {
                        symbols: {
                            macroBegin: "1",
                            macroEnd: "2",
                            modifierSeparator: "3",
                            modifierParamSeparator: "4",
                            propertyPathIndicator: "5",
                            siblingsTemplateKey: "6",
                            resultForUndefinedValues: "7",
                        },
                    }
                )

                assert.equal(macroInt._usedSymbols.macroBegin, "1")
                assert.equal(macroInt._usedSymbols.macroEnd, "2")
                assert.equal(macroInt._usedSymbols.modifierSeparator, "3")
                assert.equal(macroInt._usedSymbols.modifierParamSeparator, "4")
                assert.equal(macroInt._usedSymbols.propertyPathIndicator, "5")
                assert.equal(macroInt._usedSymbols.siblingsTemplateKey, "6")
                assert.equal(
                    macroInt._usedSymbols.resultForUndefinedValues,
                    "7"
                )
            })
        })

        describe("Other functions/properties", function () {
            beforeEach(() => {
                macroInt = new MacroInt()
                // Most test check for undefined
            })
            it("options._allowUndefined", function () {
                macroInt = new MacroInt({ x: 123 }, { allowUndefined: true })
                assert.isTrue(macroInt._allowUndefined)
                expect(() => macroInt.resolve("${y}")).to.not.throw()

                macroInt = new MacroInt({ x: 123 }, { allowUndefined: false })
                assert.isFalse(macroInt._allowUndefined)
                expect(() => macroInt.resolve("${y}")).to.throw()
            })
            it("options.throwErrors", function () {
                macroInt = new MacroInt({ x: 123 }, { throwErrors: false })
                assert.isFalse(macroInt._throwErrors)
                expect(() => macroInt.resolve("${x | unknown}")).to.not.throw()

                macroInt = new MacroInt({ x: 123 }, { throwErrors: true })
                assert.isTrue(macroInt._throwErrors)
                expect(() => macroInt.resolve("${x | unknown}")).to.throw()
            })
            it("options.throwErrors - auto-reset errors", function () {
                macroInt._throwErrors = true
                expect(() => macroInt.resolve("${^-99}")).to.throw()
                assert.equal(macroInt.errors.length, 1)

                macroInt._throwErrors = false
                macroInt.resolve("${^-99}")
                // added another error to the one from the first call
                assert.equal(macroInt.errors.length, 2)

                macroInt._throwErrors = true
                macroInt.resolve("no macro")
                assert.equal(macroInt.errors.length, 0)
            })
            it(".registerRepository", function () {
                macroInt.registerRepository({ x: 123 })
                macroInt.registerRepository([{ y: 321 }, { z: 456 }])
                macroInt.registerRepository((keyValue) => {
                    return keyValue == "a" ? 987 : undefined
                })

                assert.equal(macroInt._repositories.length, 4)
                assert.equal(macroInt.getValue("x"), 123)
                assert.equal(macroInt.getValue("y"), 321)
                assert.equal(macroInt.getValue("z"), 456)
                assert.equal(macroInt.getValue("a"), 987)
                assert.equal(macroInt.getValue("aa"), undefined)
            })
            it(".isOneMacro", function () {
                assert.isFalse(macroInt.isOneMacro())
                macroInt.resolve('${"hello"}')
                assert.isTrue(macroInt.isOneMacro())
            })
            it(".addError", function () {
                macroInt.addError("1")
                macroInt.addError("1", "2")
                macroInt.addError("1", "2", "3")
                macroInt.addError("1", "1", "3")
                macroInt.addError("1", "2", "2") // filter equal entries
                assert.equal(macroInt.errors[0], "1")
                assert.equal(macroInt.errors[1], "1 <== 2")
                assert.equal(macroInt.errors[2], "1 <== 2 <== 3")
                assert.equal(macroInt.errors[3], "1 <== 3")
                assert.equal(macroInt.errors[4], "1 <== 2")
            })
            it(".toString", function () {
                macroInt._completeExpression = "000"
                macroInt._propertyPath = ["p1", "p2"]
                const header =
                    "MacroInt:\n  Expression: 000\n  " +
                    "Current Expression: undefined\n  " +
                    "Property: p1.p2"

                assert.equal(macroInt.toString(), header + "\n  Errors: <none>")
                macroInt.addError("eee")
                assert.equal(
                    macroInt.toString(),
                    header + "\n  Error: eee <== 000  (@Property: p1.p2)"
                )
                macroInt.addError("eee2")
                assert.equal(
                    macroInt.toString(),
                    header +
                        "\n  Errors (2):" +
                        "\n    eee <== 000  (@Property: p1.p2)" +
                        "\n    eee2 <== 000  (@Property: p1.p2)"
                )
            })
            describe(".isUndefined", function () {
                it("symbol_ResultForUndefinedValues", function () {
                    assert.equal(
                        macroInt._usedSymbols.resultForUndefinedValues,
                        "$$-undefined-$$"
                    )
                })
                it("undefined returns true", function () {
                    assert(macroInt.isUndefined(undefined))
                })
                it("Property .resultForUndefinedValue returns true", function () {
                    assert(
                        macroInt.isUndefined(macroInt.resultForUndefinedValue)
                    )
                })
                it("Partial value returns true", function () {
                    assert(
                        macroInt.isUndefined(
                            "??." +
                                macroInt._usedSymbols.resultForUndefinedValues +
                                ".??"
                        )
                    )
                })
            })
        })

        describe(".getValue", function () {
            it("Find in env", function () {
                macroInt = new MacroInt()
                macroInt.registerRepository(process.env)
                assert.isString(macroInt.getValue("PATH"))
                assert.isUndefined(macroInt.getValue("NAME_XX"))
            })
            it("repositories = Object", function () {
                macroInt = new MacroInt({ x: 123 })
                assert.equal(macroInt._repositories.length, 1)
            })
            it("repositories = init with array [Object, Object]", function () {
                macroInt = new MacroInt([{ x: 123 }, { x: 999, y: 321 }])
                assert.equal(macroInt._repositories.length, 2)
                assert.equal(macroInt.getValue("x"), 123) // not 999 from repo2
                assert.equal(macroInt.getValue("y"), 321)
            })
            it("repositories = [Callback, Object]", function () {
                macroInt = new MacroInt([
                    (keyValue, paramMacroInt) => {
                        assert.equal(macroInt, paramMacroInt)
                        assert.isTrue(typeof keyValue === "string")
                        return keyValue == "x" ? 123 : undefined
                    },
                    { y: "321" },
                ])
                assert.equal(macroInt._repositories.length, 2)
                assert.equal(macroInt.getValue("x"), 123)
                assert.equal(macroInt.getValue("y"), 321)
                assert.equal(macroInt.getValue("z"), undefined)
            })

            it("Find in own repository", function () {
                macroInt = new MacroInt({ ConfigTest: "configTest" })
                assert.equal(macroInt.getValue("ConfigTest"), "configTest")
                assert.isUndefined(macroInt.getValue("Config__Test"))
            })
            it("Find in repository with lower index", function () {
                macroInt = new MacroInt([
                    { macro: "macro0" },
                    { macro: "macro1" },
                ])
                assert.equal(macroInt.getValue("macro"), "macro0")
            })
            it("Find with path in key name", function () {
                macroInt = new MacroInt({
                    p1: { p2: { p3: { value: "Test" } } },
                })
                assert.equal(macroInt.getValue("p1.p2.p3.value"), "Test")
                assert.equal(macroInt.getValue("p1.p2.p3")["value"], "Test")
                assert.isUndefined(macroInt.getValue("p1.p2.does_not_exist"))
            })
        })

        describe(".resolve - String", function () {
            let macro
            const UNDEFINED_VALUE = "<undefined!>"
            beforeEach(() => {
                macroInt = new MacroInt({
                    macro: "macro_result",
                    macro1: "macro1_result",
                    macro2: "macro2_result",
                    macro3: "macro3_result",
                    number: 123,
                    bool: true,
                    obj: {},
                    parent1_macro: "Parent1_Macro",
                    parent_macro_result: "Parent_Macro_Result",
                    L2_macro: "l2_Macro_Result",
                    empty: "",
                })

                // Most test check for undefined
                macroInt._throwErrors = false
                macroInt._propertyPath = ["L0", "L1", "L2", "L3", "L4"]
                // set an alternate value
                macroInt._usedSymbols.resultForUndefinedValues = UNDEFINED_VALUE
            })
            // Helper function to test the given errors against the expected ones
            function _checkArrays(title, found, expected) {
                if (expected) {
                    assert(
                        found.length > 0,
                        "No " + title + " occurred, although one was expected"
                    )
                    assert.isArray(
                        expected,
                        "Expected " + title + " values have to be an array!"
                    )
                    for (let index = 0; index < expected.length; index++) {
                        expectedEntry = expected[index]
                        foundEntry = found[index]
                        if (Array.isArray(expectedEntry)) {
                            for (let expectedSubEntry of expectedEntry) {
                                assert.include(
                                    foundEntry,
                                    expectedSubEntry,
                                    "Expected and actual " +
                                        title +
                                        " don't match\n"
                                )
                            }
                        } else {
                            assert.include(
                                foundEntry,
                                expectedEntry,
                                "Expected and actual " +
                                    title +
                                    " don't match\n"
                            )
                        }
                    }
                } else {
                    assert(
                        !found.length,
                        title + " occurred, but none was expected"
                    )
                }
            }
            // Standard-function for testing macros
            function testMacro(
                expression,
                expectedResult,
                expectedErrors = undefined
            ) {
                result = macroInt.resolve(expression)

                _checkArrays("Errors", macroInt.errors, expectedErrors)
                assert.equal(result, expectedResult)
            }

            //--------------------------------------------------------------------
            // Tests
            it("options parameter throw error", () => {
                expect(() => {
                    macroInt.resolve("", { include: [] })
                }).to.throw()
                expect(() => {
                    macroInt.resolve("", {})
                }).to.throw()
            })
            it("simple expression", function () {
                testMacro("${macro}", "macro_result")
                testMacro(">>${macro}<<", ">>macro_result<<")
            })
            it("multiple expressions", function () {
                testMacro("${macro}, ${macro1}", "macro_result, macro1_result")
            })
            it("non-string expressions-result", function () {
                assert.equal(macroInt.resolve("${number}"), 123)
                assert.equal(macroInt.resolve("${bool}"), true)
                assert.typeOf(macroInt.resolve("${obj}"), "object")
            })
            it("non-string macro-result embedded in a string", function () {
                assert.equal(macroInt.resolve("-${number}-"), "-123-")
                assert.equal(macroInt.resolve("-${bool}-"), "-true-")
                assert.equal(macroInt.resolve("-${obj}-"), "-[object Object]-")
            })

            it("multiple expression with spaces", function () {
                testMacro(
                    " ${ macro}, ${macro1 }, ${ macro2 } ",
                    " macro_result, macro1_result, macro2_result "
                )
            })
            it("invalid macro-expression", function () {
                testMacro(
                    "${macro []}${macro1[1]}",
                    UNDEFINED_VALUE + UNDEFINED_VALUE
                )
            })
            it("empty macro-expressions", function () {
                testMacro("${}", undefined)
            })
            it("mixed 'good' and invalid macro-expressions", function () {
                testMacro(
                    "x ${ macro }/${macro2}/${macro[2]}/${[2]}/${macro3[1]",
                    "x macro_result/macro2_result/<undefined!>/<undefined!>/${macro3[1]"
                )
            })
            it("escaped (\\${...}) macro-expressions", function () {
                testMacro(
                    "/ escaped :\\${macro\\}, \\\\${macro1}\\, \\ ${macro2}",
                    "/ escaped :${macro}, \\macro1_result,  macro2_result"
                )
            })
            it("propertyPath expressions", function () {
                testMacro(
                    "${^0}, ${^1}, ${ ^2}, ${^3 }, ${ ^4    } | ${^-1}, ${ ^-2 }, ${   ^-3}, ${^-4    }, ${^-5}",
                    "L0, L1, L2, L3, L4 | L4, L3, L2, L1, L0"
                )
            })
            it("propertyPath with invalid index-values", function () {
                testMacro(
                    "${^9}, ${ ^-91 }",
                    UNDEFINED_VALUE + ", " + UNDEFINED_VALUE,
                    [
                        ["property-path-index", "^9"],
                        ["property-path-index", "${ ^-91 }"],
                    ]
                )
            })
            it("propertyPath check positive borders", function () {
                testMacro("${^4}, ${^5}", "L4, " + UNDEFINED_VALUE, [
                    "property-path-index",
                ])
            })
            it("propertyPath check negative borders", function () {
                testMacro("${^-5}, ${^-6}", "L0, " + UNDEFINED_VALUE, [
                    ["^-6", "property-path-index"],
                ])
            })
            it("propertyPath NaN-argument", function () {
                testMacro("${^12xxx}", undefined, [
                    "Invalid property-path-index. The index must be a number.",
                ])
            })
            it("propertyPath empty path", function () {
                macroInt._propertyPath = []
                testMacro("${^0}", undefined, [
                    "Invalid property-path-index. Path is empty",
                ])
            })
            // Nested macros
            it("Nested macro #1", function () {
                // build the name "parent1_macro" and use this as a macro-name
                testMacro("${${'parent'}${'1'}${'_macro'}}", "Parent1_Macro")
            })
            it("Nested macro #2", function () {
                // build the name "parent_" + ${macro} = "macro_result" => ${parent_macro_result} => "Parent_Macro_Result",
                testMacro("${parent_${macro}}", "Parent_Macro_Result")
            })
            it("Nested macro #3", function () {
                // build the name from the propertyPath-element 3 from the tail +
                // "_macro" and eval the combination "L2_macro" to l2_Macro_Result.
                // last but not least add "_outside" to the result
                testMacro("${${^-3}_macro}_outside", "l2_Macro_Result_outside")
                // the same with propertyPath-element #2 from the beginning
                testMacro("${${^2}_macro}_outside", "l2_Macro_Result_outside")
            })
            it("recursive macro expansion", function () {
                // ${recursive1} => ${recursive2} => ${recursive3} => ${recursive4} => "recursive4"
                macroInt.registerRepository({
                    recursive1: "${recursive2}",
                    recursive2: "${recursive3}",
                    recursive3: "${recursive4}",
                    recursive4: "recursive4",
                })
                testMacro("${recursive1}", "recursive4")
            })
            it("recursive macro expansion with default", function () {
                // ${recursive1} => ${recursive2} => ${recursive3} => undefined | -d:'default' => 'default'
                macroInt.registerRepository({
                    recursive1: "${recursive2}",
                    recursive2: "${recursive3}",
                })
                testMacro("${${recursive1} | -d:'default'}", "default")
            })
            // Mandatory macros
            it("mandatory macros - undefined -> ok", function () {
                testMacro("${macro|mandatory}", "macro_result")
            })
            it("mandatory macros - undefined -> error", function () {
                testMacro("${macro_| -m}", undefined, [
                    "Undefined result for mandatory expression.",
                ])
            })
            it("Modifier emptyArray", function () {
                result = macroInt.resolve("${macro|emptyArray}")
                assert.isArray(result)
                assert.equal(result.length, 1)
                result = macroInt.resolve("${macro__|emptyArray}")
                assert.isArray(result)
                assert.equal(result.length, 0)

                macroInt._throwErrors = true
                expect(() =>
                    macroInt.resolve("//${macro__|emptyArray}//")
                ).to.throw("'emptyArray'-Modifier can only be")
            })

            // Chained macros
            it("macro-defaults - 1. macro used", function () {
                testMacro("${macro | -d:macro1}", "macro_result")
            })
            it("macro-defaults - 2. macro used", function () {
                testMacro("${macro_ | default:macro1}", "macro1_result")
            })
            it("macro-defaults - multiple defaults", function () {
                testMacro(
                    "${ma_ | -d:ma_ | -d: ma_| -d:ma_ | -d:ma_ | -d:ma_ | -d:ma_ | -d:ma_ | -d:ma_ | -d:macro}",
                    "macro_result"
                )
            })
            it("chained macros - mixed macro & path", function () {
                testMacro("${macro | -d: '${^-1}'}", "macro_result")
                testMacro("${macro_ | -d: '${^-1}'}", "L4")
            })
            it("chained macros - with default/constant value", function () {
                testMacro("${macro | -d:'default'}", "macro_result")
                testMacro('${macro__ | -d:"default"}', "default")
                testMacro(
                    "${macro__ | -d: macro2__ |  -d:macro3__ | -d: macro4__ | -d: 'default'}",
                    "default"
                )
            })
            it("chained macros - with macro after default-string", function () {
                macro = "macro | -d:'default' | -d: macro2"
                testMacro("${" + macro + "}", "macro_result", [
                    [macro, "Unused modifier-value after constant value"],
                ])
            })
            it("chained macros - with | inside a default-string", function () {
                testMacro("${macro__|-d:'12\\|\\|34'}", "12||34")
            })
            it("chained macros - mandatory ok", function () {
                testMacro("${macro__|default:macro|-m}", "macro_result")
            })
            it("chained macros - mandatory error", function () {
                testMacro("${macro__|default:macro__|-m}", undefined, [
                    "Undefined result for mandatory expression.",
                ])
            })
            it("chained macros - multiple results with mandatory", function () {
                testMacro("${macro1_| -d:macro2|-m}", "macro2_result")
            })
            it("chained macros - multiple mandatory & error", function () {
                testMacro("${macro__| -d:macro__|-m}", undefined, [
                    "Undefined result for mandatory expression.",
                ])
            })
            it("chained macros - mandatory ok", function () {
                testMacro(
                    "${macro__ |-d:macro1__ |-d:macro2__ |-d:macro3__ |-d:macro3| -m}",
                    "macro3_result"
                )
            })
            it("chained macros - mandatory error", function () {
                macro = "${macro__ |-d:macro1__ |-d:macro2__ |-d:macro3__| -m}"
                testMacro(macro, undefined, [
                    [macro, "Undefined result for mandatory expression."],
                ])
            })
            it("modifiers - trailing |", function () {
                testMacro("${ macro |}", "macro_result")
            })
            //
            it("Undefined modifier", function () {
                macro0 = "'constant'"
                macro = '${"' + macro0 + '" |`str2`}'
                testMacro(macro, macro0, ['Unknown modifier "'])
            })
            it("Undefined modifiers after constant - mandatory", function () {
                macro = "${'s3' | $ | $-1 | -m}"
                testMacro(macro, "s3", [
                    [macro, 'Unknown modifier "$'],
                    ['Unknown modifier "$-1"'],
                ])
            })
            it("Undefined modifiers after undefined macro - mandatory", function () {
                macro = "${s1 | $ | $-1 | -m}"
                testMacro(macro, undefined, [
                    [macro, 'Unknown modifier "$'],
                    'Unknown modifier "$-1"',
                    "Undefined result for mandatory expression.",
                ])
            })
            it("Constant value after constant value", function () {
                macro0 = 'stringN[] // $$$ !" "!""!'
                macro = '${"' + macro0 + '" |-d:`str2`}'
                testMacro(macro, macro0, [
                    [
                        macro0,
                        macro,
                        "Unused modifier-value after constant value",
                    ],
                ])
            })
        })

        describe(".resolve - Object", function () {
            beforeEach(() => {
                macroInt = new MacroInt({
                    URL: "base_url",
                    parent1_URL: "parent1_url",
                    parent2_URL: "parent2_url",
                    parent3_URL: "parent3_url",
                    //
                    subObj1_URL: "subObj1_url",
                })
            })

            it("options parameter check all", () => {
                expect(() => {
                    macroInt.resolve(
                        {},
                        // options:
                        {
                            exclude: [],
                            include: [],
                        }
                    )
                }).to.not.throw()
            })
            it("options parameter unknown", () => {
                expect(() => {
                    macroInt.resolve({}, { xxx: "", exclude: [] })
                }).to.throw()
            })
            it("options parameter 'exclude'", () => {
                result = macroInt.resolve(
                    { test: "${test}" },
                    { exclude: ["test"] }
                )
                assert.equal(result.test, "${test}")
            })

            it("options parameter 'include'", () => {
                // include something in the root of the object
                macroInt.registerRepository({ test: "ok" })
                result = macroInt.resolve(
                    { test: { test1: "${test}", test2: "${test}" } },
                    { include: [{ path: "", property: "none" }] }
                )
                assert.equal(result.test.test1, "${test}")
                assert.equal(result.test.test2, "${test}")

                result = macroInt.resolve(
                    { test: { test1: "${test}", test2: "${test}" } },
                    { include: [{ path: "xxx", property: "none" }] }
                )
                assert.equal(result.test.test1, "ok")
                assert.equal(result.test.test2, "ok")

                result = macroInt.resolve(
                    { test: { test1: "${test}", test2: "${test}" } },
                    { include: [{ path: "test", property: "test2" }] }
                )
                assert.equal(result.test.test1, "${test}")
                assert.equal(result.test.test2, "ok")

                result = macroInt.resolve(
                    { test: { test: { test1: "${test}", test2: "${test}" } } },
                    { include: [{ path: "test.test", property: "test2" }] }
                )
                assert.equal(result.test.test.test1, "${test}")
                assert.equal(result.test.test.test2, "ok")
            })

            it("non-object-parameter", () => {
                assert.equal(macroInt.resolve(), undefined)
                assert.equal(macroInt.resolve(""), "")
                assert.equal(macroInt.resolve("str"), "str")
                assert.equal(macroInt.resolve(0), 0)
                assert.equal(macroInt.resolve(123), 123)
                assert.equal(macroInt.resolve(true), true)
                assert.equal(macroInt.resolve(false), false)
            })
            it("empty-object-parameter", () => {
                const obj = {}
                assert.equal(macroInt.resolve(obj), obj)
                const arr = []
                assert.equal(macroInt.resolve(arr), arr)
            })
            it("no-macro-object-parameter", () => {
                const obj = { x: "1" }
                assert.equal(macroInt.resolve(obj), obj)
                const arr = ["1"]
                assert.equal(macroInt.resolve(arr), arr)
            })
            it("One macro object-parameter", () => {
                obj = { urlEnv: "${URL}" }
                macroInt.resolve(obj)
                assert.equal(obj["urlEnv"], "base_url")
            })
            it("Array with one macro", () => {
                obj = ["${URL}"]
                macroInt.resolve(obj)
                assert.equal(obj[0], "base_url")
            })
            it("Object multilevel", () => {
                obj = {
                    urlEnv: "${URL}",
                    sub: { subObj1_url: "${subObj1_URL}" },
                }
                macroInt.resolve(obj)
                assert.equal(obj["urlEnv"], "base_url")
                assert.equal(obj.sub.subObj1_url, "subObj1_url")
            })
            it("Array multilevel", () => {
                obj = ["${URL}", [["${subObj1_URL}"]]]
                macroInt.resolve(obj)
                assert.equal(obj[0], "base_url")
                assert.equal(obj[1][0][0], "subObj1_url")
            })
            it("Object & Array mixed multilevel", () => {
                // some additional registry-items
                macroInt.registerRepository({
                    subObj_URL: "subObjParentName_url",
                    subArr_URL: "subArr_url",
                    subArr1_URL: "subArr1_url",
                })
                obj = {
                    urlEnv: "${URL}",
                    subObj: {
                        subObj1_url: "${subObj1_URL}",
                        parentName_url: "${${^0}_URL}",
                    },
                    subArr: ["${URL}", [["${subArr1_URL}"], "${${^0}_URL}"]],
                }
                macroInt.resolve(obj)
                assert.equal(obj["urlEnv"], "base_url")
                assert.equal(obj.subObj.subObj1_url, "subObj1_url")
                assert.equal(obj.subObj.parentName_url, "subObjParentName_url")
                assert.equal(obj.subArr[0], "base_url")
                assert.equal(obj.subArr[1][0][0], "subArr1_url")
                assert.equal(obj.subArr[1][1], "subArr_url")
            })
            it("With default", () => {
                obj = { url: "${URL_unknown | -d: 'localhost'}" }
                macroInt.resolve(obj)
                assert.equal(obj.url, "localhost")
            })
            it("Multiple undefined and mandatory", () => {
                obj = { url: "${unknown|-d:unknown2|-d:unknown3| -m} " }
                expect(() => {
                    macroInt.resolve(obj)
                }).to.throw(
                    /.*Error: Undefined result for mandatory expression.*/
                )
            })

            it("Refer to the own-property-name", () => {
                // parent1_URL
                obj = { parent1: "${${^-1}_URL| -m} " }
                macroInt.resolve(obj)
                assert.equal(obj.parent1, "parent1_url ")
            })
            it("Avoid recursive / multiple evaluation of the same object", () => {
                child = { url: "${URL}" }
                child.recursiveChild = child
                obj = { child: child, child2: child }
                macroInt.resolve(obj)
                assert.equal(obj.child.url, "base_url")
                assert.equal(obj.child.recursiveChild.url, "base_url")
                assert.equal(obj.child2.url, "base_url")
                assert.equal(obj.child2.recursiveChild.url, "base_url")
                assert.equal(obj.child.recursiveChild, obj.child)
                assert.equal(obj.child, obj.child2)
            })
            it("recursive macro-result handling", () => {
                macroInt.registerRepository({ tree: { url: "${URL}" } })
                obj = { root: "${tree}" }
                macroInt.resolve(obj)
                assert.equal(obj.root.url, "base_url")
            })
            it("Template object incl. recursive", () => {
                obj = {}
                // All siblings will have these two properties
                obj[macroInt._usedSymbols.siblingsTemplateKey] = {
                    url: "${URL| -m}",
                    port: 1234,
                    recursive: { recursive: { recursive: "${^0}" } },
                }
                obj["p1"] = { anything: true }
                obj["p2"] = { url: "localhost" }
                obj["p3"] = { port: 4321 }
                obj["p4"] = undefined
                macroInt.resolve(obj)
                // The obj will look like:
                // obj = {
                //     $template: { url: "${URL| -m}", port: 1234 },
                //     p1: { anything: true, url: "base_url", port: 1234 },
                //     p2: { url: "localhost", port: 1234 },
                //     p3: { url: "base_url", port: 4321 },
                // }
                assert.equal(
                    obj[macroInt._usedSymbols.siblingsTemplateKey].url,
                    "${URL| -m}"
                )
                assert.equal(obj.p1.anything, true)
                assert.equal(obj.p1.url, "base_url")
                assert.equal(obj.p1.port, 1234)
                assert.equal(obj.p2.url, "localhost")
                assert.equal(obj.p2.port, 1234)
                assert.equal(obj.p3.url, "base_url")
                assert.equal(obj.p3.port, 4321)

                // individual values for every branch
                assert.equal(obj.p1.recursive.recursive.recursive, "p1")
                assert.equal(obj.p3.recursive.recursive.recursive, "p3")
            })
            it("Template object + Array + recursive", () => {
                obj = {}
                // All siblings will have these two properties
                obj[macroInt._usedSymbols.siblingsTemplateKey] = {
                    urls: [
                        "${${^0}_URL}",
                        "${URL}",
                        "127.0.0.1",
                        // Object as array-element
                        { recursive: { recursive: { recursive: "${^0}" } } },
                    ],
                    ports: { port1: 123, port2: 456 },
                }
                obj["parent1"] = { anything: true }
                obj["parent2"] = { urls: ["localhost"] }
                obj["parent3"] = { port: 4321 }
                obj["parent4"] = undefined // doesn't become a copy of the template

                macroInt.resolve(obj)
                // The whole template as well as sub-objects of it get copied by
                //  creating new instances and only copy the properties
                assert.notEqual(
                    obj.parent1.urls,
                    obj[macroInt._usedSymbols.siblingsTemplateKey].urls
                )
                assert.notEqual(obj.parent1.urls, obj.parent2.urls)
                assert.equal(obj.parent1.urls[0], "parent1_url")
                assert.equal(obj.parent1.urls[1], "base_url")
                assert.equal(obj.parent2.urls[0], "localhost")
                assert.equal(obj.parent3.urls[0], "parent3_url")
                assert.equal(
                    obj.parent1.urls[3].recursive.recursive.recursive,
                    "parent1"
                )
                assert.equal(
                    obj.parent3.urls[3].recursive.recursive.recursive,
                    "parent3"
                )
                assert.isUndefined(obj.parent4)
            })
            it("Template #3 mandatory property in the template", () => {
                obj = {}
                // All siblings will have these two properties
                obj[macroInt._usedSymbols.siblingsTemplateKey] = {
                    port: "${| -m}", // port is mandatory for all siblings
                }
                obj["p1"] = { anything: true }
                expect(() => {
                    macroInt.resolve(obj)
                }).to.throw(
                    /.*Error: Undefined result for mandatory expression.*/
                )
            })
            it("Complex Object", () => {
                macroInt.registerRepository(
                    {
                        version: "1.2.3",
                        database: "MongoDB",
                    },
                    0
                )
                obj = {
                    version: "${version}",
                    database: {},
                }
            })
        })
    })
})
