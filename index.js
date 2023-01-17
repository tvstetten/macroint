/**
 * @License MIT
 * @Author Thomas von Stetten
 * compatibility:
 * JS 2016   (array.includes())
 */

"use strict"

// spell: ignore: macroint, emptyarray, macrokey, repositorycallback, modifiercallback, macrosymbols, Stetten, olleH
// @ts-check   Enable TypeScript type checking in VScode Editor
// ts-check type-hint:

/**
 * @name macroKey
 * @private  // don't add automatically to the readme
 * @description
 * A macroKey is that part of a macro that will be interpolated to a result-value.
 * It can be one of the following:
 *
 * 1. A key-value (without any string-delimiters) that will be searched in the
 *    provided [Repositories](#repository)) or passed to the registered
 *    [RepositoryCallbacks](#repositorycallback)). This is the default if the
 *    `macroKey` is non of the following types. If key-value can't be
 *    resolved/found `undefined` is returned.
 *
 * 2. A String enclosed in string-delimiters (one of the three " ' \` ). The
 *    content of the string is returned as the result of the macro. This
 *    string-constants are useful to define default-values in the `default`-modifier.
 *
 * 3. A ^-symbol followed by a number. This is used to access the name of a
 *    property in the path to the current property. This feature is only useful
 *    if an object/array is to be resolved. Normally this feature is especially
 *    useful together with the [siblings-templates](#siblings-templates).\
 *    `parent.child.key = "\${^-1}"` --> "key"\
 *    `parent.child.key = "\${^-2}"` --> "child"\
 *    `parent.child.key = "\${^-3}"` --> "parent"\
 *    `parent.child.key = "\${^0}"` --> "parent"\
 *    `parent.child.key = "\${^1}"` --> "child"\
 *    `parent.child.key = "\${^2}"` --> "key"\
 */

/**
 * @name Modifier
 * @private  // don't add automatically to the readme
 * @description
 * Modifiers are keywords that have a function assigned [modifierCallback](#modifiercallback).
 * Modifiers can have a unlimited number of alias-names (e.g. long- and short-name).
 * The modifier-keywords are **case-insensitive**. An unlimited number of modifiers
 * can be applied to every macro. One modifier can be used multiple times in one
 * macro (e.g. the "default"-modifier).\
 * \
 * Custom additional modifiers can be added via the static `MacroInt.registerModifier()`
 * and removed with `MacroInt.unregisterModifier()`.\
 * \
 * There are a couple of modifiers predefined. All predefined modifiers have at
 * least one full-name and one short alias with a leading "-" plus one or two
 * characters (e.g. `default` and `-d`).\
 *
 *
 * The following modifiers are pre-defined:
 *
 *
 * ### _default:\<macroKey> / -d:\<macroKey>_
 * This modifier defines a default in case the result of the macro is still
 * `undefined`. The default-value after the `:` can be any <[macroKey](#macrokey)>.
 *
 * ### _mandatory / -m_
 * This modifier defines that the macro-result can't be `undefined`. It it is
 * an error is added to the errors-array. Depending of the throwErrors-flag
 * (see [Constructor](#constructor)) of the constructor flag a error is thrown
 * at the end of the resolve-process.
 * If the allowUndefined-flag == false (see [Constructor](#constructor)) this
 * modifier has no real function because an error is added for every undefined
 * result.
 *
 * ### _upper / -u_
 * This modifier converts the result-string of the macro into an uppercase-string.
 *
 * ### _lower / -l_
 * This modifier converts the result-string of the macro into an uppercase-string.
 *
 * ### _emptyArray / -ea_
 * This modifier returns an empty array if the
 * macro-result is `undefined`. Otherwise it returns an array with the
 * macro-result as it's only entry.
 *
 * ### _toNumber[:\<default>] / toNum[:\<default>] / -tn[:\<default>]_
 * Converts the macro-result to a number. If the result is no number the \<default>
 * is used (converted to a number). If no default is provided an error is added.
 *
 * ### _toBoolean / toBool / -tb_
 * Converts the macro-result to a boolean value. The strings "false" and "0"
 * return `false`. All other values are converted using the Boolean(result) function.\
 *
 * ### Examples
 *
 * ```js
 * mi = new MacroInt({ name: "MacroInt" })
 *
 * // Convert the result to uppercase (modifier-key: "uppercase" / "-u")
 * console.log(mi.resolve("${name | upper}")) // => MACROINT
 *
 * // Use a default in case the macro is undefined (modifier-key: "default" / "-d").
 * console.log(mi.resolve("${xxx | default: 'unknown'}")) // => unknown
 *
 * // Throw an error if macro-result is 'undefined' (modifier-key: "mandatory" / "-m").
 * try {
 *     console.log(mi.resolve("${xxx | mandatory}"))
 * } catch (e) {
 *     console.log(e)
 * }
 *
 * // Multiple defaults. Only the 'foo' alternative can be found in the repository. Lowercase the result
 * console.log(mi.resolve("${foo1 | -d:foo | -d:'not found' | lower}")) // => bar
 * // No version of 'foo' alternatives can be found in the repository. Uppercase the result
 * console.log(mi.resolve("${foo1 | -d:Foo2 | -d:'not found' | upper}")) // => NOT FOUND
 * // Uppercase-modifier before the string-default => the "not found" is returned not uppercase.
 * console.log(mi.resolve("${foo1 | -d:Foo2  | upper | -d:'not found'}")) // => not found
 * ```
 */

