---
title: "UI components library"
date: 2023-12-10
url: /ui-components-library
cover: sen-rgP93cPsVEc-unsplash.jpg
tags:
  - ui
  - frontend
  - ux
  - components
  - vue
---

> This is the first post of a series of posts about why and how to create a UI components library. I'm going to focus the code examples in Vue.js, but the concepts are valid for any other framework like React, Angular, LitElements, etc.

In this first post I'm going to talk about the component why you should (or you should not) create a UI components library, but first lets define what is a UI components library.

## What is a UI components library and what is a design system?

A UI components library is a set of reusable components that can be used to build a user interface. These components can be used in different projects and applications. A component joins app behavior, visual behavior and presentation. It's very typical the components represents the visual style of the company or the product.

An example of this is the [Material Design](https://material.io/design) library, that is Google's design system, and it's used in all Google's products and services (and as is open source anyone can create apps with the same visual style).

A design system is a set of rules and guidelines that define how an application or web and all its elements should look like, and how they should behave. It can ensure the consistency of the application and the quality. A design system it a concept over the UI components (and UI components library), as those rules applies to the components (and usually defines some of them), but also applies to other elements like the typography, the colors, the spacing, layout, etc. 

## Advantages of using a UI components library
I think that use a UI components library is something doesn't need discussion, it's a must in most cases. But let's see some of the advantages of using a UI components library.

* **Consistency**: All the components will have the same look and feel, and will behave in the same way. This is specially important when you have a big team working in the same project, as you can ensure that all the components will look and behave in the same way.
* **Re-usability**: You can reuse the components in different projects and applications. This is a huge advantage, as you can save a lot of time and effort. This is specially important for big and complex components, for example a date picker, or a table component. You dont need to write the code to display the component and the logic to make it work, you just need to use the component.
* **Maintainability**: As you have a single source of code for the components, you can maintain them in a single place, and all the applications that use them will be updated (we will see in other post how to manage the breaking changes and the versions). This is specially important when you need to fix a bug or add a new feature to a component, as you only need to do it once in one place.
* **Encapsulation**: This is related to the re-usability. With well encapsulated components you only need to worry about the component interfaces, the internal implementation can change without affecting the rest of the application. Remember that is not only affects to the code, also affects to the visual style, so you can change the visual style of a component without affecting the rest of the application.




## Why to create a UI library?



## Why to NOT create a UI library?



## Characteristics of a good UI library

- Flexibility
- Adaptability
- 
