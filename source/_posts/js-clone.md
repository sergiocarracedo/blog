---
title: Cloning objects in Javascript
date: 2020-02-22 18:28:28
tags: js clone deep-clone
---

Cloning objects in _Javascript_ (and in other language) is a tricky task. JS doesn't store the object value in your variable or in your constant, instead, store a pointer to the object value (the object reference).

Even when you pass an object to a function or to a method you are passing that object by reference, not the real value.

This picture shows perfectly the difference.

<div class="center-img">
  ![By reference and by value](/images/pass-by-reference-vs-pass-by-value-animation.gif) 
</div>

As you can see, if your pass (or copy) an object by reference and then you change any property, the "source" object's property also changes.

In all example I'll use that object down bellow

```js
const sourceObject = {
  l1_1: {
    l2_1: 123,
    l2_2: [1, 2, 3, 4],
    l2_3: {
      l3_1: 'l3_3',
      l3_3: 'l3_3'
    }
  },
  l1_2: 'My original object'
} 
```

# "Standard" clone
We'll use a "_standard_" clone assigning value to other constant

```js
const copiedObject = sourceObject

console.log('sourceObject', sourceObject.l1_2)
// My original object

clonedObject.l1_2 = 'My cloned object'

console.log('clonedObject', clonedObject.l1_2)
// My original object

console.log('sourceObject', sourceObject.l1_2)
// My original object
```
[![Edit practical-violet-dki61](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/practical-violet-dki61?fontsize=14&hidenavigation=1&theme=dark)

As I said before, when I change the property `l1_2` in cloned object, the value also changes in the source object.

Using this strategy, you is not copying the object at all.

# Using spread operator
This time I'll use the spread operator, that 
