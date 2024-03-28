---
title: "Typescript enums: Replacing them with const and union types"
date: 2024-04-01
url: /typescript-enums-ii
cover: _081fe03f-6eb1-40ef-9ed6-75f25067b0ad.jpeg
tags:
  - typescript
---

Last year [I wrote a post about the typescript enums]({{< ref "/blog/2023/2022-12-7-typescript-enums" >}}): how to use them, some of the disadvantages, how to mitigate them, and how to replace the enums with const enums and read-only maps.

In that post, I showed how to replace the enums with const enums and read-only maps, and I also mentioned the union types as an alternative to the enums.

In this post, I want to go deeper into the union types as a replacement for the enums in some cases.

## Union types as enum replacement
If you remember one of the advantages of the enums is the grouping of the values giving them a semantic meaning, and limiting the possible values to use. They are also real values not only types, which means you can use them in the runtime, for example, to get a list of the possible values.

```typescript
enum HttpResponseStatus {
  NotFound = 404,
  Forbidden = 403,
  Ok = 200,
  InternalServerError = 500
}

const httpStatusNames = Object.values(HttpResponseStatus).filter(v => typeof v === 'string')
```
Yes, I know that code looks weird, but the reason why is how the enums work in Typescript (please [check the previous post]({{< ref "/blog/2023/2022-12-7-typescript-enums" >}}) for more details).

If we don't need the semantic meaning, we can use the union types to replace the enums, for example, the previous enum can be replaced by the following union type:

```typescript
type HttpResponseStatus = 404 | 403 | 200 | 500
```

But, what if I need the list of the possible values in runtime?. This is a type, and types don't exist in the runtime, so we can't get the list of the possible values.

We can create a const array with the possible values, and use it to get the list of the possible values:

```typescript
const HttpResponseStatusValues = [404, 403, 200, 500] as const
type HttpResponseStatus = 404 | 403 | 200 | 500
```
But doing that means we need to maintain the list of the possible values in two places, the type, and the array, and that's not a good idea.

## Typescript: Typeof and indexed access types to the rescue

We want to create (or infer) the type from the array to use values and type and don't need to maintain the list of the possible values in two places.

We can use the `typeof` operator to get the type of the array:

```typescript
const HttpResponseStatusValues = [404, 403, 200, 500] as const
type HttpResponseStatus = typeof HttpResponseStatusValues // readonly [404, 403, 200, 500]
```
Using `typeof` over the array of possible values we get the type of the array: `readonly [404, 403, 200, 500]`, but that is not the type we want.

To get the type we want we can use the [indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html):

```typescript
const HttpResponseStatusValues = [404, 403, 200, 500] as const
type HttpResponseStatus = (typeof HttpResponseStatusValues)[number] // '404' | '403' | '200' | '500'
```
*Voilà!* we have the type we want, and we can use it as a type, for example in a function's argument, and also use the list of the possible values in runtime:

```typescript
function someFunction(status: HttpResponseStatus) {
  if (!HttpResponseStatusValues.includes(status)) {
    throw new Error('Invalid status')
  }
  // do something
}
```

### How it works
Let me explain a bit in detail how it works. Imagine we have the following type that represents a "complex" object to store the car's information:

```typescript
type Car = {
    engine: {
        cylinders: number
        fuel: 'petrol' | 'diesel'
        battery: 'lithium' | 'lead'
    }
    wheels: {
        count: 4
        diameter: 16
    }
}
```

If we want to get the type of the `engine` property we can use the indexed access type:

```typescript
type Engine = Car['engine'] // { cylinders: number, fuel: 'petrol' | 'diesel'}
```

*`engine` is not a string, it's a type, and this in key*, it's a `keyof Car`

As the "indexed type" is a type we can use another kind of type as index, for example, a union type:

```typescript
type Power = Engine['fuel' | 'battery'] // 'petrol' | 'diesel' | 'lithium' | 'lead'
```

And now we can use an arbitrary type like `number` as an indexed type to get all the types in an array

```typescript
const HttpResponseStatusValues = [404, 403, 200, 500] as const
type HttpResponseStatus = (typeof HttpResponseStatusValues)[number] // '404' | '403' | '200' | '500'
```

The array can be something more complex, for example, an array of objects:

Please note the `as const` is needed to infer the type of the array as a tuple, if we don't use it the type will be `number[]` and we will not be able to use the indexed access type.

If you don't need the semantic meaning of the enums, and you need to use the possible values in runtime, you can use the union types and the indexed access types to get the type and the list of the possible values in runtime.
