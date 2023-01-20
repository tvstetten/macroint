export = MacroInt;
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
 * MacroInt.registerModifier(
 *     ["reverse", "-r"],
 *     (macroInt, macroValue, params) => {
 *         return ("" + macroValue).split("").reverse().join("")
 *     }
 * )
 * const macroInt = new MacroInt({ macro: "Hello" })
 * console.log(macroInt.resolve("${macro | -r}")) // expected: olleH
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
 * The `MacroSymbols` used by `MacroInt` can be modified by either change
 * the static MacroInt.defaultSymbols (which is **dangerous** because all other
 * modules using `MacroInt` are affected). The other way is to provide an object
 * with some or all of the defined symbols to the options.symbols parameter of
 * the MacroInt-constructor.
 *
 * @property {String} [macroBegin=${] - Indicates the begin of a macro inside of an expression. Must be a non-empty string.
 * @property {String} [macroEnd=}] -  String that indicates the end of a macro inside an expression. Must be a non-empty string.
 * @property {String} [modifierSeparator=\|] - String that separates the regular macroKey and modifier(s). Must be a non-empty string.
 * @property {String} [modifierParamSeparator=:] - String that's used as a separator between one modifier and it's optional parameters. Must be a non-empty string.
 * @property {String} [propertyPathIndicator=^] - String to identify expressions that will be interpolated with the name of one of the parent-nodes of the current entry. (By default only used if `.resolve` is called with an object-parameter.)
 * @property {String} [siblingsTemplateKey=$template] - String that identifies a property in an object that is used as an template for all siblings [siblings-templates](#siblings-templates) of that entry.
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
 *
 * TODO: Build documentation
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
declare class MacroInt {
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
    private static _modifiers;
    /**
     * Static variable with the defaults for all symbols that are used to identify the various parts of the macro-interpolation.
     * This object can be used to change identifier(s) globally for all future instances of MacroInt.
     *
     * @type {MacroSymbols}
     */
    static defaultSymbols: MacroSymbols;
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
     * MacroInt.registerModifier(
     *     ["reverse", "-r"],
     *     (macroInt, macroValue, params) => {
     *         return ("" + macroValue).split("").reverse().join("")
     *     }
     * )
     * const macroInt = new MacroInt({ macro: "Hello" })
     * console.log(macroInt.resolve("${macro | -r}")) // expected: olleH
     * ```
     */
    static registerModifier(keyWords: string | string[], callback: ModifierCallback): any;
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
    static unregisterModifier(keyWords: string | string[]): boolean;
    /**
     * <a name="constructor"></a>
     * @constructor
     * @param {Repository|Repository[]} [repositories=undefined] - A single [repository](#repository) or an array of repositories.
     * @param {Object} [options=undefined] - Additional options for the new instance.
     *      @param {Boolean} [options.throwErrors=true] - Flag that indicates wether errors are thrown at the end of an interpolation-process. If this flag is `false` the caller should check the .errors-arrays.
     *      @param {Boolean} [options.allowUndefined=true] - If this flag is `false` an error is added if the result of a macro is `undefined`. If `._throwErrors == true` an error is thrown after all macros are resolved. Defaults to `true`
     *      @param {MacroSymbols} [options.symbols] - An optional object that contains all or some of the [MacroSymbols](#macrosymbols).properties to override the defaultSymbols.
     */
    constructor(repositories?: Repository | Repository[], options?: {
        throwErrors?: boolean;
        allowUndefined?: boolean;
        symbols?: MacroSymbols;
    });
    /**
     * Instance-variable that gets initialized with a copy of the static
     * MacroInt.defaultSymbols.
     *
     * @private
     * @type {MacroSymbols}
     */
    private _usedSymbols;
    /**
     * Array with the registered repositories.
     * @private
     * @type {Repository[]}
     * @see registerRepository()
     */
    private _repositories;
    /**
     * The complete, currently handled original macro-expression. Used for
     * documentation purposes in errors and .toString().
     * @private
     * @type {String|undefined}
     * */
    private _completeExpression;
    /**
     * The current expression step by step modified during the interpolation
     * @private
     * @type {String|undefined}
     */
    private _currentExpression;
    /**
     * Defines if the current expression is exactly one macro
     * @private
     * @type {Boolean}
     */
    private _isOneMacro;
    /**
     * Flag that indicates that there was already a constant
     * value in the current macro
     * @private
     * @type {Boolean}
     */
    private _hasConstant;
    /**
     * Current path to the property (used in resolve() with object-parameter)
     * e.g. `my.object.path --> ["my", "object", "path"]`
     * @private
     * @type {string[]}
     * */
    private _propertyPath;
    /**
     * If this flag is `false` an error is added if the result of a macro is
     * `undefined`. See the [Error-Handling](#error-handling) chapter.
     *  Default: `true`
     * @private
     * @type {Boolean} [=true]
     * @see Error-Handling
     */
    private _allowUndefined;
    /**
     * Flag that indicates wether errors are thrown at the end of an
     * interpolation-process. If this flag is `false` the caller should check
     * the .errors-arrays.
     * @private
     * @type {Boolean}
     * @see Error-Handling
     */
    private _throwErrors;
    /**
     * Array that contains errors that occured during the last call of .resolve().\
     * See the chapter about the [Error-Handling](#error-handling) for details.
     * @type {String[]}
     * @see Error-Handling
     */
    errors: string[];
    /**
    * Internal function that resolves all macros in the provided expression-string.
    *
    * If the whole expression is one macro then the result can of be any type.
    * Otherwise macros are converted to strings and inserted in the expression.
    *
    * Plan:
    *   "${'hello'}_${par${'ent'}${'1'}_${'macro'}}" =>> "hello_${parent1_macro}" =>> hello_Parent1_Macro
    *
    *    ${ : macroResult += expression.substring(lastExpressionIndex, charIndex-1) = "" + ""
    *       : push status to stack && reset status
    *       : macroResult = ""
    *             } : macroResult += expression.substring(lastExpressionIndex, charIndex-1) === ""
    *               : resolve => macroResult += "hello" === "hello"
    *               : pop stack
    *               : macroResult += stack.macroResult + macroResult  === "hello"
    *              _ : skip
    *               ${ : macroResult += expression.substring(lastExpressionIndex, charIndex-1) === "hello" + "_"
    *                  : push status to stack && reset status
    *                  : macroResult = ""
    *                    ${ : add to macroPartsStack, lastExpressionIndex=charIndex, macroResult = ""
    *                       : push status to stack && reset status
    *                       : macroResult = ""
    *                         macroResult += expression.substring(lastExpressionIndex, charIndex-1) = "" + "par"
    *                           } : macroResult += expression.substring(lastExpressionIndex, charIndex-1) === ""
    *                             : resolve => macroResult += "hello" === "hello"
    *                             : pop stack
    *                             : macroResult += stack.macroResult + macroResult  === "hello"
    *                           } : resolve, add to macroResult (="par" + "ent")
    *                               pop from macroPartsStack
    *                               ? What shall I do with the macroResult and poped-macroResult & macroKey
    *                            ${ : add to macroPartsStack, lastExpressionIndex=charIndex, macroResult = ""
    *                                 macroResult += expression.substring(lastExpressionIndex, charIndex-1) = "1"
    *                                 } : resolve, add to macroResult (="par" + "ent")
    *                                     pop from macroPartsStack
    *                                     ? What shall I do with the macroResult and poped-macroResult & macroKey
    *                                   ${ : add to macroPartsStack, lastExpressionIndex=charIndex, macroResult = ""
    *                                        macroResult += expression.substring(lastExpressionIndex, charIndex-1) = "par1" + "par"
    *                                            } : resolve, add to macroResult (="par" + "ent")
    *                                                pop from macroPartsStack
    *                                                ? What shall I do with the macroResult and poped-macroResult & macroKey
    *                                             } : resolve, add to macroResult (="par" + "ent")
    *                                                 pop from macroPartsStack
    *                                                 ? What shall I do with the macroResult and poped-macroResult & macroKey
    *
    *
    * @private
    * @param {String} expression - The string which's macros will be interpolated.
    + @return {*} The interpolated expression.
    */
    private _interpolate;
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
    resolve(expression: string | any | any[], options?: {
        exclude?: string[];
        include?: Array<{
            path: string;
            property: string;
        }>;
    }): string | any | any[];
    /**
     * Retrieves the value for the given [macroKey](#macrokey).
     *
     * The given `macroKey` can be a delimited string (embedded in one of the
     * std. JS delimiters "'`), reference to the parent path in the object-tree
     * or a key-value that's searched the registered repositories.
     *
     * This function is internally used during the iteration, and it's used in
     * the default-modifier. So it can be used in other modifiers as well.
     *
     * @param {string|undefined} macroKey - A string which's replacement-value is to be retrieved.
     * @param {boolean} [assumeString=false] - Define whether the macroKey is returned as a it is if the value could not be found in the repositories
     * @return {*} result-value for the given key
     * @see macroKey
     */
    getValue(macroKey: string | undefined, assumeString?: boolean): any;
    /**
     * Register one or more (additional) repositories.
     *
     * @param {Repository|Repository[]} repositories - A single [repository](#repository) or an array of repositories.
     * @chainable
     * @return {this} Reference to the current MacroInt-instance.
     */
    registerRepository(repositories: Repository | Repository[]): this;
    /**
     * Checks if the current macro is exactly equal to the complete (last) initial expression.
     *
     * Used to determine wether a macro-result can be something other than a string.
     *
     * @return {Boolean} `true' if it's one macro; false otherwise
     */
    isOneMacro(): boolean;
    /**
     * Adds an error to the `errors`-array.
     *
     * @param  {...string} msgs - All parameters are added as a formatted string to the errors-array.
     * @return {void}
     */
    addError(...msgs: string[]): void;
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
    private _formatErrors;
    /**
     * Builds a string with all information of the MacroInt.
     *
     * The result includes all properties of the macroInt including
     * the `.errors` formatted as a string.
     *
     * @param {string} [lineOffset] - A String that's set in front of every item/line
     * @return {String}
     */
    toString(lineOffset?: string): string;
}
declare namespace MacroInt {
    export { ModifierCallback, FoundModifier };
}
type ModifierCallback = (macroInt: MacroInt, macroValue: any, parameters: string | undefined) => any;
/**
 * FoundModifier-Object is the object-format of the elements of the array of modifiers found in a macro.
 */
type FoundModifier = {
    key: string;
    params: string | undefined;
};
