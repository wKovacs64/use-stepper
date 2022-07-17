# use-stepper

_React hook to manage a numeric stepper/spinbutton_

[![npm Version][npm-image]][npm-url] [![Build Status][ci-image]][ci-url]
[![Code Coverage][coverage-image]][coverage-url]
[![semantic-release][semantic-release-image]][semantic-release-url]

## The problem

A numeric stepper or "spinbutton" (decrement button, input, increment button) is
deceptively non-trivial to implement. You have to manage the minimum, the
maximum, the input itself displaying the current value (conceptually numeric,
but ultimately a string in HTML), allowing a user to type freely and hopefully
arrive at a valid number (e.g. "-" is `NaN` but you have to let them type it so
they can get to "-4", so simply parsing their input as a number is
insufficient), interpreting the input's value on blur, etc.

## This solution

This [React][react] [hook][hooks-intro] manages all this for you so you only
have to worry about the styling. It returns the current value, functions for
manual value manipulation, and a collection of [prop getters][kent-prop-getters]
to spread across your form elements to make it all work together. It also
includes the ability to provide your own custom state reducer to enable ultimate
control over what actions like "increment", "decrement", "coerce", etc. mean in
your application.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
- [Basic Options](#basic-options)
  - [defaultValue](#defaultvalue)
  - [step](#step)
  - [min](#min)
  - [max](#max)
- [Advanced Options](#advanced-options)
  - [enableReinitialize](#enablereinitialize)
  - [stateReducer](#statereducer)
    - [Example](#example)
- [Return Value](#return-value)
  - [prop getters](#prop-getters)
  - [state](#state)
  - [setters](#setters)
- [Other Solutions](#other-solutions)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

Using [yarn][yarn]:

```shell
yarn add use-stepper
```

Or, [npm][npm]:

```shell
npm install use-stepper
```

> This package also depends on `react` 16.8.0 or newer. Please make sure you
> have that installed as well.

## Usage

```js
import useStepper from 'use-stepper';

function MyStepper() {
  const { getFormProps, getInputProps, getIncrementProps, getDecrementProps } =
    useStepper();

  return (
    <form {...getFormProps()}>
      <button {...getDecrementProps()}>-</button>
      <input {...getInputProps()} />
      <button {...getIncrementProps()}>+</button>
    </form>
  );
}
```

## Basic Options

The hook accepts an options object as its only parameter. The entries for the
basic options are as follows:

### defaultValue

> `number` | optional, default: `0`

The initial value and the value to use as a fallback upon invalid manual input.

### step

> `number` | optional, default: `1`

The amount by which to increment or decrement the current value.

### min

> `number` | optional, default: `-Number.MAX_VALUE`

The minimum value allowed.

### max

> `number` | optional, default: `Number.MAX_VALUE`

The maximum value allowed.

## Advanced Options

### enableReinitialize

> `boolean` | optional, default: `false`

Controls whether the current value (if unchanged) will update to the new default
if `defaultValue` changes.

### stateReducer

> `function(state: object, action: object): object` | optional

Changes to the state of the hook are applied using React's built-in
[`useReducer`][use-reducer] hook. This function replaces the default reducer
implementation, which allows you to author your own logic to execute when an
action is dispatched. This gives you ultimate control in the event you wish to
constrain the value or otherwise modify the default behavior. It gives you the
current state and the action to execute, and you return the new state.

- `state`: the current state of the hook
- `action`: the action to execute

State is just an object with a `value` key (note: `value` is a string, so it
should be converted to a number before performing mathematical operations on
it).

Actions have a `type` field and an optional `payload` field. The possible action
types are discoverable through `useStepper.actionTypes` (e.g.
`useStepper.actionTypes.increment`). The default reducer is also available at
`useStepper.defaultReducer` in case you want to defer to the default
implementation in some cases (e.g. for the default/unhandled action, perhaps).

#### Example

Constrain the stepper to only use whole numbers:

```js
function IntegerStepper({ min, max, defaultValue }) {
  function validValueClosestTo(desiredNumericValue) {
    return String(Math.min(max, Math.max(desiredNumericValue, min)));
  }

  function integerReducer(state, action) {
    const integerValue = parseInt(state.value, 10);
    switch (action.type) {
      case useStepper.actionTypes.increment: {
        return { value: validValueClosestTo(integerValue + 1) };
      }
      case useStepper.actionTypes.decrement: {
        return { value: validValueClosestTo(integerValue - 1) };
      }
      case useStepper.actionTypes.coerce: {
        if (Number.isNaN(integerValue)) {
          return { value: String(defaultValue) };
        }
        const newValue = validValueClosestTo(integerValue);
        if (newValue !== state.value) {
          return { value: newValue };
        }
        return state;
      }
      default:
        return useStepper.defaultReducer(state, action);
    }
  }

  const { getInputProps, getIncrementProps, getDecrementProps } = useStepper({
    min,
    max,
    defaultValue,
    stateReducer: integerReducer,
  });

  return (
    <>
      <button {...getDecrementProps()}>-</button>
      <input {...getInputProps()} />
      <button {...getIncrementProps()}>+</button>
    </>
  );
}
```

## Return Value

The hook returns an object with the following shape:

| key                 | type     | category                     |
| ------------------- | -------- | ---------------------------- |
| `getFormProps`      | function | [prop getter](#prop-getters) |
| `getInputProps`     | function | [prop getter](#prop-getters) |
| `getIncrementProps` | function | [prop getter](#prop-getters) |
| `getDecrementProps` | function | [prop getter](#prop-getters) |
| `value`             | string   | [state](#state)              |
| `increment`         | function | [setter](#setters)           |
| `decrement`         | function | [setter](#setters)           |
| `setValue`          | function | [setter](#setters)           |

### prop getters

These functions are used to apply props to the elements that you render. This
gives you maximum flexibility to render what, when, and wherever you like. You
call these on the element in question (for example:
`<input {...getInputProps()}`)). It's advisable to pass all your props to that
function rather than applying them on the element yourself to avoid your props
being overridden (or overriding the props returned). For example:
`getInputProps({ onChange: myChangeHandler })`.

| key                 | type         | description                                                                  |
| ------------------- | ------------ | ---------------------------------------------------------------------------- |
| `getFormProps`      | function({}) | returns the props you should apply to the `form` element for submit handling |
| `getInputProps`     | function({}) | returns the props you should apply to the `input` element (includes `value`) |
| `getIncrementProps` | function({}) | returns the props you should apply to the increment `button` element         |
| `getDecrementProps` | function({}) | returns the props you should apply to the decrement `button` element         |

### state

These are the values that represent the internal state of the hook.

| key     | type   | description                      |
| ------- | ------ | -------------------------------- |
| `value` | string | the current value of the stepper |

### setters

These functions are exposed to provide manual manipulation of the internal
value.

| key         | type          | description                                                                                                                                                    |
| ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `increment` | function()    | increments the value                                                                                                                                           |
| `decrement` | function()    | decrements the value                                                                                                                                           |
| `setValue`  | function(str) | sets the value (note: the argument passed will be coerced to a valid value within the specified range or fall back to the default value if not a valid number) |

## Other Solutions

- [`react-stepper-primitive`][react-stepper-primitive] by Andrew Joslin was the
  prime source of inspiration for this hook.

If you know of any others, please send a pull request to add them here.

## License

[MIT][license]

[npm-image]: https://img.shields.io/npm/v/use-stepper.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/use-stepper
[ci-image]:
  https://img.shields.io/circleci/project/github/wKovacs64/use-stepper/main.svg?style=flat-square
[ci-url]: https://circleci.com/gh/wKovacs64/use-stepper
[coverage-image]:
  https://img.shields.io/codecov/c/github/wKovacs64/use-stepper/main.svg?style=flat-square
[coverage-url]: https://codecov.io/gh/wKovacs64/use-stepper/branch/main
[semantic-release-image]:
  https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[react]: https://reactjs.org/
[hooks-intro]: https://reactjs.org/docs/hooks-intro.html
[yarn]: https://yarnpkg.com/
[npm]: https://www.npmjs.com/
[kent-prop-getters]:
  https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters
[use-reducer]: https://reactjs.org/docs/hooks-reference.html#usereducer
[kent-state-reducer]: https://kentcdodds.com/blog/the-state-reducer-pattern
[react-stepper-primitive]: https://github.com/ajoslin/react-stepper-primitive
[license]: https://github.com/wKovacs64/use-stepper/tree/main/LICENSE.txt
