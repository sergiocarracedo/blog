---
title: Start using Typescript in Vue. The easy way.
url: 2020/02/27/start-using-typescript-in-vue-easy-way/
date: 2020-02-27 10:58:02
tags:
- vue
- typescript
- js
cover: pexels-photo-1272328.jpeg
---
If you program in _JavaScript_ probably somebody told you about the advantages of using _Typescript_ or you thought about start using it.

As you can see in this chart, more than 50% _Javascript_ developers are using _Typescript_

![](/images/javascript_flavors_section_overview.png)
*Source: https://2019.stateofjs.com/javascript-flavors/*

Start to use a new technology, new paradigm, new framework or anything could be hard and challenging, this is why is important start integrating new technologies avoiding friction with previous one. Today I'll try to show you the easiest way to start using _Typescript_ in your Vue projects.  

In case of _Typescript_ we "just" will add a layer over _Javascript_ then I'll try to explain easier way to use _Typescript_ with _Vue_ even in existing projects.

Before start, you should know _Typescript_ using benefits. You have thousands blog's post talking about that:
* https://apiumhub.com/tech-blog-barcelona/top-typescript-advantages/
* https://ionicframework.com/docs/v3/developer-resources/typescript/
* https://medium.com/swlh/the-major-benefits-of-using-typescript-aa8553f5e2ed
* https://alligator.io/typescript/typescript-benefits/
* ...

Most repeated benefit is **"types"**. _Javascript_ is a weakly typed language (variables and consts have types, but you can not set its type. Only by means of value)

## Prerequisites
I assume you are using `vue-cli`. You must be sure you are using version 4.0.0+

## Step 1: Adding Typescript
First step is add _Typescript_ using `vue-cli`

```bash
vue add typescript
```

Vue cli starts to add _typescript_ package and necessary dependencies. Also create and update configuration files like `tsconfig.json`, It needs ask you some questions to configure properly.

Let view each question in detail and the "correct" answer.
```
? Use class-style component syntax? (Y/n)
```
If you want start to use [class-style component syntax](https://vuejs.org/v2/guide/typescript.html#Class-Style-Vue-Components) you should answer "**yes**". You can answer "no" and you can not use it, but anything else changes. 

```
? Use Babel alongside TypeScript (required for modern mode, auto-detected polyfills, transpiling JSX)? (Y/n)
```
"Yes". You were probably already using it.

The next two questions are the most important

```
? Convert all .js files to .ts? (Y/n)
```
:warning: You must answer "**No**" to avoid Vue cli rename all your files to `.ts`. If you do that you will have to refactor all your project files to _Typescript_

```
? Allow .js files to be compiled? (y/N)
```
:warning: You must answer "**Yes**". It's the same as, in `tsconfig.json`, set the value `allowJs` to `true`. If you don't anwser "yes" you will receive a lot of error messages, because the _typescript_ transpiler tries to transpilate `.js`

## Step 2
No step 2. You just added _Typescript_ support to your project and everything should work fine as usual.

## Writing your first Vue component in _typescript_
When you write a Vue component in Javascript, you probably write something similar to:

```js
<template>
 ....
</template>
<script>
export default {
  props: ....,
  data () ....,
  methods: ....
}
</script>
```
To write a Vue compoment using _Typescript_ you need to set the scripting language using the attribute `lang` in the script tag.
Also, as _Typescript_ needs to infer types, you must define your components with `Vue.component` or `Vue.extend` (I prefer second one)

Then our component look like:

```typescript
<template>
 ....
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: ....,
  data () ....,
  methods: ....
})
</script>
```

:tada: Done! You have your first Typescript Vue component.

The point is you can start using _Typescript_ and keep your previous code. You don't need to rewrite all components, or you can do step by step.

I recommend you to read [Vue documentation about Typescript support](https://vuejs.org/v2/guide/typescript.html)

In future blog posts I show how use multiple mixins in _Typescript_ and other tips about _typescript_








