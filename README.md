# React Signals and Computed Library

![tests](https://github.com/benjamindigiorgio/react-computed-ref/workflows/test/badge.svg?branch=main)
[![npm version](https://badge.fury.io/js/react-signals-computed.svg)](https://badge.fury.io/js/react-signals-computed)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This library provides `useSignal` and `useComputed` hooks for managing state and derived state in React applications. These hooks are designed to work together to handle rapid updates, complex dependencies, and asynchronous updates efficiently.

## Installation

You can install this library using npm or yarn:

    npm install react-signals-computed

or

    yarn add react-signals-computed

## Usage

### `useSignal`

The `useSignal` hook creates a reactive signal with an initial value and provides getter and setter methods.

#### Example

    import React from 'react';
    import { useSignal } from 'react-signals-computed';

    const Counter = () => {
    	const count = useSignal(0);

    	return (
    		<div>
    			<p>Count: {count.value}</p>
    			<button onClick={() => (count.value += 1)}>Increment</button>
    		</div>
    	);
    };

    export default Counter;

### `useComputed`

The `useComputed` hook creates a computed value that updates whenever its dependencies change.

#### Example

    import React from 'react';
    import { useSignal, useComputed } from 'react-signals-computed';

    const Counter = () => {
    	const count = useSignal(0);
    	const doubled = useComputed(() => count.value * 2);

    	return (
    		<div>
    			<p>Count: {count.value}</p>
    			<p>Doubled: {doubled}</p>
    			<button onClick={() => (count.value += 1)}>Increment</button>
    		</div>
    	);
    };

    export default Counter;

### Combined Usage

You can combine `useSignal` and `useComputed` to create complex reactive state dependencies.

#### Example

    import React from 'react';
    import { useSignal, useComputed } from 'react-signals-computed';

    const App = () => {
    	const count = useSignal(0);
    	const other = useSignal(10);
    	const doubled = useComputed(() => count.value * 2);
    	const sum = useComputed(() => count.value + other.value);
    	const stringTest = useComputed(() => (doubled !== 0 ? 'positive' : 'zero'));
    	const complexComputed = useComputed(() => doubled + sum + count.value);

    	return (
    		<div>
    		<p>Count: {count.value}</p>
    			<p>Other: {other.value}</p>
    			<p>Doubled: {doubled}</p>
    			<p>Sum: {sum}</p>
    			<p>String Test: {stringTest}</p>
    			<p>Complex Computed: {complexComputed}</p>
    			<button onClick={() => (count.value += 1)}>Increment Count</button>
    			<button onClick={() => (other.value += 1)}>Increment Other</button>
    		</div>
    	);
    };

    export default App;

## API

### `useSignal`

#### Parameters

- `initialValue`: The initial value of the signal. It can be a primitive value, object, or a function returning a value.

#### Returns

- `Signal<T>`: An object with a `value` property that can be used to get and set the signal's value.

### `useComputed`

#### Parameters

- `computeFn`: A function that returns the computed value. This function can depend on one or more signals.

#### Returns

- `T`: The computed value that updates whenever its dependencies change.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
