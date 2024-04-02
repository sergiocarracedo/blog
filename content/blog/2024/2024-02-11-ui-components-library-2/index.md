---
title: "UI components library (Chapter II): Component anatomy and interfaces"
date: 2024-04-09
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

A component is a reusable piece of software that encapsulates some parts of the user interface. 

A component it's similar to a function, or an object. All of them get some input and returns some output. The function (if it is not pure) or the object it will use another values like the internal state and the environment to execute the action changing the output, but basically we can think in a function like a black box that gets some inputs and produced some outputs and it can change the internal state. 

If we take a look inside the black box, probably that function will use another functions to do part of the work.

![Component like a function](function.png)

The same happens with a component. A component is a black box that gets some inputs (props, events) and produced some outputs (rendered HTML, events, etc). Inside the component, we can have another components, and the component can maintain an internal state and/or could use values from the environment (like the global state store, the router, etc).

At this point we can define the component's interfaces, I usually like to divide those interfaces in two categories, depending on the developer's point of view: external and internal interfaces.

### External interface
It's the interface the developer can use to interact with the component. 

* **Props**: The values the component can receive from the parent to modify the behavior. You can think in the props like the function's arguments.
* **Events**: The events **emitted** by the component. 
* **HTML & CSS**: Its goal of a component: to render HTML and CSS. The component returns the HTML and CSS to be rendered in the browser.
* **[Slots](https://vuejs.org/guide/components/slots.html)**: In some frameworks like Vue, the component can receive content from the parent to render a fragment. Are similar to props but allow to pass random content instead of values.

### Internal interface
This is the interface that the component uses to interact with the subcomponents, the browser, etc In this category we can find:

* **Store state**: The component can get values from a global store (Pinia, Vuex, Redux, etc) to modify the behavior. (This is not recommended as is hard to track, but sometimes is necessary)
* **Browser events**: The component captures browser events like click, mouseover, etc.
* **Subcomponents**: The component can use another components to do part of the work. The subcomponents are like the functions the component uses to do the work. The component interacts with the external interface. This is like a matrioska.
* **Network**: The component do network request to get or set data. (We will talk about this in another post) 



![Component's anathomy](interface.png)


## Writing a good component's API

As you know the components' anatomy and the interfaces, it's time to write a good API for the components.

### Props
The props names should represent 




