---
title: "UI components library (Chapter II): Component anatomy and interfaces"
date: 2024-02-29
url: /ui-components-library-ii-anatomy-interfaces
cover: OIG2_2.jpeg
tags:
  - ui
  - frontend
  - ux
  - components
  - vue
---

> This is the second post of a series about why and how to create a UI components library. I'm going to focus on the code examples in Vue.js, but the concepts are valid for any other framework like React, Angular, LitElements, etc.
> 
> [Chapter I: Introduction]({{< ref "/blog/2024/2023-12-02-ui-components-library" >}})


Before to create a components library, it's important to understand the anatomy of a component, its interfaces and how to create a good "API" for the components.  

## Anatomy of a component

A component is a reusable piece of code that encapsulates a part of the user interface. That includes the visual part (HTML, CSS) and the behavior (JavaScript). The behavior includes the logic and the interaction with the user, managing events, emitting events, getting data, etc. 



The behavior is usually implemented with a framework like Vue.js, React, Angular, etc.