/**
 * @name ModifierCallback
 * @private
 * @description
 * A ModifierCallback can modify or check the macro-result after the interpolation.
 *
 * The callback has to return a result. The result is the new macro-result-value,
 * and either passed to the next modifier or used as the final result of the
 * interpolation.
 *
 * To get a better idea of the implementation of a modifier see the implementation
 * of the default-modifiers.
 *
 * @callback ModifierCallback
 * @param {MacroInt} macroInt - The current macroInt-object. Provides some useful functions like .getValue or addError
 * @param {*} macroValue - The interpolated current result value of the macro (=result)
 * @param {String|undefined} parameters - String that contains the parameter(s) that were given to the modifier if any.
 * @return {*}
 * @see Modifier
 * @see MacroInt.registerModifier
 * @example
 * ```js
 * const callback = (macroInt, macroValue, params) => {
 *     if (typeof macroValue === "string" && macroValue) {
 *        macroValue = macroValue.split("").reverse().join("")
 *     }
 *     return macroValue
 * }
 * MacroInt.registerModifier(["reverse", "-r"], callback)
 *
 * const macroInt = new MacroInt({ macro: "Hello" })
 * console.log(macroInt.resolve("${macro | -r}"))   // expected: olleH
 * ```
 */

/**
 * @name Error-Handling
 * @private
 * @description
 * Errors that are found during the macro interpolation process are collected
 * in the .errors-array. Javascript errors are still thrown immediately. By
 * default all found errors are thrown an one error at the end of the resolve-function.\
 * By setting the constructor-parameter `options.throwErrors=false`. Then the
 * caller should check the .errors-array manually. This is not recommended.
 *
 * If the options.throwErrors=true (default) the .errors-array is cleared at
 * the beginning of every call to .resolve(). If options.throwErrors=false the
 * array is never cleared and all new errors are added to the existing entries.
 * (The array can be cleared manually via `<instance>.errors.length = 0`.)
 *
 * @see constructor
 * @see options.throwErrors
 * @see options.allowUndefined
 */

/**
 * @name MacroSymbols
 * @private  // don't add automatically to the readme
 * @description
 * The `MacroSymbols` is an object that has a couple of properties that define
 * the string-indicators used to identify the different parts of a macro.\
 * \
 * The `MacroSymbols` used by the `MacroInt` can be modified by either change
 * the static MacroInt.defaultSymbols (which is **dangerous** because all other
 * modules using `MacroInt` are affected). The other way is to provide an object
 * with some or all of the defined symbols to the options.symbols parameter of
 * the MacroInt-constructor.
 *
 * @property {String} macroBegin - Indicates the begin of a macro inside of an expression. Must be a non-empty string. Default: "${"
 * @property {String} macroEnd - String that indicates the end of a macro inside an expression. Must be a non-empty string. Default: "}"
 * @property {String} modifierSeparator - String that separates the regular macroKey and modifier(s). Must be a non-empty string. Default: "\|"
 * @property {String} modifierParamSeparator - String that's used as a separator between one modifier and it's optional parameters. Must be a non-empty string. Default: ":"
 * @property {String} propertyPathIndicator - String to identify expressions that will be interpolated with the name of one of the parent-nodes of the current entry. (By default only used if `.resolve` is called with an object-parameter.) "^"
 * @property {String} siblingsTemplateKey - String that identifies a property in an object that is used as an template for all siblings [siblings-templates](#siblings-templates) of that entry. "$template"
 * @property {String} resultForUndefinedValues - String that's used as a macro-result if the value of a macro is `undefined`. "$$-undefined-$$"
 */

/**
 * @name Repository
 * @private  // don't add automatically to the readme
 * @description
 * A repository is used to get the value for a `macroKey`.
 *
 * Multiple repositories can be assigned to one MacroInt-instance. A repository
 * can have one of the following types:
 *
 * ### Repository-Object
 * That's the most common use-case. The object can have properties
 *   with any depth. To access elements below the root level the key must have
 *   the full path to the property encoded like "${parent1.parent2.key}".
 * ### RepositoryCallback
 * A repository-callback is called to resolve the macroKey.
 * If a Repository is a callback-function that function is called instead of
 * retrieving property-values from an object-repository.\
 * The callback returns either the resolved value or `undefined` if the value
 * could not be resolved.
 *
 * @param {String} macroKey - The keyword that will be searched.
 * @param {MacroInt} macroInt - The MacroInt-object that provides information and helper functions.
 * @return {*|undefined}
 */

/**
 * @name Siblings-Templates
 * @private
 * @description
 * The sibling templates allow the definition of all necessary entries for all sibling-objects.
 */

