# Macroint ![Node,js CI](https://github.com/tvstetten/macroint/actions/workflows/Node%20js%20CI.yml/badge.svg)
> Interpolate Macros in Strings, Object-Properties and Array-Elements.\
> Version 0.3.0

## TOC
* [Overview](#overview)
* [Introduction](#introduction)
* [Details and Concepts](#details-and-concepts)
  *  [macroKey](#macrokey)
  *  [Modifier](#modifier)
  *  [ModifierCallback](#modifiercallback)
  *  [Error-Handling](#error-handling)
  *  [Repository](#repository)
  *  [MacroSymbols](#macrosymbols)
  *  [Siblings-Templates](#siblings-templates)
* [API Documentation](#api-documentation)

## Overview

- Interpolate and resolve macro-expressions in strings, object-property-values and array-elements.
- Macros can be extended with modifiers that allow checking and/or modifying the macro-result.
- There are pre-defined modifiers like 'mandatory', 'default', 'upper',...
- Additional custom modifiers can be registered.
- Multiple sources to resolve macros (Repositories) simultaneously.
- Repositories can also be callbacks to implement decryption, db-access, fault-access,...
- Macros can contain macros (to build the macro-value).
- If resolving objects macros can access the path to the current property.
- If used with objects property-templates can be defined. All siblings of it are filled with all missing properties of the template.
- All indicators for the macro, the separator for modifiers, and other special functions can be customized.

<br><a name="Installation"></a>

## Installation

```sh
npm install macroint
```

<br><a name="Introduction"></a>

## Introduction

MacroInt is a class that can interpolate macro-expressions in strings,
object-properties and Array-elements.

Macros-expressions are strings (or part of strings) that have the format:

```js
${<macroKey> [ | <modifier>[:<modifier-option>] [ | <modifier> [ |...]]]}
```

The <[macroKey](#macrokey)> is (usually) replaced with the value of a property of
the same name of a [Repository](#repository).
<[Modifiers](#modifier)> provide additional functionality.
Macros can be mixed with "normal Text". One string can contain an unlimited number
of macros. Macros can include embedded macros to build a macroKey from other macros.

### Basic examples

```js
const MacroInt = require("macroint")

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
```

### Macros in Object example

MacroInt can also resolve macros in all property-values of an object.
If the value of a property is again an object or array this value is handled
recursively. If the provided object is an array all it's elements are handled.

```js
// Assume we have a .env-file and it was loaded into process.env (e.g. via dotenv-extension).
// (Note: For this example we simulate the .env-file)
process.env.url = "www.github.com"
process.env.user_name = "Tom"

// Instead of providing the repository to the constructor register it separately.
mi = new MacroInt()
ml.registerRepository(process.env)

config = {
    url: "${url}",
    user: "${user_name}",
    options: {
        id: "${id | default: '-1'| toNumber}",
    },
}
mi.resolve(config)
console.log(config) // {url: 'www.github.com', user: 'Tom', options: { id: -1 }}
```

* * *

# Details and Concepts

You can use MacroInt and it's main method .resolve() without knowing about the 
details and extended possibilities by just studying the above examples. But to 
get the best out of the this module the following chapters are very useful.

<br><a name="macroKey"></a>

## macroKey
A macroKey is that part of a macro that will be interpolated to a result-value.
It can be one of the following:

1. A key-value (without any string-delimiters) that will be searched in the
   provided [Repositories](#repository)) or passed to the registered
   [RepositoryCallbacks](#repositorycallback)). This is the default if the
   `macroKey` is non of the following types. If key-value can't be
   resolved/found `undefined` is returned.

2. A String enclosed in string-delimiters (one of the three " ' \` ). The
   content of the string is returned as the result of the macro. This
   string-constants are useful to define default-values in the `default`-modifier.

3. A ^-symbol followed by a number. This is used to access the name of a
   property in the path to the current property. This feature is only useful
   if an object/array is to be resolved. Normally this feature is especially
   useful together with the [siblings-templates](#siblings-templates).\
   `parent.child.key = "\${^-1}"` --> "key"\
   `parent.child.key = "\${^-2}"` --> "child"\
   `parent.child.key = "\${^-3}"` --> "parent"\
   `parent.child.key = "\${^0}"` --> "parent"\
   `parent.child.key = "\${^1}"` --> "child"\
   `parent.child.key = "\${^2}"` --> "key"\



<br><a name="Modifier"></a>

## Modifier
Modifiers are keywords that have a function assigned [modifierCallback](#modifiercallback).
Modifiers can have a unlimited number of alias-names (e.g. long- and short-name).
The modifier-keywords are **case-insensitive**. An unlimited number of modifiers
can be applied to every macro. One modifier can be used multiple times in one
macro (e.g. the "default"-modifier).\
\
Custom additional modifiers can be added via the static `MacroInt.registerModifier()`
and removed with `MacroInt.unregisterModifier()`.\
\
There are a couple of modifiers predefined. All predefined modifiers have at
least one full-name and one short alias with a leading "-" plus one or two
characters (e.g. `default` and `-d`).\


The following modifiers are pre-defined:


### _default:\<macroKey> / -d:\<macroKey>_
This modifier defines a default in case the result of the macro is still
`undefined`. The default-value after the `:` can be any <[macroKey](#macrokey)>.

### _mandatory / -m_
This modifier defines that the macro-result can't be `undefined`. It it is
an error is added to the errors-array. Depending of the throwErrors-flag
(see [Constructor](#constructor)) of the constructor flag a error is thrown
at the end of the resolve-process.
If the allowUndefined-flag == false (see [Constructor](#constructor)) this
modifier has no real function because an error is added for every undefined
result.

### _upper / -u_
This modifier converts the result-string of the macro into an uppercase-string.

### _lower / -l_
This modifier converts the result-string of the macro into an uppercase-string.

### _emptyArray / -ea_
This modifier returns an empty array if the
macro-result is `undefined`. Otherwise it returns an array with the
macro-result as it's only entry.

### _toNumber[:\<default>] / toNum[:\<default>] / -tn[:\<default>]_
Converts the macro-result to a number. If the result is no number the \<default>
is used (converted to a number). If no default is provided an error is added.

### _toBoolean / toBool / -tb_
Converts the macro-result to a boolean value. The strings "false" and "0"
return `false`. All other values are converted using the Boolean(result) function.\

### Examples

```js
mi = new MacroInt({ name: "MacroInt" })

// Convert the result to uppercase (modifier-key: "uppercase" / "-u")
console.log(mi.resolve("${name | upper}")) // => MACROINT

// Use a default in case the macro is undefined (modifier-key: "default" / "-d").
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
```



<br><a name="ModifierCallback"></a>

## ModifierCallback
A ModifierCallback can modify or check the macro-result after the interpolation.

The callback has to return a result. The result is the new macro-result-value,
and either passed to the next modifier or used as the final result of the
interpolation.

To get a better idea of the implementation of a modifier see the implementation
of the default-modifiers.

**See**

- [Modifier](#modifier)
- [MacroInt.registerModifier](#macroint-registermodifier)


| Param | Type | Description |
| --- | --- | --- |
| macroInt | [<code>MacroInt</code>](#MacroInt) | The current macroInt-object. Provides some useful functions like .getValue or addError |
| macroValue | <code>\*</code> | The interpolated current result value of the macro (=result) |
| parameters | <code>String</code> \| <code>undefined</code> | String that contains the parameter(s) that were given to the modifier if any. |

**Example**  
```js
MacroInt.registerModifier(
    ["reverse", "-r"],
    (macroInt, macroValue, params) => {
        return ("" + macroValue).split("").reverse().join("")
    }
)
const macroInt = new MacroInt({ macro: "Hello" })
console.log(macroInt.resolve("${macro | -r}")) // expected: olleH
```


<br><a name="Error-Handling"></a>

## Error-Handling
Errors that are found during the macro interpolation process are collected
in the .errors-array. Javascript errors are still thrown immediately. By
default all found errors are thrown an one error at the end of the resolve-function.\
By setting the constructor-parameter `options.throwErrors=false`. Then the
caller should check the .errors-array manually. This is not recommended.

If the options.throwErrors=true (default) the .errors-array is cleared at
the beginning of every call to .resolve(). If options.throwErrors=false the
array is never cleared and all new errors are added to the existing entries.
(The array can be cleared manually via `<instance>.errors.length = 0`.)

**See**

- [constructor](#constructor)
- [options.throwErrors](#options-throwerrors)
- [options.allowUndefined](#options-allowundefined)



<br><a name="Repository"></a>

## Repository
A repository is used to get the value for a `macroKey`.

Multiple repositories can be assigned to one MacroInt-instance. A repository
can have one of the following types:

### Repository-Object
That's the most common use-case. The object can have properties
  with any depth. To access elements below the root level the key must have
  the full path to the property encoded like "${parent1.parent2.key}".
### RepositoryCallback
A repository-callback is called to resolve the macroKey.
If a Repository is a callback-function that function is called instead of
retrieving property-values from an object-repository.\
The callback returns either the resolved value or `undefined` if the value
could not be resolved.


| Param | Type | Description |
| --- | --- | --- |
| macroKey | <code>String</code> | The keyword that will be searched. |
| macroInt | [<code>MacroInt</code>](#MacroInt) | The MacroInt-object that provides information and helper functions. |



<br><a name="MacroSymbols"></a>

## MacroSymbols
The `MacroSymbols` is an object that has a couple of properties that define
the string-indicators used to identify the different parts of a macro.\
\
The `MacroSymbols` used by `MacroInt` can be modified by either change
the static MacroInt.defaultSymbols (which is **dangerous** because all other
modules using `MacroInt` are affected). The other way is to provide an object
with some or all of the defined symbols to the options.symbols parameter of
the MacroInt-constructor.

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [macroBegin] | <code>String</code> | <code>${</code> | Indicates the begin of a macro inside of an expression. Must be a non-empty string. |
| [macroEnd] | <code>String</code> | <code>}</code> | String that indicates the end of a macro inside an expression. Must be a non-empty string. |
| [modifierSeparator] | <code>String</code> | <code>\|</code> | String that separates the regular macroKey and modifier(s). Must be a non-empty string. |
| [modifierParamSeparator] | <code>String</code> | <code>:</code> | String that's used as a separator between one modifier and it's optional parameters. Must be a non-empty string. |
| [propertyPathIndicator] | <code>String</code> | <code>^</code> | String to identify expressions that will be interpolated with the name of one of the parent-nodes of the current entry. (By default only used if `.resolve` is called with an object-parameter.) |
| [siblingsTemplateKey] | <code>String</code> | <code>$template</code> | String that identifies a property in an object that is used as an template for all siblings [siblings-templates](#siblings-templates) of that entry. |



<br><a name="Siblings-Templates"></a>

## Siblings-Templates
The sibling templates allow the definition of all necessary entries for all sibling-objects.

TODO: Build documentation



* * *

# API Documentation

<br><a name="MacroInt"></a><a name="macroint"></a>

## MacroInt
Class to interpolate macros inclusive modifiers in strings, object-properties 
and array-elements.

**Kind**: global class  

* [MacroInt](#macroint)
    * [new MacroInt([repositories], [options])](#new-macroint-new)
    * _instance_
        * [.defaultSymbols](#macroint-defaultsymbols) : <code>MacroSymbols</code>
        * [.errors](#macroint-errors) : <code>Array.&lt;String&gt;</code>
        * [.resolve(expression, [options])](#macroint-resolve) ⇒ <code>String</code> \| <code>Object</code> \| <code>Array</code>
        * [.getValue(macroKey, [assumeString])](#macroint-getvalue) ⇒ <code>\*</code>
        * [.registerRepository(repositories)](#macroint-registerrepository) ⇒ <code>this</code>
        * [.isOneMacro()](#macroint-isonemacro) ⇒ <code>Boolean</code>
        * [.addError(...msgs)](#macroint-adderror) ⇒ <code>void</code>
        * [.toString([lineOffset])](#macroint-tostring) ⇒ <code>String</code>
    * _static_
        * [.registerModifier(keyWords, callback)](#macroint-registermodifier) ⇒ <code>this</code>
        * [.unregisterModifier(keyWords)](#macroint-unregistermodifier) ⇒ <code>Boolean</code>

<br><a name="new_MacroInt_new"></a><a name="macroint"></a>

###  MacroInt([repositories], [options])
<a name="constructor"></a>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [repositories] | <code>Repository</code> \| <code>Array.&lt;Repository&gt;</code> |  | A single [repository](#repository) or an array of repositories. |
| [options] | <code>Object</code> |  | Additional options for the new instance. |
| [options.throwErrors] | <code>Boolean</code> | <code>true</code> | Flag that indicates wether errors are thrown at the end of an interpolation-process. If this flag is `false` the caller should check the .errors-arrays. |
| [options.allowUndefined] | <code>Boolean</code> | <code>true</code> | If this flag is `false` an error is added if the result of a macro is `undefined`. If `._throwErrors == true` an error is thrown after all macros are resolved. Defaults to `true` |
| [options.symbols] | <code>MacroSymbols</code> |  | An optional object that contains all or some of the [MacroSymbols](#macrosymbols).properties to override the defaultSymbols. |

<br><a name="MacroInt+defaultSymbols"></a><a name="defaultsymbols"></a>

### .defaultSymbols : <code>MacroSymbols</code>
Static variable with the defaults for all symbols that are used to identify the various parts of the macro-interpolation.
This object can be used to change identifier(s) globally for all future instances of MacroInt.

**Kind**: instance property of [<code>MacroInt</code>](#MacroInt)  
<br><a name="MacroInt+errors"></a><a name="errors"></a>

### .errors : <code>Array.&lt;String&gt;</code>
Array that contains errors that occured during the last call of .resolve().\
See the chapter about the [Error-Handling](#error-handling) for details.

**Kind**: instance property of [<code>MacroInt</code>](#MacroInt)  
**See**: [Error-Handling](#error-handling)
<br><a name="MacroInt+resolve"></a><a name="resolve"></a>

### .resolve(expression, [options]) ⇒ <code>String</code> \| <code>Object</code> \| <code>Array</code>
Interpolate the macros in the given 'expression`.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  
**Returns**: <code>String</code> \| <code>Object</code> \| <code>Array</code> - Returns the given `expression`-object or the resolved string (after resolving all macros)  
**Throws**:

- <code>Error</code> if either options are provided with a string-expression or the options contain unknown options.
- <code>Error</code> with all the errors if _throwErrors==true and an error occured.

**See**

- [macroKey](#macrokey)
- [modifier](#modifier)


| Param | Type | Description |
| --- | --- | --- |
| expression | <code>String</code> \| <code>Object</code> \| <code>Array</code> | String with macros or an object that may have properties that contain macros to interpolate. |
| [options] | <code>Object</code> | Options for the resolving-process (only valid if expression is a object/array): |
| [options.exclude] | <code>Array.&lt;String&gt;</code> | Optional array of property-names that should not be handled (at any level). |
| [options.include] | <code>Array.&lt;{path: string, property: string}&gt;</code> | Optional array to define that only specified `property` in a `path` should be                                      evaluated. All other elements not in the given path are still evaluated. |

**Example**  
```js
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
    child: {
        baz: "${bar | default: '-1'| toNumber}",
        num: "${number}",
        what: "${what}",
    },
}
macroInt.resolve(config)
console.dir(config) // => {foo: 'FOO', child: {baz: 12345, num: 42, what: "Universe"}}
```
<br><a name="MacroInt+getValue"></a><a name="getvalue"></a>

### .getValue(macroKey, [assumeString]) ⇒ <code>\*</code>
Retrieves the value for the given [macroKey](#macrokey).

The given `macroKey` can be a delimited string (embedded in one of the
std. JS delimiters "'`), reference to the parent path in the object-tree
or a key-value that's searched the registered repositories.

This function is internally used during the iteration, and it's used in
the default-modifier. So it can be used in other modifiers as well.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  
**Returns**: <code>\*</code> - result-value for the given key  
**See**: [macroKey](#macrokey)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| macroKey | <code>string</code> \| <code>undefined</code> |  | A string which's replacement-value is to be retrieved. |
| [assumeString] | <code>boolean</code> | <code>false</code> | Define whether the macroKey is returned as a it is if the value could not be found in the repositories |

<br><a name="MacroInt+registerRepository"></a><a name="registerrepository"></a>

### .registerRepository(repositories) ⇒ <code>this</code>
Register one or more (additional) repositories.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  
**Chainable**  
**Returns**: <code>this</code> - Reference to the current MacroInt-instance.  

| Param | Type | Description |
| --- | --- | --- |
| repositories | <code>Repository</code> \| <code>Array.&lt;Repository&gt;</code> | A single [repository](#repository) or an array of repositories. |

<br><a name="MacroInt+isOneMacro"></a><a name="isonemacro"></a>

### .isOneMacro() ⇒ <code>Boolean</code>
Checks if the current macro is exactly equal to the complete (last) initial expression.

Used to determine wether a macro-result can be something other than a string.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  
**Returns**: <code>Boolean</code> - `true' if it's one macro; false otherwise  
<br><a name="MacroInt+addError"></a><a name="adderror"></a>

### .addError(...msgs) ⇒ <code>void</code>
Adds an error to the `errors`-array.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  

| Param | Type | Description |
| --- | --- | --- |
| ...msgs | <code>string</code> | All parameters are added as a formatted string to the errors-array. |

<br><a name="MacroInt+toString"></a><a name="tostring"></a>

### .toString([lineOffset]) ⇒ <code>String</code>
Builds a string with all information of the MacroInt.

The result includes all properties of the macroInt including
the `.errors` formatted as a string.

**Kind**: instance method of [<code>MacroInt</code>](#MacroInt)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [lineOffset] | <code>string</code> | <code>&quot;\n  &quot;</code> | A String that's set in front of every item/line |

<br><a name="MacroInt.registerModifier"></a><a name="registermodifier"></a>

### .registerModifier(keyWords, callback) ⇒ <code>this</code>
Register a modifier.

**Kind**: static method of [<code>MacroInt</code>](#MacroInt)  
**Chainable**  
**Returns**: <code>this</code> - Reference to the MacroInt-class.  
**Throws**:

- <code>TypeError</code> if the callback is not a function.
- <code>Error</code> if another modifier has already one of the new keywords registered.

**See**: [ModifierCallback](#modifiercallback)

| Param | Type | Description |
| --- | --- | --- |
| keyWords | <code>String</code> \| <code>Array.&lt;String&gt;</code> | A single name or an array of names that can be used as a keyword for the modifier inside of a macro. |
| callback | <code>ModifierCallback</code> | A function that's called if the modifier was found in the macro. |

**Example**  
```js
MacroInt.registerModifier(
    ["reverse", "-r"],
    (macroInt, macroValue, params) => {
        return ("" + macroValue).split("").reverse().join("")
    }
)
const macroInt = new MacroInt({ macro: "Hello" })
console.log(macroInt.resolve("${macro | -r}")) // expected: olleH
```
<br><a name="MacroInt.unregisterModifier"></a><a name="unregistermodifier"></a>

### .unregisterModifier(keyWords) ⇒ <code>Boolean</code>
Remove a previously registered modifier.

**Kind**: static method of [<code>MacroInt</code>](#MacroInt)  
**Returns**: <code>Boolean</code> - `true` if the repository could be found and deleted. `false` otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| keyWords | <code>String</code> \| <code>Array.&lt;String&gt;</code> | A keyword or an array of keyWords that was used to register the modifier. To remove a modifier completely every keyword used to register the modifier has to be removed separately. |

**Example**  
```js
MacroInt.registerModifier("test1", () => {return "test1")})
MacroInt.registerModifier(["test2"], () => {return  "test2")})
MacroInt.registerModifier(["test3", "-t3"], () => {return "test3")})
MacroInt.registerModifier(["test4", "-t4"], () => {return "test3")})
...
MacroInt.unregisterModifier("test1")
MacroInt.unregisterModifier(["test2"])
MacroInt.unregisterModifier(["TEST3", "-t3"])
MacroInt.unregisterModifier("test4")
MacroInt.unregisterModifier("-t4")
```

# License

MIT License

Copyright (c) 2022-23 Thomas von Stetten tvstetten[at]gmail[dot]com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


