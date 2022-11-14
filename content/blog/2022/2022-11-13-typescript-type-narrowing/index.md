---
title: "Typescript type narrowing, type guards and `var is type`"
date: 2022-11-13
url: typescript-type-narrowing/
cover: jakob-braun-HTGrBFwlYLA-unsplash.jpg
tags:
- typescript
- js
---
One useful feature in typescript is union type, for example `string | number | null`, it's a way to specify an argument, return, or variable can get values with different type.

**Type Narrowing** is a technique that allows typescript compiler to **reduce** the types of a value evaluating **guard clauses** in compilation time.

Let's see a simple example, imagine we have a function to uppercase a value that can ber `number`, `string` or just `null`, into the function we need to handle the different cases, but at the same time typescript is able to understand the types and reduce value type to the correct type in each code's branch.

```typescript
function uppercase(value: string | number | null ): string { // Here value's type is string | number | null
  if (value === null) {
    console.log(value) // Here value's type is null
    return ""
  }

  if (typeof value === 'number') {
    // Here value's type is number
    value = value.toString() 
  }
  // Here we can be sure value's type is string
  return value.toUpperCase()
}
```
You can check it by yourself hovering `value` across the code in the [Typescript's playground](https://www.typescriptlang.org/play?ssl=13&ssc=1&pln=1&pc=1#code/GYVwdgxgLglg9mABCADigpgJwgQwM7oAUAbjgDYjoBcieUmMYA5ogD6JggC2ARlmxxBkyiAJQ06DZogDeAKESIYwRCXKVEAXm2Dho2QsWIICPHDLoAdGThM1FdKMOLM6KCExIARF8MBfOUNlVSgATww4FVIHLR0Ack5eLDj9eSNEaI1NDPUrKDgAZXpGOydFAMNXd08ch0t8gFU0LABhfCJ9OQCgA)

Note type narrowing is not to reduce the types to just one type, in our example the line 2 (`if (value === null)`) makes sure the value is `null`, but a guard like `if (value)` only removes the possibility of being `null`, so after this guard `value`'s type is `number | string`

# Why type narrowing
When a value can have multiple possible types (union type), it's important to handle the values in the correct way to avoid runtime errors, a simple function like the example, in vanilla javascript:
```js
function uppercase(value) {
  return value.toUpperCase() 
}
```
is completely valid, but can fail on runtime if the value is a number or null, but using Typescript, it gives you the possibility of write better code as it "forces" you to write code to handle the case of different types.

# Type guards
As I mentioned, type guards are the way of do type narrowing setting a condition that the typescript compiler can evaluate and unequivocally reduce the types the variable can be.

It's important to note the type guards (relative toto typings in compilation time, not in the run time, so not all the guards you can think are valid, remember, **the value must be able to be inferred on compilation time, not by the value in runtime**.

There are a lot of different type guards, `typeof`, `instanceof`, `in` operator, **type predicates**, **discriminated unions**, etc...
You can check all the cases with example is the [official documentation](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), but I want to focus and provide more info in last two: type predicates, discriminated unions.

## Type predicates
In some cases the logic to do type narrowing can be a bit complex (more than a simple typeof or a discriminated union) and it will be nice to extract the type narrowing logic, let's see an example, imagine we have this interfaces

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
    // shape's type is type is Circle | Ellipse
    return shape.radius * shape.radius * Math.PI
  }

  // shape's type is type is Circle | Ellipse
  return shape.radius1 * shape.radius2 * Math.PI
}
```
Note that now the type after the function `isCircle` still being Circle | Ellipse, so the narrowing is not working, but why?. 
**The narrowing is not working** as the `isCircle` returns `boolean` and the **compiler it's not smart enough to know the semantic meaning of this boolean**, this is why we need a **type predicate**

Just changing a bit the function's return type we can achieve our goal:
```typescript
function isCircle(shape: Shape): shape is Circle {
  return shape.type === 'ellipse' && !('radius2' in shape)
}
```
`[argument] is [type]` return type still being a boolean but now have a meaning and let Typescript compiler know if an argument is of the specified type.

> At this point I want to let you know that the typescript compiler is not perfect, and while i was writing this post I found a bug in the type narrowing: if `Circle` and `Ellipse` share the attribute `radius` the compiler still inferring `Circle | Ellipse` on the isCircle function. 

# Discriminated unions
Discriminated unions is a technique not only useful for type narrowing also to create better types. In the previous example, instead of use extend, we can use this technique:

```typescript
interface Circle {
  type: 'circle'
  radius: number
}

interface Ellipse {
  type: 'circle'
  radius: number
  radius2: number
}

interface Square {
  type: 'kind',
  side: number
}

type Shape = Circle | Ellipse | Square | Triangle
```

Now the compiler is able to know the type as `type` property in the interface is not a string is a type itself.








