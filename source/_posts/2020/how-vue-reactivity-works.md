---
title: "How Vue's reactivity works (I): Object.defineProperty"
date: 2020-09-08
permalink: how-vue-reactivity-works-i/
tags:
  - vue
  - reactivity
  - javascript
cover: /images/object-define-property-pb-2361801.jpg
---

Maybe you don't need to know how Vue reactivity works under the hood to make Vue apps, but anyway it will be interesting and useful.

In this context **reactivity**, means, simplifying, the capacity to detect a data change and do something after that. 

In a Vue component, **reactivity**, means that the component will be re-rendered (totally or partially) after a change in the value of a variable to show the component updated with the new value. For example in this basic component:

```html
<template>
  <div>
      <h6>Value: {{ clickCount }}</h6>
      <button @click="onClick">Add 1 more</button>
  </div>
</template>
<script>
export default {
  data () {
    return {
      clickCount: 1
     }
  },
  methods: {
    onClick () {
     this.clickCount = this.clickCount + 1
    } 
  }
}
</script>
```

Every time you click on the "Add 1 more" button, the value of _clickCount_ variable is increased in one unit and Vue starts the _mechanism_ to re-render the component showing the new value in the template. How is Vue able to know when a variable changes its value?

## _Object.defineProperty_ API

The answer is [_Object.defineProperty_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

This is a static method that defines or modify a property on an object

```js
const myObject = {}
Object.defineProperty(myObject, 'myProperty', {
  value: 'myValue'
})
```

Probably you realized that is the same as `myObject.myProperty = 'myValue'`, but there an important difference: we can configure the property behaviour, for example:

```js
const myObject = {}
Object.defineProperty(myObject, 'myProperty', {
  value: 'myValue',
  writable: false
})

myObject.myProperty = 1

console.log(myObject.myProperty) // 'myValue'
```

In this situation, if you try to change the value of the property, it will not change, and if you are using _strict mode_ you will get an exception.

With `Object.defineProperty` you could define a getter and setter for the object property as shown in the following example. Every time you try to assign a value to your property getter is called.

```js
const myObject = {}
let myProperyValue = 'my value'

Object.defineProperty(myObject, 'myProperty', {
  get: () => {
    console.log('getter')
    return myProperyValue
  },
  set: (newValue) => {
    console.log('setter')
    myProperyValue = newValue
  }
})

myObject.myProperty = 123

console.log(myObject.myProperty)
// setter
// getter
// 123
```
[Run in PlayCode](https://playcode.io/666482) 

Note that if you use a getter or a setter you can't access to the property's value directly, I mean, you have to store property's value somewhere else _place_.

Back in Vue, when you create a component you should define reactive values in `data` key
```js
export default {
  data () {
    return {
      clickCount: 1
     }
  },
  ...
}
```

Under the hood, Vue creates an object with the properties you defined using _Object.defineProperty_ and generates a getter and a setter. Every time a variable's value changes, the setter intercepts the change and launches Vue's re-render process with the new value.

This is the reason why you cannot add new variables to your component directly

```js
export default {
  data () {
    return {
      clickCount: 1      
     }
  },
  ...
  methods: {
    someMethod () {
      this.newClickCount = 1
      ...
    }
  }
  ...
}
```
In the example above, `newClickCount` will not be reactive because Vue can't know when you add a new property directly.

If you need to add a new property after the component's definition Vue provides `Vue.set` or `vm.$set`

```js
this.$set(this.someObject, 'b', 2)
```

But this not work with the root element, I mean we cannot add a new variable to `data`

_Object.defineProperty_ works since IE9, and in all modern browsers https://caniuse.com/?search=DefineProperty

## How does it for arrays?

It doesn't!. If you try to repeat the previous example with an array property:

```js
const myObject = {}
let myProperyValue = []

Object.defineProperty(myObject, 'myProperty', {
  get: () => {
    console.log('getter')
    return myProperyValue
  },
  set: (newValue) => {
    console.log('setter')
    myProperyValue = newValue
  }
})

myObject.myProperty = [1, 2, 3, 4]

console.log(myObject.myProperty)
// setter
// getter
// [1, 2, 3, 4]
``` 

setter works because, is a direct assignation, but we usually don't work with arrays in that way, we use `.push`, `slice`, etc..


```js
myObject.myProperty.push(5)

console.log(myObject.myProperty)
// getter
// getter
// [1, 2, 3, 4, 5]
```
[Run in PlayCode](https://playcode.io/666496)

We can see getter has been called twice, but the setter has not been called

### How does Vue resolve it?

Simple, patching vanilla JS array methods 

Vue stores the original method, and create a new that notifies the change and execute the original method

You can see how it does in detail on: 
https://github.com/vuejs/vue/blob/bb253db0b3e17124b6d1fe93fbf2db35470a1347/packages/vue-template-compiler/build.js#L1087

## ES6 Proxies

There is another way to know when a value change (and other things) in JS since ES6: [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

Vue 3 uses _Proxies_ instead of _Object.defineProperty_ to make the reactivity under the hood. I will write a post about Proxies soon.
  
