---
title: (Deep) Cloning objects in Javascript
date: 2020-02-22 18:28:28
tags: js clone deep-clone
cover: /images/karen-lau-tRR3w-S2A3Y-unsplash.jpg
---

Cloning objects in _Javascript_ (and in other language) is a tricky task. JS doesn't store the object value in your variable or in your constant, instead, store a pointer to the object value (the object reference).

Even when you passes an object to a function or method, you are passing this object by reference, not the value.

This picture perfectly shows the difference.

<div class='center-img'>
  ![By reference and by value](/images/pass-by-reference-vs-pass-by-value-animation.gif) 
</div>

As you can see, if you pass (or copy) an object by reference and then change any property, the 'source' object's property also changes.

In any example I'll use the object below

```js
const sourceObject = {
  l1_1: {
    l2_1: 123,
    l2_2: [1, 2, 3, 4],
    l2_3: {
      l3_1: 'l3_3',
      l3_3: () => 'l3_3'
    }
  },
  l1_2: 'My original object'
} 
```

# 'Standard' cloning
We'll use a '_standard_' cloning by assign the source value to other constant

```js
const copiedObject = sourceObject

console.log('sourceObject', sourceObject.l1_2)
// My original object --> ✔️

clonedObject.l1_2 = 'My cloned object'

console.log('clonedObject', clonedObject.l1_2)
// My original object --> ✔️

console.log('sourceObject', sourceObject.l1_2)
// My original object --> ❌
```
[![Edit practical-violet-dki61](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/practical-violet-dki61?fontsize=14&hidenavigation=1&theme=dark)

As I said before, when I change property `l1_2` on cloned object, the value also changes on the source object.

Using this strategy, you are not copying the object at all.

# Using spread operator
This time I'll use the spread operator, that 'returns' every element in the object individually.

```js
console.log('sourceObject l1_2', sourceObject.l1_2)
// My original object --> ✔️
console.log('sourceObject l1_1.l2_1', sourceObject.l1_1.l2_1)
// 123 --> ✔️

const clonedObject = { ...sourceObject }
clonedObject.l1_2 = 'My cloned object'

console.log('clonedObject', clonedObject.l1_2)
// My cloned object --> ✔️
console.log('sourceObject', sourceObject.l1_2)
// My original object  --> ✔️

clonedObject.l1_1.l2_1 = '321'

console.log('clonedObject l1_1.l2_1', clonedObject.l1_1.l2_1)
// 123 --> ✔️
console.log('sourceObject l1_1.l2_1', sourceObject.l1_1.l2_1)
// 123 --> ❌️
```
[![Edit sleepy-rain-1gtsb](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/sleepy-rain-1gtsb?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

Now property `l2_1` is copied by value, we can change it and original object `l2_1` keeps original value, but if when I changed `l1_1.l2_1` (2th depth property) we get the same as the first attempt. 

Spread operator do a _shallow copy_ of the object. Only first level depth properties are copied by value, the nested ones keeps copying by reference.

# Using `Object.assign`
 
Like _spread operator_, just do a _shallow copy_, then I will not create the example, trust me, you will get the same result.
 
```js
const clonedObject = Object.assign({}, sourceObject)
```

# Using `JSON.parse` and `JSON.stringify`
This is a simple and fast way to deep clone an object, the point is convert the object to string with `JSON.stringify` and then get an object from the string using `JSON.parse`

Lets do it

```js
const clonedObject = JSON.parse(JSON.stringify(sourceObject))

clonedObject.l1_1.l2_1 = '321'

console.log('clonedObject l1_1.l2_1', clonedObject.l1_1.l2_1)
// 321 --> ✔️
console.log('sourceObject l1_1.l2_1', sourceObject.l1_1.l2_1)
// 123 --> ✔
```

Everything seems fine! :tada: 
But, did you notice `l1_1.l2_3.l3_3` property is a function? :cry:

```js
console.log('clonedObject l1_1.l2_3.l3_3', clonedObject.l1_1.l2_3.l3_3)
// undefined --> ❌️
console.log('sourceObject l1_1.l2_3.l3_3', sourceObject.l1_1.l2_3.l3_3)
// function l3_3() {} --> ✔️
```

[![Edit xenodochial-frost-q8k71](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xenodochial-frost-q8k71?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)

Oh, oh, functions are not copied using that method, then, what could  we do? The solution is iterate every nested property in the object and use, for example, the spread operator method. Hard and dirty work.

# Loadash to the rescue

[Lodash](https://lodash.com/) is a modular utility library that adds many funcionalities, and one of them is [`cloneDeep`](https://lodash.com/docs/4.17.15#cloneDeep) that do exactily we need: clone (deep) an object through nested properties, keeping all value types, even functions.

```js
import { cloneDeep } from 'lodash'

const clonedObject = cloneDeep(sourceObject)

console.log('clonedObject l1_1.l2_3.l3_3', clonedObject.l1_1.l2_3.l3_3)
// function l3_3() {} --> ✔️
console.log('sourceObject l1_1.l2_3.l3_3', sourceObject.l1_1.l2_3.l3_3)
// function l3_3() {} --> ✔️
```

[![Edit trusting-currying-2o6uf](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/trusting-currying-2o6uf?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)


# Performance
We'll copy source object 10.000 times using each method to compare time elapsed. Compare memory usage is no sense because `Object.assign` and _Spread Operator_ method are not copying nested property by value.

Results in my browser are following:

* Object.assign clone elapsed time: **4ms**
* Spread operator clone elapsed time: **22ms**
* JSON clone elapsed time: **47ms**
* Lodash clone elapsed time: **92ms**


As you can see, if you only need to do a shallow clone `Object.assign` is faster solution, and if you only need to clone values in nested properties (not functions or symbols), `JSON.parse(JSON.stringify())` could be a faster solution. But if you want make sure that all values are copied you must use _lodash_ or a similar solution.
 
Test yourself in codesandbox!

[![Edit romantic-shannon-epf1o](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/romantic-shannon-epf1o?expanddevtools=1&fontsize=14&hidenavigation=1&theme=dark)



<small>
Header picture: <a style="background-color:black;color:white;text-decoration:none;padding:4px 6px;font-family:-apple-system, BlinkMacSystemFont, &quot;San Francisco&quot;, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Roboto, Noto, &quot;Segoe UI&quot;, Arial, sans-serif;font-size:12px;font-weight:bold;line-height:1.2;display:inline-block;border-radius:3px" href="https://unsplash.com/@pic_parlance?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Karen Lau"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Karen Lau</span></a>
</small>

