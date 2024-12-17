---
title: "Math.max (and min) 'Maximum call stack size exceeded' with large datasets and how to reimplement it to make it much faster"
date: 2024-12-17
cover: pexels-pixabay-2159.jpg
url: /math-max-problem-fast-max
tags:
  - javascript
  - performance
---

Even though Javascript was not created with the management of large datasets in mind, manipulating them nowadays is very common.

Data aggregation is also a common functionality, calculate the max value in an array, is a simple task, the language provides the `Math.max` method to do it.

But, try to do this:
```ts
const data = Array.from({ length: 1_000_000 }, () => Math.random() * 1000)
console.log(Math.max(...data))
```

The code is simple: it generates and array with 1.000.000 random items and then tries to get the max value of the array and as the `Math.max`  **doesn't accept an array as param, we need to spread the array to pass the values as function's arguments**.

But if you run that you will have an error like: `RangeError: Maximum call stack size exceeded`

This error is caused because when you spread an array in the function's arguments (or use `apply`) you are doing `Math.max(data[0], data[1], .... data[999_999])` and the function's arguments use the call stack which is a limited region of memory to be stored. This limit depends on the engine, so your code can work in a browser and fail in another one that uses a different javascript engine.

[Check more details in MDN web docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#using_apply_and_built-in_functions)

## The solutions

As a teacher told us long time a go: _if a problem have only one solution is not a problem, is an exercise_. We have multiple solutions to avoid this problem, some of them even improving the original performance.

### Chunk the array
MDN page proposes to use a hybrid strategy, split the array in chunks, and apply the Math.max function to each one.

```ts
function maxUsingChunks(arr: number[]): number {
  let max = -Infinity;
  const QUANTUM = 32768;

  for (let i = 0; i < arr.length; i += QUANTUM) {
    const subMax = Math.max.apply(
      null,
      arr.slice(i, Math.max(i + QUANTUM, arr.length)),
    );
    max = Math.max(subMax, max);
  }

  return max;
}
```

## Using `reduce`
We can loop through the array and compare each value to know if it is higher than the previous max value.

```ts
function maxUsingReduce(arr: number[]): number {
  return arr.reduce((acc, cur) => Math.max(acc, cur), -Infinity)
}
```

## Using `for`
Yes, a simple `for` to loop through the array

```ts
function maxUsingFor(arr: number[]): number {
  const length = arr.length
  let max = -Infinity

  for (let i = 0; i < length; i++) {
    max = Math.max(max, arr[i])
  }
  return max
}
```

## Performance

There are more solutions, but most of them are slight variations of the ones I showed above. Those are all valid and do exactly the same, but which is the best performance?

To measure the performance I'm going to use [Vitest benchmarking](https://vitest.dev/guide/features#benchmarking) feature, which is perfect for this usage.

We create a `.bench.ts` file that will include the functions to compare.

```ts
// max.bench.ts
import { bench } from 'vitest'

const data = Array.from({ length: 100_000 }, () => Math.random() * 1000)

bench('Native Math.max', () => {
  Math.max(...data)
})

bench('maxUsingChunks', () => {
  maxUsingChunks(data)
})

bench('maxUsingReduce', () => {
  maxUsingReduce(data)
})

bench('maxUsingFor', () => {
  maxUsingFor(data)
})
```

Then we run the benchmark with `vitest bench`. Here is the output of the command

```bash
  ✓ max.bench.ts (4) 2441ms
     name                    hz     min      max    mean     p75      p99     p995     p999     rme  samples
   · Native Math.max     799.83  0.7349   9.2443  1.2503  0.8774   6.3467   7.8521   9.2443  ±9.70%      400
   · maxUsingChunks      291.20  2.3094  12.5102  3.4341  3.8463  12.0433  12.5102  12.5102  ±8.72%      146   slowest
   · maxUsingReduce    1,033.83  0.8555   1.3126  0.9673  0.9713   1.2611   1.3066   1.3126  ±0.69%      518
   · maxUsingFor      11,198.84  0.0872   0.1550  0.0893  0.0887   0.1062   0.1166   0.1391  ±0.13%     5600   fastest

 BENCH  Summary

  maxUsingFor - max.bench.ts
    10.83x faster than maxUsingReduce
    14.00x faster than Native Math.max
    38.46x faster than maxUsingChunks
```
🤯 The results could seem counterintuitive, a simple `for` is much faster than any other option, and even the `reduce`'s  version is much faster than the native implementation.

Ron Northcutt wrote a [nice article that explains in detail why forEach (and another array loop functions like `reduce`) are slower than a simple `for`](https://community.appsmith.com/content/blog/dark-side-foreach-why-you-should-think-twice-using-it), probably the most relevant reason is the **function Overhead** (`forEach()` invokes a callback function for each element in the array, and that is expensive for the engine).

> Note: If we try to calculate the max value in a bigger array native `Math.max` will cause the error `Maximum call stack size exceeded`, so the native version of `Math.max` is worse in every aspect

### Going further

We can try to optimize even more the function with less generic strategies. For example, if we know the theoretical max we can rewrite the max function to stop looping if we reach it and return that value. A real-life use-case that fits this is: you have an array of negative temperatures, and you want to get the max temperature, we can set the theoretical max as 0 (as we are talking about negative temperatures), and if the function finds an item with the value 0, we are sure we find the max and we can return that value without continue looping through the array.


## Replacing Math.max

If you want to solve the `Maximum call stack size exceeded` problem, and/or make your apps faster you can just use the `maxWithFor` function code (changing the function name) and use it in your code. I strongly DON'T recommend you to monkey-patch `Math.max`. It can cause unexpected side effects, and errors, makes the code hard to maintain, etc...

You can also use a third-party library like [fast-max](https://github.com/DanielJDufour/fast-max) that covers all the aspects we mentioned:

- Solves the `Maximum call stack size exceeded` problem
- Is fast
- Implements strategies like the theoretical max
- Can ignore values


Now a question for you: Did you face the call stack size problem in your code? Let me know in the comments.