/**
 * FoundModifier-Object is the object-format of the elements of the array of modifiers found in a macro.
 *
 * @private
 * @typedef {{key: String, params: String|undefined}} FoundModifier
 */

/**
/**
 * @class
 * @classdesc 
 * Class to interpolate macros inclusive modifiers in strings, object-properties 
 * and array-elements. 
 */
class MacroInt {
    /**
     * Registry for all defined/definable modifiers. Modifiers are added as
     * properties with the callback as it's value. Multiple keyword are all
     * added each with the callback.
     *
     * @private
     * @type {Object}
     * @see .registerModifier()
     * @see .unregisterModifier()
     */
    static _modifiers = {}

    /**
     * Static variable with the defaults for all symbols that are used to identify the various parts of the macro-interpolation.
     * This object can be used to change identifier(s) globally for all future instances of MacroInt.
     *
     * @type {MacroSymbols}
     */
    static defaultSymbols = {
        macroBegin: "${",
        macroEnd: "}",
        modifierSeparator: "|",
        modifierParamSeparator: ":",
        propertyPathIndicator: "^",
        siblingsTemplateKey: "$template",
        resultForUndefinedValues: "$$-undefined-$$",
    }

    /**
     * Instance-variable that gets initialized with a copy of the static
     * MacroInt.defaultSymbols.
     *
     * @private
     * @type {MacroSymbols}
     */
    _usedSymbols

    /**
     * Array with the registered repositories.
     * @private
     * @type {Repository[]}
     * @see registerRepository()
     */
    _repositories = []

    /**
     * The complete, currently handled original macro-expression. Used for
     * documentation purposes in errors and .toString().
     * @private
     * @type {String|undefined}
     * */
    _completeExpression

    /**
     * The current expression step by step modified during the interpolation
     * @private
     * @type {String|undefined}
     */
    _currentExpression

    /**
     * Defines if the current expression is exactly one macro
     * @private
     * @type {Boolean}
     */
    _isOneMacro = false

    /**
     * Flag that indicates that there was already a constant
     * value in the current macro
     * @private
     * @type {Boolean}
     */
    _hasConstant = false

    /**
     * Current path to the property (used in resolve() with object-parameter)
     * e.g. `my.object.path --> ["my", "object", "path"]`
     * @private
     * @type {string[]}
     * */
    _propertyPath = []

    /**
     * If this flag is `false` an error is added if the result of a macro is
     * `undefined`. See the [Error-Handling](#error-handling) chapter.
     *  Default: `true`
     * @private
     * @type {Boolean} [=true]
     * @see Error-Handling
     */
    _allowUndefined = true

    /**
     * Flag that indicates wether errors are thrown at the end of an
     * interpolation-process. If this flag is `false` the caller should check
     * the .errors-arrays.
     * @private
     * @type {Boolean}
     * @see Error-Handling
     */
    _throwErrors = true

    /**
     * Array that contains errors that occured during the last call of .resolve().\
     * See the chapter about the [Error-Handling](#error-handling) for details.
     * @type {String[]}
     * @see Error-Handling
     */
    errors = []

    /**
     * <a name="constructor"></a>
     * @constructor
     * @param {Repository|Repository[]} [repositories=undefined] - A single [repository](#repository) or an array of repositories.
     * @param {Object} [options=undefined] - Additional options for the new instance.
     *      @param {Boolean} [options.throwErrors=true] - Flag that indicates wether errors are thrown at the end of an interpolation-process. If this flag is `false` the caller should check the .errors-arrays.
     *      @param {Boolean} [options.allowUndefined=true] - If this flag is `false` an error is added if the result of a macro is `undefined`. If `._throwErrors == true` an error is thrown after all macros are resolved. Defaults to `true`
     *      @param {MacroSymbols} [options.symbols] - An optional object that contains all or some of the [MacroSymbols](#macrosymbols).properties to override the defaultSymbols.
     */
    constructor(repositories = undefined, options = undefined) {
        if (repositories) this.registerRepository(repositories)

        // Make a copy of the static object to be able to change
        //  only the values of this instance.
        this._usedSymbols = Object.assign(
            {},
            // copy the defaults
            MacroInt.defaultSymbols,
            // Override with options.symbols if options is defined (avoid using ?.)
            options && options.symbols
        )

        if (options) {
            if (options.throwErrors !== undefined)
                this._throwErrors = !!options.throwErrors
            if (options.allowUndefined !== undefined)
                this._allowUndefined = !!options.allowUndefined
        }
    }

