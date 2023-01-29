---
title: "Typescript enums, const enums and readonly maps"
date: 2023-01-29
url: /typescript-enums
cover: delila-ziebart-b0GSCFJ-Gzg-unsplash.jpg
tags:
- typescript
---
# Enum basics
_Enums_ is one of the nice things Typescript bring to the Javascript development's environment. _Enums_ allows you to define a set of named values (constants), generally with a semantic meaning.

One of the advantages over the regular constants is the grouping, making easy to know the different values you can use in certain place (and limiting the possible values to use)

In Typescript an enum has this shape:
```typescript
enum HttpResponseStatus {
  NotFound,
  Forbidden,
  Ok,
  InternalServerError
}
```
In the example, the enum represent a list of possible (a simplified list) HTTP response status, and using the names it's easy to remember which status we want to use in each case.

The way to use a enum, it's very straightforward, just: Enum name + dot + Enum value name: `HttpResponseStatus.NotFound`, Typescript will replace it by a value 

By default, and if you don't specify more, Typescript converts each the enum value to a number, starting on 0. In or example `NotFound` value is 0, `Forbidden` is 1, etc. 

This doesn't fit the expected use case, we expect, for example `NotFound`'s value be 404, `Ok` be 200, etc. 

You can even define the starting number
```typescript
enum Chapters {
  Four = 4,
  Five,
  Six,
  Seven
}
```
But, to meet the expected values we only need to assign the desired values for each enum's value name like:

```typescript
enum HttpResponseStatus {
  NotFound = 404,
  Forbidden = 403,
  Ok = 200,
  InternalServerError = 500
}
```

You can use expressions to define the values, for example calculations, bit operations, etc. Event random numbers (the random values is evaluated just one time, so it will be constant in the runtime), or values returned by a function
```typescript
enum MyEnum {
  A = 404,
  B = 1 << 2,
  C = 1 * 3,
  D = Math.random(),
  E = someFunction(123)
}
```

After defining an _enum_ you can use it as a type, **with limitations***, for example:
```typescript
function handleResponse(responseCode: HttpResponseStatus)
```

> (*) The main limitation is you can assign any number to a numeric-enum type and that is intended (https://github.com/Microsoft/TypeScript/issues/26362#issuecomment-412198938). 
 
For example `handleResponse(123)` is valid, even if the value 123 is not a value in the enum `HttpResponseStatus`. This doesn't happen with string-enums

Now you know the enum basics, let go deeper

# Enums in runtime
Typescript's enums have a representation in runtime, but maybe is not as you can expect, let's see how the `HttpResponseStatus` enum is compiled to vanilla JS:
```javascript
var HttpResponseStatus;
(function (HttpResponseStatus) {
    HttpResponseStatus[HttpResponseStatus["NotFound"] = 404] = "NotFound";
    HttpResponseStatus[HttpResponseStatus["Forbidden"] = 403] = "Forbidden";
    HttpResponseStatus[HttpResponseStatus["Ok"] = 200] = "Ok";
    HttpResponseStatus[HttpResponseStatus["InternalServerError"] = 500] = "InternalServerError";
})(HttpResponseStatus || (HttpResponseStatus = {}));
```

and if you do `console.log(HttpResponseStatus)` this is the result:
```json
{
  "200": "Ok",
  "403": "Forbidden",
  "404": "NotFound",
  "500": "InternalServerError",
  "NotFound": 404,
  "Forbidden": 403,
  "Ok": 200,
  "InternalServerError": 500,
  "Test": 0.48543608526338566,
  "0.48543608526338566": "Test"
}
```
Even the RxJS core team lead wrote a tweet about that: https://twitter.com/benlesh/status/1510983348944056327

The reason of this behavior is mainly because:
* **[Reverse Mapping](https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings)** this allows to use the enum in both directions, get the value from the value's name or get the name from the value's name from the value.
* **Computed values**: The object that represents the enum is computed in a function to allow computed values, like the random we used before in the example.

Reverse mapping can be useful in some cases, for example if you want to show the value's name instead of the value, even in a dropdown, to list all values' names and get the selected value, but in this case you need to do an extra conversion to avoid repeated values: https://gist.github.com/sergiocarracedo/ac219a9b3f700b2e721cc9c2964b36c9

## Const enums
In most use cases you don't need Reverse mapping neither computed values, then you can use **const enums**, just adding the keyword `const` before the enum definition.

```typescript
const enum HttpResponseStatus {
  NotFound = 404,
  Forbidden = 403,
  Ok = 200,
  InternalServerError = 500
}
```
In this case Typescript's compiler just will replace the uses of the enum items by the value, for example:
```typescript
someFunction(HttpResponseStatus.NotFound)
// Compiler output
someFunction(404 /* NotFound */)
```

## Union types
Other simple way to "emulate" enum's behaviour keeping type safety and without overload the bundle with extra code is just using **union types**

```typescript
type HttpResponseStatus = 404 | 403 | 200 | 500
```

This solution lost the spirit of an enum, but the IDE can to the "magic" suggestion the available values when you try to fill a function argument typed as `HttpResponseStatus`


Both solutions are nice in terms of the bundle size, but removes the possibility of knowing the value's name.

# Const object
In the case we want to have the value's name in runtime we can use a plain object to emulate the enum behavior, then our enum becomes:
```typescript
const HttpResponseStatus = {
  NotFound: 404,
  Forbidden: 403,
  Ok: 200,
  InternalServerError: 500
}
```
We can use it as an enum, referencing a value in the same way `HttpResponseStatus.NotFound`, **but what about the typing?**

If we check the type of the object we get this:
```typescript
const HttpResponseStatus: {
    NotFound: number;
    Forbidden: number;
    Ok: number;
    InternalServerError: number;
}
```
We lost the possibility of use the type, for example in a function's argument: `function someFunction(status: HttpResponseStatus)` will not work, and we should use `number` as status' type.

## Const assertion
The Typescript's [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) solves this as forces the object's properties to be `readonly`, and for that Typescript's compiler is able to infer the property types as and convert it as type:

```typescript
const HttpResponseStatus = {
  NotFound: 404,
  Forbidden: 403,
  Ok: 200,
  InternalServerError: 500
} as const

// The type infered by typescript
const HttpResponseStatus: {
  readonly NotFound: 404;
  readonly Forbidden: 403;
  readonly Ok: 200;
  readonly InternalServerError: 500;
}
```
This is an object and we still having the keys in runtime as in a regular enum

Now we can create a type that will content the union of all properties values as type

```typescript
type HttpResponseStatusEnum = typeof HttpResponseStatus[keyof typeof HttpResponseStatus]
```

Explaining it a bit in detail:
* `typeof HttpResponseStatus` is the type of the object:
* `keyof typeof HttpResponseStatus` returns all the keys of the object: `"NotFound" | "Forbidden" | "Ok" | "InternalServerError"`
* and finally we use again `typeof HttpResponseStatus` to get the object type, and we access to the [type by index](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html), but as we apply that over an union type, we are applying the index to each element in the union https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types


and then we can use this "Enum type" as type:

```typescript
function someFunction(status: HttpResponseStatusEnum)
```

# Summary
As you read, there several ways to achieve the same or similar behavior, and now you have information enough to decide which solution use depending on the use case, if you are worried about the bundle size the code output maybe it's the moment to start to use another solution, Typescript documentation recommends the _object with as const_ solution, but if you don't need the enum values' names you can use the const enum or just the union type.

> In modern TypeScript, you may not need an enum when an object with `as const` could suffice (from https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums)

