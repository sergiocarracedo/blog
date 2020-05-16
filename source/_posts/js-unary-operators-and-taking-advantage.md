---
title: "Javascript unary operators: Taking advantage using them"
date: 2020-05-09
tags: js
cover: /images/unary-operators-1364700.jpg
---

## What's an operator?
An operator is a symbol that define the operation to do between 1 o more operands.

<p align="center">
{% img /images/operators.png %}
</p>

We use a lot of operators: sum (+), subtraction (-), multiply (*), division (/), logic and (&&), negation (!),...


## What's a unary operator?

A unary operator is an operator that only needs one operand to work.
For example
```javascript
i++
```
In this example we have an operand (`i`) and an operator (`++`), we don't need more to increment the `i` variable value.

## Unary operators in Javascript

here is a list with more common unary operators in Javascript


* `++` **Increment**. Increments the value of operand in one unit.
* `--` **Decrement**. Decrements the value of operand in one unit.
* `!` **Logical not**. Negate the boolean operand value.
* `-` **Negation**. Negate the numeric operand value.
* `typeof` Returns the type of the operand in a string.
* `delete` Deletes the index of an array or an object.

## Hacking the system

There is another unary operator that I haven't talked about, the **unary addition** (`+`).

```javascript
let a = 10
console.log(+a)
```

What do you think will be the result? You probably right: `10`.

So what is this operator for if returns the same value? Here is another example.


```javascript
let a = '10'
console.log(+a)
```
In this one, what do you think will be the result? Yes, it's `10` but not the same `10` we had. **What?**

Replay, but now let's look at the types 

```javascript
let a = 10
console.log(type +a)

let b = '10'
console.log(type +a)
```

Both results are `number`. Here is the point, this operator (tries to) convert the value to number. So we can use it to cast values to `number`.

```javascript
console.log(+'10a') // NaN
console.log(+'0x10') // 16
console.log(+'0o10') // 8
console.log(+'0.1') // 0.1
console.log(+'1e12') // 1000000000000
console.log(+'Infinity') // Infinity
console.log(+undefined) // NaN
console.log(+true) // 1
console.log(+[]) // 0
console.log(+[2]) // 2
console.log(+[2, 3]) // NaN
console.log(+{}) // NaN
console.log(+null) // 0 <= Take care
```
Take care with the last result because it's less obvious

Unary minus do the same, but negate the result.


The `!` operator behaves similarly: It tries to convert the value to `boolean`, but negate the result of the cast, but if we double negate the value we found a way to cast values to `boolean`

```javascript
console.log(!!'10a') // true
console.log(!!'') // false
console.log(!!0) // false
console.log(!!0) // false
console.log(!!null) // false
console.log(!!undefined) // false
console.log(!!NaN) // false
console.log(!!Infinity) // true
console.log(!!{}) // true <= Take care
console.log(!![]) // true <= Take care
console.log(!!'0') // false <= Take care
```
I marked the results that for me are counterintuitive

This two unary operators, `+` and `!`, using as `!!` are very useful to cast to number and boolean respectively.

Enjoy them! :wink:


