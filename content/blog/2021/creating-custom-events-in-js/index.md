---
title: "Creating custom events in JS"
date: 2021-10-18
url: creating-custom-events-in-js/
cover: custom-events-1314544.jpg
tags:
- js
---
When you try to encapsulate features but need to interact with async events or events generated by user interaction, one of the easiest ways to achieve that is using event and event handlers (often called callbacks).

Imagine you have a UI component to render a TO-DO list with a button to create a TO-DO item through a form. This component is self-encapsulated, you only need to put the component in your app, and the component itself renders the list, the button, the form, do the request to API, etc.

You want to do some action after the TO-DO creation, for example, display a toast or an alert with some message.

You can alter the component and add that behavior into the component, but this reduces the reusability of the component because in other parts of your app (or in other app) this behaviour makes no sense.

## Events and callbacks to the rescue
A callback for an event is a piece of code that runs when the event is dispatched. We are using that a lot in JS, for example when we want to do something after the user interacts with an element.

```js
element.addEventListener('click', () => { alert('hello') }, ...)
```

With the line above, the code (listener or callback) will run when the user clicks the element

Browser's API provides a lot of events we can _handle_, but we want to do it by ourselves, and it's very easy:

First, we need to expose outside the component I mentioned before a method to set the callback for example `setToDoCreateEventHandler`

> To simplify the example we will create a simple event dispatch system that only allows one handler

This function will receive as param a function will be called when the event dispatches

For example:
```ts
// Main app
import myTodoComponent from 'myTodoComponent'
myTodoComponent.setToDoCreateEventHandler(() => alert('TO-DO created'))
```

The implementation of the method in the component could be something like:

```ts
// Component
let toDoCreateEventHandler: Function = () => {}
export function setToDoCreateEventHandler (handler: Function): void {
  toDoCreateEventHandler = handler
}
```

* We have the variable `toDoCreateEventHandler` where to store the handler, by default I set an empty function `() => {}` that doesn't do anything just to avoid manage `null` values (but you can allow `null` or `undefined` as a handler and check it before dispatch it)
* Our exposed `setToDoCreateEventHandler` function is in charge of set the handler to the variable

Ok, now we can store the handler, but we need to dispatch it, to do it we only need to execute the handler in the part of the component where the TODO creation is complete, imagine is after sending the values to API and get an OK

```ts
// Component
...
axios(...).then(() => {
  ... // Do other things
  toDoCreateEventHandler()
})
...
```

*That's all* :joy:, after saving the TODO doing a call to the API using _axios_ (in this example) we call the handler stored in the variable, and our code outside the component will be executed.

As you can see it's very easy to create custom components.

We can improve our event handler allowing to add more than one listener/handler, for example

```ts
// Component
let toDoCreateEventHandlers: Function[] = []
export function addToDoCreateEventHandler (handler: Function): void {
  toDoCreateEventHandlers.push(handler)
}
...
axios(...).then(() => {
  ... // Do other things
  toDoCreateEventHandlers.forEach(handler => handler())
})
...

```
We also need to define a method to remove a handler, but I will let you do it.

You could think we can achieve this using _Promises_, and you are partially right, but promises only [can be resolved once](https://stackoverflow.com/questions/20328073/is-it-safe-to-resolve-a-promise-multiple-times)

Event dispatch / handler has the advantage you can attach to the event at any moment (and wait for the new dispatches) and are widely used in the standard JS libraries.