    /**
    * Internal function that resolves all macros in the provided expression-string.
    *
    * If the whole expression is one macro then the result can of be any type.
    * Otherwise macros are converted to strings and inserted in the expression.
    *
    * @private
    * @param {String} expression - The string which's macros will be interpolated.
    + @return {*} The interpolated expression.
    */
    _interpolate(expression) {
        this._completeExpression = expression
        this._currentExpression = undefined

        const macroPartsStack = []
        const symbols = this._usedSymbols
        // define constants for the character-codes of the symbols' first
        //  character to be able to make a fast-check before comparing the
        //  the whole symbol
        const escapeCharCode = 92 // "\\".charCodeAt(0)
        const modifierSeparatorCode = symbols.modifierSeparator.charCodeAt(0)
        const macroBeginCode = symbols.macroBegin.charCodeAt(0)
        const macroEndCode = symbols.macroEnd.charCodeAt(0)

        let charCode, charIndex, partStartIndex
        let macroKey, macroParts, macroValue
        let startIndex = -1
        let foundModifiers = []

        /**********************************************************************
         * Adds everything between the partStartIndex and the charIndex
         * @private
         * @param {Number} symbolLength - Defines the number of characters to skip
         */
        function __appendNewPart(symbolLength) {
            let newPart = expression.substring(partStartIndex, charIndex).trim()

            if (macroKey == undefined) {
                // `.symbols.modifierParamSeparator` is not supported for the macro-part
                macroKey = newPart
            } else if (newPart) {
                const index = newPart.indexOf(symbols.modifierParamSeparator)
                let params
                if (index > -1) {
                    params = newPart
                        .substring(
                            index + symbols.modifierParamSeparator.length
                        )
                        .trim()
                    // reassign the part before the parameters
                    newPart = newPart.substring(0, index).trim()
                }
                foundModifiers.push({ key: newPart, params: params })
            }
            partStartIndex = charIndex + symbolLength
        }
        //---------------------------------------------------------------------

        // Use a for-loop over every single character(-code) instead of a regex-handler
        //  because we want to be able to have _nested_ macros, escaped characters,...
        for (charIndex = 0; charIndex < expression.length; charIndex++) {
            charCode = expression.charCodeAt(charIndex)

            if (charCode === escapeCharCode) {
                // Escape a character
                // -> Remove the escape-char itself ("\").
                // -> therefor charIndex points to the escaped character itself
                // -> With the next "for" it gets incremented and points to the character after the escaped character
                expression =
                    expression.substring(0, charIndex) +
                    expression.substring(charIndex + 1)
                //
            } else if (charCode === modifierSeparatorCode) {
                if (
                    startIndex > -1 &&
                    expression.substring(
                        charIndex,
                        charIndex + symbols.modifierSeparator.length
                    ) === symbols.modifierSeparator
                )
                    // A new part of a macro-expression
                    __appendNewPart(symbols.modifierSeparator.length)
            } else if (charCode === macroBeginCode) {
                if (
                    expression.substring(
                        charIndex,
                        charIndex + symbols.macroBegin.length
                    ) === symbols.macroBegin
                ) {
                    // Start a new macro expression

                    // If we are already in a macro push that macro-information to the stack
                    if (startIndex > -1) {
                        macroPartsStack.push({
                            partStartIndex: partStartIndex,
                            startIndex: startIndex,
                            macroKey: macroKey,
                            foundModifiers: foundModifiers,
                        })
                    }
                    foundModifiers = [] // Create a new array!

                    partStartIndex = charIndex + symbols.macroBegin.length // start of the next part of a macro
                    startIndex = charIndex // start of the macro-expression
                    macroKey = undefined // the macro-expression (part before the first | or the complete macro)

                    // Skip the start-indicator (-1 because the for() adds 1 in the next loop)
                    charIndex = partStartIndex - 1
                }
            } else if (charCode === macroEndCode) {
                if (
                    startIndex > -1 && // only if we are in a macro
                    expression.substring(
                        // finally test the complete indicator
                        charIndex,
                        charIndex + symbols.macroEnd.length
                    ) === symbols.macroEnd
                ) {
                    // Add the remaining string as a "part"
                    __appendNewPart(symbols.macroEnd.length)

                    // Transfer additional information
                    this._currentExpression = expression.substring(
                        startIndex,
                        partStartIndex
                    )
                    this._isOneMacro = this._currentExpression === expression
                    this._hasConstant = false

                    // Resolve the macro itself
                    macroValue = this.getValue(macroKey)
                    // Apply/Exec all modifiers
                    macroValue = this._execModifiers(foundModifiers, macroValue)

                    if (macroValue === undefined && !this._allowUndefined)
                        // Add the error-message and don't replace the macro
                        this.addError("macro-value is undefined.")
                    else if (this._isOneMacro)
                        // if the whole expression is one macro then return the value as it is
                        return macroValue
                    else {
                        if (macroValue === undefined)
                            macroValue = symbols.resultForUndefinedValues
                        else if (typeof macroValue !== "string")
                            macroValue = "" + macroValue

                        // Insert the resolved macro into the Expression
                        expression =
                            expression.substring(0, startIndex) +
                            macroValue +
                            expression.substring(partStartIndex)

                        // If the replacement contains a macro scan the just
                        // replaced macro again otherwise continue scanning
                        // after the replaced macro.
                        charIndex =
                            startIndex +
                            (macroValue.includes(symbols.macroBegin)
                                ? -1
                                : macroValue.length - 1)
                    }

                    macroParts = macroPartsStack.pop()
                    if (macroParts) {
                        partStartIndex = macroParts.partStartIndex
                        startIndex = macroParts.startIndex
                        macroKey = macroParts.macroKey
                        foundModifiers = macroParts.foundModifiers
                    } else {
                        macroKey = undefined // Important for appendNewPart()
                        startIndex = -1 // Not in a macro anymore
                    }
                }
            } // macro-end character found
        } // for expressionIndex...

        this._currentExpression = undefined
        return expression
    }

