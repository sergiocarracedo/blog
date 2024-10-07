---
title: "Branded types in TypeScript"
date: 2024-10-07
cover: pexels-googledeepmind-17485819.jpg
url: /branded-types
tags:  
  - typescript  
---

When you model entities with typescript, it is very common to get an interface like

```ts
interface User {
  id: number
  username: string
  ...
}

interface Order {
  id: number
  userId: number
  title: string
  year: number
  month: number
  day: number
  amount: { currency: 'EUR' | 'USD', value: number }
  ...
}
```
## The problem

The properties' types have no semantic meaning. In terms of types `User.id`, `Order.id`, `Order.year`, etc. are the same: a `number`

Following the previous example we can have a set of functions that do actions over the entities, for example:

```ts
function getOrdersFiltered(userId: number, year: number, month: number, day: number, amount: number) { // ...}

function deleteOrder(id: number) { // ... }
```

Those functions will accept any number in any arg no matter the semantic meaning of the number, for example:

```ts
const id = getUserId() 
deleteOrder(id)
```

Obviously, that is a big mistake, and it could seem easy to avoid reading the code, but the code is not always as simple as the example.

The same happens with `getOrdersFiltered`, we can swap the values of day and month, and we will not get any warning or error, the errors will happen in occur (or not if the day is lower than 12), but is obvious that the result will not be the expected.

## The solution

Object calisthenics' rules provide a solution for that: [Wrap all primitives and Strings](https://williamdurand.fr/2013/06/03/object-calisthenics/#3-wrap-all-primitives-and-strings) (Related [Primitive obsession anti-pattern](https://wiki.c2.com/?PrimitiveObsession))

The rule is to wrap the primitives in an object that represents a semantic meaning (DDD describes that as ValueObjects)

But with TypeScript we don't need to use classes or objects for that, we can use the type system to ensure a number that represents something different from a year, can't be used instead a year.

## Branded types

This pattern uses the extensibility of types to add a property that ensures the semantic meaning:

```ts
type Year = number & { __brand: 'year' }
```
That simple line creates a new type that can work as number but is not a number it's a year.

```ts
const year = 2012 as Year

function age(year: Year): number { //... }

age(2012) // ❌ IDE will show an error as 2012 is not a Year
age(year) // ✅ 
```

### Generalizing the solution

To avoid writting a type per branded type we can create a utility type like:

```ts
declare const __brand: unique symbol
export type Branded<T, B> = T & { [__brand]: B }
```
That uses a `unique symbol` as the brand property name to avoid conflicts with your properties and gets the original type and the brand as generic params

With this, we can refactor our models and functions like:

```ts
type UserId = Branded<number, 'UserId'>
type OrderId = Branded<number, 'OrderId'>
type Year = Branded<number, 'Year'>
type Month = Branded<number, 'Month'>
type Day = Branded<number, 'Day'>
type Amount = Branded<{ currency: 'EUR' | 'USD', value: number}, 'Amount'>

interface User {
  id: UserId
  username: string
  ...
}

interface Order {
  id: OrderId
  userId: UserId
  title: string
  year: Year
  month: Month
  day: Day
  amount: Amount
  ...
}

function getOrdersFiltered(userId: UserId, year: Year, month: Month, day: Day, amount: Amount) { // ...}
function deleteOrder(id: OrderId) { // ... }
```

Now, in this example the IDE will show an error as `id` is an `UserId` and `deleteOrder` expects an `OrderId` 
```ts
const id = getUserId() 
deleteOrder(id) // ❌ IDE will show an error as id is UserID and deleteOrder expects OrderId
```
### "Trade off"
As a small trade-off you will need to use `X as Brand`, for example `const year = 2012 as Year` when you create a new value from a primitive, but this is the equivalent to a `new Year(2012)` if you use value objects. You can provide a function that works as a kind of "constructor"

```ts
function year(year: number): Year {
  return year as Year
}
```


## Validation
Branded types are also useful to ensure the data is valid as you can have specific types for validated data
and you can trust the user was validated just by using types

```ts
type User = { id: UserId, email: Email}
type ValidUser = Readonly<Brand<User, 'ValidUser'>>


function validateUser(user: User): ValidUser {
  // Checks if user is in the database
  if (!/* logic to check the user is in database */) {
    throw new InvalidUser()
  }
  
  return user as ValidUser
}

// We can not pass just a User, needs to be a ValidUser
function doSomethingWithAValidUser(user: ValidUser) {
  
}

```

`Readonly` is not mandatory, but to be sure your code will no change the data after validating it, it's very recommendable


## Recap
Branded types are a simple solution that:

* **Improves the code readability**: Makes clearer which value should be used in each argument.
* **Reliability**: Helps to avoid mistakes in the code that can be difficult to detect, now the IDE (and the type checking) help us to detect if the value is in the correct place
* **Data validation**: You can use branded types to ensure the data is valid

You can think of Branded types like a kind of version of ValueObjects but without using classes, just types and functions.

Enjoy the power of typings






