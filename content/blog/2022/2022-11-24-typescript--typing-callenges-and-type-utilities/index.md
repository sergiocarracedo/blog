---
title: "Typescript typing challenges and type utilities"
date: 2022-11-30
url: /typescript-typing-challenges-and-type-utilities
cover: pexels-david-buchi-1070345.jpg
tags:
- typescript
- js
---

Recently I was looking for more knowledge about Typescript typing, how to create more advanced and better types, and I can say that it's a big deal, there are a lot of things you can do and, you never imagined before. 

During that "investigation" I found very interesting resources I want to share with you.

# Type Challenge
[https://tsch.js.org/](https://tsch.js.org/)

It's a repository that includes a lot of, very well-documented, and designed typing challenges. Each challenge provides you a definition of it in a `README.md` file, a `test-cases.ts` file with the tests the type you should define should pass, and finally the file `template.ts` where you should do your job creating the type necessary to meet the requirements and to pass all the tests.

I recommend you to start with the easy ones, without pressure, try to solve them using the Typescript's documentation (which is very good), and if finally, you can't solve it, or you don't want to spend too much time on an exercise check the community solutions, but then spend all the time you need to understand the solution and the background concepts, I'm pretty sure you will learn along the way.

For me, it was a lesson of humility, before this challenge I thought I knew Typescript typing, but after that, I know still need to learn about Typescript :sweat_smile:

:arrow_right: The user [Eugene Obrezkov](https://github.com/ghaiklor) is doing this challenge and documenting the [solutions](https://ghaiklor.github.io/type-challenges-solutions/en/) he did, explaining them. Very recommended

### Example 
Implement the built-in `Readonly<T>` generic without using it. From: https://github.com/type-challenges/type-challenges/blob/main/questions/00007-easy-readonly/README.md

My solution to this challenge, :warning: SPOILER ALERT :warning: is

```typescript
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}
```

The explanation is that we are creating the type `MyReadonly` that receives a generic type `T` and this type is an object whose keys are if `K` (not of type K, the K value) which is a value that is one of the keys of the generic type `T`, for this key we are setting is read-only, and for the type of that key, we are getting the type of the key (`K`) in the generic type.

This simple solution requires knowledge about [keyof type operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html), [mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html), [mapping modifiers](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers), etc... So it's quite useful to improve your typing skills using real challenges.

## Hardcode typing
The previous example is simple, it's more complex than the typical types you can use in day-to-day but still simple.
When you continue advancing in the exercises they became more and more complex, and they will require all your knowledge about how the types work in Typescript, that is what I call _hardcore typing_, squeezing the type system at the maximum to get the results you want.

# Type utilities
If you check the challenges' code, especially the tests, you will find lines like:
```typescript
type cases = [Expect<Equal<MyReadonly<Todo1>, Readonly<Todo1>>>]
```
This is one of the nice things about the Type Challenge, is the type utilities they use, for example `Expect<T>` and `Equal<X, Y>`

`Expect` is simple, only check the type is true (technically speaking if extends `true`,). but help us to do other validation of type.
`Equal` checks if two types are the same type, the type definition is not as simple as you can expect
```typescript
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
```
I could try to explain the internals, but [this answer in stackoverflow](https://stackoverflow.com/a/68963796/4925419) does it much better than I could.

These kinds of types are useful to complement your application types, this is the reason why there are libraries that provide them, also Type Challenge released its own types utilities as a package https://www.npmjs.com/package/@type-challenges/utils 

Let's see a couple of them 

## TS Toolbelt 
https://github.com/millsp/ts-toolbelt

It's a collection of more than 200+ type utilities, they describe them selves as the lodash of the type system. Basically, it  abstracts the complex type checks.

## Utility types
https://github.com/piotrwitek/utility-types

Another type's library that describes itself as the lodash of types :smile:. it's not big as TS Toolbelt but includes commonly used types. For example `DeepPartial` works like the native `Partial` but does it recursively.

This library provides also "real" type guards, I mean functions that do type narrowing and validates a variable on runtime.

# Other type-challenge
To finalize I want to share one more type challenge just in case you want to challenge your typescript typing skills: https://js.checkio.org/