    /**
     * Internal function to iterate through all found modifiers of a macro and
     * execute the according callback.
     * (It's a separate function because it's used in the tests directly.)
     * @private
     * @param {FoundModifier[]} foundModifiers - the current value of the interpolated macro.
     * @param {*} macroValue - the current value of the interpolated macro.
     * @returns {*} the new MacroValue after executing all found modifiers.
     */
    _execModifiers(foundModifiers, macroValue) {
        // Execute all found modifiers
        for (let i = 0, len = foundModifiers.length; i < len; i++) {
            const found = foundModifiers[i]
            const searchKey = found.key.toLowerCase()

            // Is the modifier registered?
            if (MacroInt._modifiers.hasOwnProperty(searchKey))
                // The value that's assigned to the modifier-searchKey is the callback
                macroValue = MacroInt._modifiers[searchKey](
                    this,
                    macroValue,
                    found.params
                )
            // If we get here no modifier could be found.
            else this.addError(`Unknown modifier "${found.key}"`)
        }
        return macroValue
    }

    /**
     * Interpolate the macros in the given 'expression`.
     *
     * @param {String|Object|Array} expression - String with macros or an object that may have properties that contain macros to interpolate.
     * @param {Object} [options=undefined] - Options for the resolving-process (only valid if expression is a object/array):
     *    @param {String[]} [options.exclude] - Optional array of property-names that should not be handled (at any level).
     *    @param {Array.<{path: string, property: string}>} [options.include]    Optional array to define that only specified `property` in a `path` should be
     *                                      evaluated. All other elements not in the given path are still evaluated.
     * @throws {Error} if either options are provided with a string-expression or the options contain unknown options.
     * @throws {Error} with all the errors if _throwErrors==true and an error occured.
     * @return {String|Object|Array} Returns the given `expression`-object or the resolved string (after resolving all macros)
     * @See macroKey
     * @see modifier
     * @example
     * ```js
     * macroInt = new MacroInt({
     *     what: "Universe",
     *     number: 42,
     *     foo: "FOO",
     *     bar: "12345",
     * })
     * str = macroInt.resolve("Hello ${what}! The answer is ${number}.")
     * console.log(str) // => Hello Universe! The answer is 42.
     *
     * // Interpolate an object
     * config = {
     *     foo: "${foo}",
     *     child: {
     *         baz: "${bar | default: '-1'| toNumber}",
     *         num: "${number}",
     *         what: "${what}",
     *     },
     * }
     * macroInt.resolve(config)
     * console.dir(config) // => {foo: 'FOO', child: {baz: 12345, num: 42, what: "Universe"}}
     * ```
     */
    resolve(expression, options = undefined) {
        // Note: The function is very huge but it was intended to be as fast as
        // possible so splitting in multiple functions was avoided

        // Reset the errors if they were most likely thrown/shown already
        if (this._throwErrors) {
            this.errors.length = 0
        }

        if (typeof expression == "object") {
            const knownOptions = ["exclude", "include"]
            if (options) {
                Object.keys(options).forEach((key) => {
                    if (!knownOptions.includes(key))
                        throw `resolve.options: unknown option "${key}")`
                })
            }
            const optionsInclude = options ? options.include : undefined
            const optionsExclude = options ? options.exclude : undefined

            const $this = this // needed to access the <this> inside the nested functions
            const handledObjects = []

            /******************************************************************
             * Because the initially used `structuredClone` isn't supported by
             * all browsers yet this function was built.
             * The function only copies supports arrays and std. objects.
             */
            function __copyObject(template, current) {
                // Create a new array if the template is a array, an object otherwise
                const result = Array.isArray(template)
                    ? Object.assign([], template, current)
                    : Object.assign({}, template, current)

                // Need something compatible to array and object - avoid using
                //  Object.entries because its introduced with ES 2016
                for (let key in result) {
                    // its unlikely so access property if necessary twice
                    if (typeof result[key] === "object")
                        result[key] = __copyObject(result[key])
                }
                return result
            }

            /******************************************************************
             * Copy all missing properties from the template to the value-object
             * @private
             * @param {Object} template
             * @param {Object} destination
             */
            function __processTemplate(template, destination) {
                let templateValue, destinationValue

                // Works for array-elements and object-properties
                for (const templateKey in template) {
                    templateValue = template[templateKey]
                    destinationValue = destination[templateKey]

                    if (
                        destinationValue === undefined ||
                        typeof destinationValue === "object"
                    ) {
                        // property from the template doesn't exist in the result
                        // Don't use complex objects directly.
                        destination[templateKey] =
                            typeof templateValue === "object"
                                ? __copyObject(templateValue, destinationValue)
                                : templateValue
                    }
                }
            }

            /******************************************************************
             * Handle all properties of an object or all array-elements.
             * (Need to check (typeof obj === 'object') _before_ calling this function!)
             * @private
             * @param {Object|Array} obj
             */
            function __traverseProperties(obj) {
                // Avoid recursive handling of objects
                if (handledObjects.includes(obj)) {
                    return
                }
                handledObjects.push(obj)

                // If there are Include-Keys defined search if there is one for
                // the current path and store it in 'optionsIncludeKey'
                let optionsIncludeKey = undefined
                if (optionsInclude) {
                    const searchPath = $this._propertyPath.join(".")
                    for (let i = 0, len = optionsInclude.length; i < len; i++) {
                        if (optionsInclude[i].path === searchPath) {
                            optionsIncludeKey = optionsInclude[i].property
                            break
                        }
                    }
                }

                // Get the template if there is one defined for the current path.
                // Use a separate call because the template could be after one
                // of the other siblings.
                const siblingsTemplate =
                    obj[$this._usedSymbols.siblingsTemplateKey]

                let value, indexKey
                // Works for array-elements and object-properties
                for (indexKey in obj) {
                    value = obj[indexKey]
                    if (indexKey === $this._usedSymbols.siblingsTemplateKey) {
                        // filter: we already stored it in siblingsTemplate before the for-loop
                    } else if (
                        optionsExclude &&
                        optionsExclude.includes(indexKey)
                    ) {
                        // filter: Exclude defined and contains the key
                    } else if (
                        optionsIncludeKey &&
                        optionsIncludeKey !== indexKey
                    ) {
                        // filter: include defined and it's not the include-key
                    } else if (typeof value === "string") {
                        // Fast check because we assume that not every string is a or contains a macro.
                        if (value.includes($this._usedSymbols.macroBegin)) {
                            $this._propertyPath.push(indexKey)

                            // try to interpolate the value
                            const result = $this._interpolate(value)
                            obj[indexKey] = result
                            if (typeof result == "object")
                                __traverseProperties(result)

                            $this._propertyPath.pop()
                        }
                    } else if (typeof value === "object") {
                        // recursive call of traverse
                        $this._propertyPath.push(indexKey)

                        // Copy all missing properties from the $template-object
                        // remark: This can't happen if config is an array!
                        if (siblingsTemplate) {
                            __processTemplate(siblingsTemplate, value)
                        }

                        __traverseProperties(value)
                        $this._propertyPath.pop()
                    }
                }
            } // __traverseProperties
            //-----------------------------------------------------------------

            // Start recursive call
            __traverseProperties(expression)
        } else if (typeof expression == "string") {
            if (options)
                throw `resolve: options are only valid with object-parameters.`

            expression = this._interpolate(expression)
        }

        if (this._throwErrors && this.errors.length)
            throw this._formatErrors("\n  ")
        return expression
    }

