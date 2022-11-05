---
title: "Export and import Vuex state"
date: 2020-07-22
url: 2020/07/22/export-and-import-vuex-state/
cover: vuex-export-import.jpg
tags: 
  - js
  - vue
  - store
---

If you are familiarized with Vuex, you must know that Vuex is a [state management pattern library](https://vuex.vuejs.org/#what-is-vuex) for Vue applications. Vuex centralizes the application's state and how components, and other code parts, change it.

You can find a lot of articles talking about Vuex, I even wrote 2 articles 3 year ago talking about it: 
[Vuex el redux de VueJS I]({{< ref "blog/2017/vuex-el-redux-de-vuejs-i" >}} "Vuex el redux de VueJS I")
and
[Vuex el redux de VueJS II]({{< ref "blog/2017/vuex-el-redux-de-vuejs-i" >}} "Vuex el redux de VueJS II") (_Spanish_)

But today I will write about an edge case related to **vuex**, as you could read in the title, about how to export and import Vuex state.

Is a very easy process, and is not necessary for most of the applications, but I think is useful to know how to do it.

### Export
Export is very simple, you only need to get the state, for example from a component

```js
const savedState = this.$store.state
```

And _voilà_ you have the store state, you could save in Local Storage to keep the state even if the user closes or reloads browser's tab. Really you don't need to write code for that, exists an awesome library that does that: [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate)

## Import
You can think that import the state is similar to export:
~~this.$store.state = savedState~~
If you try, you will get an Exception

> Uncaught Error: [vuex] use store.replaceState() to explicit replace store state.

And if you read carefully, the exception message gives to you the solution: Use [`store.replaceState()`](https://vuex.vuejs.org/api/#replacestate)

This store method replaces all the store state (the root state). For example, Vue Dev Tools uses it to do the _time travels_.

## Applications

I can think of a few applications for this, as I mentioned before, save the state to Local Storage, or export and save state to a JSON file to save your application settings, etc...

