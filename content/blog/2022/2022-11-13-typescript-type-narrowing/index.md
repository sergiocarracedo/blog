---
title: "Typescript type narrowing, type guards and  type predicates ([var] is [type])"
date: 2022-11-13
url: typescript-type-narrowing/
cover: jakob-braun-HTGrBFwlYLA-unsplash.jpg
tags:
- typescript
- js
---
One useful feature in Typescript is _union types_, for example `string | number | null`, it's a way to specify an argument, return, or variable that can get values with different types.

**Type Narrowing** is a technique that allows Typescript compiler to **reduce** the types of a value evaluating **guard clauses** in compilation time.

Let's see a simple example, imagine we have a function to uppercase a value that can be `number`, `string`, or just `null`, into the function we need to handle the different cases, but at the same time Typescript can understand the types and reduce value type to the correct type in each code's branch.

```
function uppercase(value: string | number | null ): string { // Here value's type is string | number | null
  if (value === null) {
    console.log(value) // Here value's type is null
    return ""
  }

  if (typeof value === 'number') {
    // Here value's type is number
    value = value.toString() 
  }
  // Here we can be sure the value's type is string
  return value.toUpperCase()
}
```
You can check it by yourself by hovering `value` across the code in the [Typescript's playground](https://www.typescriptlang.org/play?ssl=13&ssc=1&pln=1&pc=1#code/GYVwdgxgLglg9mABCADigpgJwgQwM7oAUAbjgDYjoBcieUmMYA5ogD6JggC2ARlmxxBkyiAJQ06DZogDeAKESIYwRCXKVEAXm2Dho2QsWIICPHDLoAdGThM1FdKMOLM6KCExIARF8MBfOUNlVSgATww4FVIHLR0Ack5eLDj9eSNEaI1NDPUrKDgAZXpGOydFAMNXd08ch0t8gFU0LABhfCJ9OQCgA)

Note type narrowing is not to reduce the types to just one type, in our example line 2 (`if (value === null)`) makes sure the value is `null`, but a guard like `if (value)` only removes the possibility of being `null`, so after this guard `value`'s type is `number | string`

# Why type narrowing
When a value can have multiple possible types (union type), it's important to handle the values in the correct way to avoid runtime errors, a simple function like the example,:
```js
function uppercase(value) {
  return value.toUpperCase() 
}
```
is completely valid in vanilla Javascript, but can fail on runtime if the value is a number or null. 
Using Typescript gives you the possibility of writing better code as it "forces" you to write code to handle the case for each type and that is when do type narrowing.

# Type guards
As I mentioned, type guards are a way of doing type narrowing setting a condition that the typescript compiler can evaluate and unequivocally reduce the types the variable can be.

It's important to note the type guards are relative to typings in compilation time, not in the run time, so, not all the guards you can think are valid as type guard, remember, **the value must be able to be inferred on compilation time, not by the value in runtime**.

There are a lot of different type guards: `typeof`, `instanceof`, `in` operator, **type predicates**, discriminated unions, equality operator, etc...

I don't want to go deep into all the types, the [official Typescript documentation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) is very good, and not too much to add, but anyway I want to focus and provide more info about type predicates that has an interesting syntax and is not very common, but useful.

## Type predicates
In some cases, the logic to do type narrowing can be a bit complex (more than a simple `typeof` or a discriminated union) and it will be nice to extract the type narrowing logic, let's see an example, imagine we have this interfaces

```typescript
interface Shape {
  type: 'square' | 'ellipse'
}

interface Circle extends Shape {
  type: 'ellipse'
  radius: number
}

interface Ellipse extends Shape {
  type: 'ellipse'
  radius1: number
  radius2: number
}

interface Square extends Shape  {
  type: 'square'
  side: number
}
```
and a function to calculate the area depending on the shape

```typescript
function area(shape: Circle | Square | Ellipse): number {
  if (shape.type === 'square') {
    // shape's type is Square
    return shape.side * 2 
  }

  if (shape.type === 'ellipse' && !('radius2' in shape)) {
    // shape's type is Circle
    return shape.radius * shape.radius * Math.PI
  }

  // shape's type is Ellipse
  return shape.radius1 * shape.radius2 * Math.PI 
}
```

This works perfectly, the code, the type narrowing, etc. Now imagine you want to extract the logic on knowing if the shape is a circle, just move the logic to a function

```typescript
function isCircle(shape: Shape): boolean {
  return shape.type === 'ellipse' && !('radius2' in shape)
}
```

And now this is the function after the refactor

```typescript
function area(shape: Circle | Square | Ellipse): number {
  if (shape.type === 'square') {
    // shape's type is type is Square
    return shape.side * 2
  }

  if (isCircle(shape)) {
    // shape's type is Circle | Ellipse
    return shape.radius * shape.radius * Math.PI
  }

  // shape's type is Circle | Ellipse
  return shape.radius1 * shape.radius2 * Math.PI
}
```
Note that now the type after the function `isCircle` is still being `Circle | Ellipse`, so the narrowing is not working, but why?. 
**The narrowing is not working** as the `isCircle` returns `boolean` and the **compiler it's not smart enough to know the semantic meaning of this boolean**, this is why we need a **type predicate**

Just changing a bit the function's return type we can achieve our goal:
```typescript
function isCircle(shape: Shape): shape is Circle {
  return shape.type === 'ellipse' && !('radius2' in shape)
}
```
`[argument] is [type]` return type still being a boolean but now has a meaning and lets Typescript compiler know if an argument is of the specified type.

> At this point I want to let you know that the typescript compiler is not perfect, and while I was writing this post I found a bug in the type narrowing: if `Circle` and `Ellipse` share the attribute `radius` the compiler still inferring `Circle | Ellipse` on the `isCircle` function. 

## Summarizing
The benefits of type narrowing are just the benefits of using Typescript, strong typing, and more control over the values, but it's good to know more about how the compiler works to have a better understanding of the language.