    /**
     * Retrieves the value for the given [macroKey](#macroKey).
     *
     * The given `macroKey` can be a delimited string (embedded in one of the
     * std. JS delimiters "'`), reference to the parent path in the object-tree
     * or a key-value that's searched the registered repositories.
     *
     * This function is internally used during the iteration, and it's used in
     * the default-modifier. So it can be used in other modifiers as well.
     *
     * @param {string|undefined} macroKey - A string which's replacement-value is to be retrieved.
     * @return {*} result-value for the given key
     * @see macroKey
     */
    getValue(macroKey) {
        if (typeof macroKey !== "string") return macroKey

        if (this._hasConstant)
            this.addError(
                "Unused modifier-value after constant value.",
                macroKey
            )

        const charCode = macroKey.charCodeAt(0)
        // It's faster to have the 3 string separators tested individually
        if (charCode === 96) {
            // '`'
            if (macroKey.charCodeAt(macroKey.length - 1) === charCode) {
                this._hasConstant = true
                return macroKey.substring(1, macroKey.length - 1)
            }
        } else if (charCode === 34) {
            // '"'
            if (macroKey.charCodeAt(macroKey.length - 1) === charCode) {
                this._hasConstant = true
                return macroKey.substring(1, macroKey.length - 1)
            }
        } else if (charCode === 39) {
            // "'"
            if (macroKey.charCodeAt(macroKey.length - 1) === charCode) {
                this._hasConstant = true
                return macroKey.substring(1, macroKey.length - 1)
            }
        } // string

        // A reference to a key in the object-property-path to this macro
        else if (
            // fast check for the first character
            charCode === this._usedSymbols.propertyPathIndicator.charCodeAt(0)
        ) {
            // check complete match
            if (macroKey.startsWith(this._usedSymbols.propertyPathIndicator)) {
                this._hasConstant = true
                const completeStr = macroKey.substring(
                    this._usedSymbols.propertyPathIndicator.length
                )
                const pathIndex = Number(completeStr)
                if (isNaN(pathIndex)) {
                    this.addError(
                        "Invalid property-path-index. The index must be a number.",
                        completeStr,
                        macroKey
                    )
                    return undefined
                }
                const pathLen = this._propertyPath.length

                // -1 is the current key(-name) itself, -2 = the parent of the current,...
                // negative: count backwards from the end
                // positive: count from item 0 to length-1
                const result =
                    this._propertyPath[
                        pathIndex < 0 ? pathLen + pathIndex : pathIndex
                    ]
                if (result === undefined) {
                    this.addError(
                        "Invalid property-path-index." +
                            (pathLen == 0 ? " Path is empty." : ""),
                        completeStr,
                        macroKey
                    )
                    return undefined
                }
                return result
            }
        } // propertyPath

        // Evaluate with the help of the repositories
        let result
        const splitMacroKey = macroKey.split(".")

        let repository
        for (let i = 0, len = this._repositories.length; i < len; i++) {
            repository = this._repositories[i]
            // Handle depending on the type of repository
            if (typeof repository === "function") {
                result = repository(macroKey, this)
            } else if (splitMacroKey.length == 1) {
                // No path but only a simple key
                result = repository[macroKey]
            } else {
                // Iterate through the path (like a tree). Starting at the root of the repository
                result = repository
                for (const property of splitMacroKey) {
                    result = result[property]
                    // No sub-object with the partial pathname
                    if (result == undefined) break
                }
            }
            if (result !== undefined) break
        } // repos.find()
        return result
    }

    /**
     * Checks wether a value is undefined or if value is a string if it contains
     * the value of symbols.resultForUndefinedValues.
     *
     * Notice: Works for strings only if the `.resultForUndefinedValue` property is not
     * set to an empty string ("")
     *
     * @param {*} value - The value to be tested
     * @return {Boolean} `true` if the `value` is undefined ot contains the undefined-string
     * @private
     */
    isUndefined(value) {
        return (
            value === undefined ||
            (typeof value === "string" &&
                value.includes(this._usedSymbols.resultForUndefinedValues))
        )
    }

    /**
     * Register one or more (additional) repositories.
     *
     * @param {Repository|Repository[]} repositories - A single [repository](#repository) or an array of repositories.
     * @chainable
     * @return {this} Reference to the current MacroInt-instance.
     */
    registerRepository(repositories) {
        if (!Array.isArray(repositories)) {
            this._repositories.push(repositories)
        } else {
            repositories.forEach((repo) => this._repositories.push(repo))
        }
        return this
    }

    /**
     * Register a modifier.
     *
     * @param {String|String[]} keyWords - A single name or an array of names that can be used as a keyword for the modifier inside of a macro.
     * @param {ModifierCallback} callback - A function that's called if the modifier was found in the macro.
     * @chainable
     * @see ModifierCallback
     * @return {this} Reference to the MacroInt-class.
     * @throws {TypeError} if the callback is not a function.
     * @throws {Error} if another modifier has already one of the new keywords registered.
     * @example
     * ```js
     * // Reverse the result-string
     * const modifierCallback = function (macroInt, macroValue) {
     *     if (typeof macroValue == "string") {
     *         macroValue = macroValue.split("").reverse().join("")
     *     }
     *     return macroValue
     * }
     * MacroInt.registerModifier(["reverse", "-r"], modifierCallback)
     * console.log(new MacroInt({ macro: "Hello" }).resolve("${macro | -r}"))  // ==> olleH
     * ```

     */
    static registerModifier(keyWords, callback) {
        // Force array (use a new variable because parameter-type-definition doesn't fit to the actual usage as a array)
        const words = typeof keyWords == "string" ? [keyWords] : keyWords

        if (!callback || typeof callback !== "function")
            throw TypeError(
                "Invalid callback-parameter. Callback must be a function."
            )

        // Test wether one of the new keyWords is already in the registered items
        words.forEach((keyWord) => {
            keyWord = keyWord.toLowerCase()
            if (this._modifiers.hasOwnProperty(keyWord))
                throw `Error in Modifiers.register("${words.join()}"). The name "${keyWord}" is already registered.`

            // finally register
            this._modifiers[keyWord] = callback
        })
        return this
    }

    /**
     * Remove a previously registered modifier.
     *
     * @param {String|String[]} keyWords - A keyword or an array of keyWords that was used to register the modifier. To remove a modifier completely every keyword used to register the modifier has to be removed separately.
     * @return {Boolean} `true` if the repository could be found and deleted. `false` otherwise.
     * @example
     * ```js
     * MacroInt.registerModifier("test1", () => {return "test1")})
     * MacroInt.registerModifier(["test2"], () => {return  "test2")})
     * MacroInt.registerModifier(["test3", "-t3"], () => {return "test3")})
     * MacroInt.registerModifier(["test4", "-t4"], () => {return "test3")})
     * ...
     * MacroInt.unregisterModifier("test1")
     * MacroInt.unregisterModifier(["test2"])
     * MacroInt.unregisterModifier(["TEST3", "-t3"])
     * MacroInt.unregisterModifier("test4")
     * MacroInt.unregisterModifier("-t4")
     * ```
     */
    static unregisterModifier(keyWords) {
        // Force array (use a new variable because parameter-type-definition doesn't fit to the actual usage as a array)
        const words = typeof keyWords == "string" ? [keyWords] : keyWords
        let result = false
        words.forEach((keyWord) => {
            keyWord = keyWord.toLowerCase()
            if (this._modifiers.hasOwnProperty(keyWord)) {
                delete this._modifiers[keyWord]
                result = true
            }
            return result
        })
    }

    /**
     * Checks if the current macro is exactly equal to the complete (last) initial expression.
     *
     * Used to determine wether a macro-result can be something other than a string.
     *
     * @return {Boolean} `true' if it's one macro; false otherwise
     */
    isOneMacro() {
        return this._isOneMacro
    }

    /**
     * Adds an error to the `errors`-array.
     *
     * @param  {...string} msgs - All parameters are added as a formatted string to the errors-array.
     * @return {void}
     */
    addError(...msgs) {
        // Automatically adds the currently executed macro-expression and the complete
        // initial expression.
        if (this._currentExpression !== undefined)
            msgs.push(this._currentExpression)
        if (this._completeExpression !== undefined)
            msgs.push(this._completeExpression)

        const filtered = []
        msgs.forEach((element) => {
            if (element && !filtered.includes(element)) filtered.push(element)
        })
        let result = filtered.join(" <== ")
        // Add the property-path if it's not empty
        if (this._propertyPath.length > 0)
            result += `  (@Property: ${this._propertyPath.join(".")})`
        this.errors.push(result)
    }

    /**
     * Formats the given array with a title and a list of all array-elements.
     *
     * The function is used to format the `.errors` arrays.
     * If the array is empty only the title and the constant "<>" is returned.
     *
     * @private
     * @param {String} [lineOffset="\n  "] - String that's set before the title and every list-item. By default the offset contains a line-break before every line.
     * @return {String}
     */
    _formatErrors(lineOffset = "\n  ") {
        return this.errors.length === 0
            ? `Errors: <none>`
            : (this.errors.length === 1
                  ? "Error: "
                  : `Errors (${this.errors.length}):` + lineOffset + "  ") +
                  this.errors.join(lineOffset + "  ")
    }

    /**
     * Builds a string with all information of the MacroInt.
     *
     * The result includes all properties of the macroInt including
     * the `.errors` formatted as a string.
     *
     * @param {string} [lineOffset] - A String that's set in front of every item/line
     * @return {String}
     */
    toString(lineOffset = "\n  ") {
        return [
            "MacroInt:",
            "Expression: " + this._completeExpression,
            "Current Expression: " + this._currentExpression,
            "Property: " + this._propertyPath.join("."),
            this._formatErrors(lineOffset),
        ].join(lineOffset)
    }
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// register the default-modifiers available for all macroInt-instances
MacroInt.registerModifier(["mandatory", "-m"], (macroInt, macroValue) => {
    // The `mandatory-modifier` checks wether the macro-result is `undefined`.
    //  If it is `undefined` an error is added to the `macroInt.errors`.
    if (macroValue === undefined)
        macroInt.addError("Undefined result for mandatory expression.")
    return macroValue
})

MacroInt.registerModifier(["default", "-d"], (macroInt, macroValue, params) => {
    // Allows to define a default-value if the macro-result is undefined.

    // Call "getValue" in any case to recognize multiple constant values/defaults
    const defValue = macroInt.getValue(params)
    if (macroValue === undefined) macroValue = defValue
    return macroValue
})

MacroInt.registerModifier(["upper", "-u"], (_, macroValue) => {
    // "Converts the macro-result to upper-case if it's a string."
    if (typeof macroValue === "string") macroValue = macroValue.toUpperCase()
    return macroValue
})

MacroInt.registerModifier(["lower", "-l"], (_, macroValue) => {
    // Converts the macro-result to lower-case if it's a string.
    if (typeof macroValue === "string") macroValue = macroValue.toLowerCase()
    return macroValue
})

MacroInt.registerModifier(["emptyArray", "-ea"], (macroInt, macroValue) => {
    // Returns an empty array if the macro-result is undefined. Otherwise it returns an array with the macro-result as it's only entry.
    if (macroInt.isOneMacro())
        return macroValue === undefined ? [] : [macroValue]
    else
        macroInt.addError(
            "'emptyArray'-Modifier can only be used if the whole expression is a macro."
        )
    return macroValue
})

MacroInt.registerModifier(
    ["toNumber", "toNum", "-tn"],
    (macroInt, macroValue, params) => {
        // Converts the macro-result to a number. Params can contain a default-value
        if (typeof macroValue !== "number") {
            let num = Number(macroValue)
            if (isNaN(num))
                if (params) return Number(params)
                else {
                    macroInt.addError(
                        `modifier toNumber: Unable to convert the macro-value "${macroValue}" to a number.`
                    )
                    return 0
                }
            return num
        }
        return macroValue
    }
)

MacroInt.registerModifier(["toBoolean", "toBool", "-tb"], (_, macroValue) => {
    // Converts the macro-result to a boolean.
    if (typeof macroValue === "string")
        return (
            macroValue.toLowerCase() !== "false" &&
            macroValue !== "0" &&
            Boolean(macroValue)
        )
    else return Boolean(macroValue)
})

module.exports = MacroInt
