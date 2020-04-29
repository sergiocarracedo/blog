---
title: "Understanding Javascript's event loop: Macrotasks and microtasks"
date: 2020-04-27
tags: js loop
cover: /images/js-event-loop-106155.jpg
---
Despite what it may seem, Javascript execution in a browser is _synchronous_. It is a similar thing as a _multitask_ OS running in a mono-core processor, in that case multitasking is "fake", because the processor can only execute one instruction at a time, but the OS controls the execution and distribute the processor time between each app, making it looks like multitasking.

In _Javascript_ we have a similar approximation in a way to distribute the execution time. It's not exactly the same. Lets see how it works.

# Event loop

When you write a program in JS, every script you add or every instruction will be added to a queue in the _event loop_

The engine starts to run every instruction in the same order you wrote, running all tasks, and when finish, it waits for more tasks and then starts again.

Every task in this queue is a **macrotask** and queue is the **macrotask queue**. Some examples of macrotasks are:

* Every `<script>` loaded and all the instructions on them
* `setInterval` or `setTimeout` command
* DOM event: `window.load`, `mouseout`, etc 

In example below, we run some task: calculate the 6th element on Fibonacci series and get a string with the English alphabet. I put some `console.log` as code execution checkpoint to show the execution order.

{% iframe https://codesandbox.io/s/romantic-lewin-i1fjz?fontsize=14&hidenavigation=1&previewwindow=console&runonclick=1&initialpath=macrotasks.html&module=/src/macrotasks.js&theme=dark 100% 500px %}

The result is
```
Checkpoint 1 
13
Checkpoint 2: 0.5600000149570405ms 
ABCDEFGHIJKLMNOPQRSTUVWXYZ 
Checkpoint 3 
```

As you can see, the tasks run in order, string generation doesn't start until fibonacci function finish, even if the function takes long time to be completed.


Let's see what happens when you use `setTimeout`. When you set a timeout, you expect your function will be executed after the timeout you set. For example `setTimeout(() => console.log('here'), 1000)` should print in console 'here' after **1s**. You expect this always happens, no cares about next task or instructions. If you expect that, you are wrong. Check next code:

{% iframe https://codesandbox.io/s/romantic-lewin-i1fjz?fontsize=14&hidenavigation=1&previewwindow=console&runonclick=1&initialpath=macrotasksSetTimeout.html&module=/src/macrotasksSetTimeout.js&theme=dark 100% 500px %}

We have a long task after the timeout. Timeout should be executed after **1s**, but next task takes **5s** to be completed, and your timeout not executed yet. Ok let's wait long task end, and... nothing, your timeout still missing. Next macrotask is our string generator, this task is executed and, finally, after all macrotask, our timeout is executed.

That occurs because, when you use a timeout, you are moving the task at the end of the queue, an at this point is when js engine checks if your timeout should be executed.

## Taking advantage

You can take advantage of that event loop behavior, for example, you can put a high CPU usage task inside a `setTimeout`, even with 0ms of dispatch time, and this huge task will be executed after following tasks.
That is a fast solution, but if you have more than 1 or 2 long tasks, you are only moving the problem to the end of the queue, but problem is still there.

## Using Promises

You could think of using promises, for example

{% iframe https://codesandbox.io/s/romantic-lewin-i1fjz?fontsize=14&hidenavigation=1&previewwindow=console&runonclick=1&initialpath=macrotasksPromise.html&module=/src/macrotasksPromise.js&theme=dark 100% 500px %}

But the promise starts to run the code inside just after call the promise's constructor, and your program is stucked again. You can resolve it using `setTimeout` again, but in this case we are creating a **microtask**:

## Microtasks
Microtasks are tasks created in promises (then, catch, finally). The microtask queue run immediately after every macrotask, before render or before the next macrotask

{% iframe https://codesandbox.io/s/romantic-lewin-i1fjz?fontsize=14&hidenavigation=1&previewwindow=console&runonclick=1&initialpath=microtasksPromise.html&module=/src/microtasksPromise.js&theme=dark 100% 500px %}

In that example, `setTimeout` creates a new macrotask, so it will run after macrotask loop, Promise creates a microtask that will be executed after next macrotrask ends, in this case after all script instructions but before the queued macrostask. And finally will run the `setTimeout` macrotask

There are another way to create a microtask, using [`queueMicrotask`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask) that is a recent addition to the standard. it's supported by most modern browsers (https://caniuse.com/#search=queueMicrotask) but if not, you can use this polyfill:

```js
if (typeof window.queueMicrotask !== 'function') {
  window.queueMicrotask = function (callback) {
    Promise.resolve()
      .then(callback)
      .catch(e => setTimeout(() => { throw e }))
  };
}
```

And works exactly as the previous example but syntax is clearer

{% iframe https://codesandbox.io/s/romantic-lewin-i1fjz?fontsize=14&hidenavigation=1&previewwindow=console&runonclick=1&initialpath=microtasksPromise.html&module=/src/microtasksPromise.js&theme=dark 100% 500px %}

## Vue
If you are using Vue, maybe you can show a loader or some kind of indicator when you go to execute a long task.

```js
...
  data: {
    return {
      loading: false
    }
  },
  methods: {
    ...
    longTask () {
      this.loading = true
      // doing your long task stuff
      this.loading = false
    }
  }
...
```

You could think that the loader will be showed before start the long task and hidden after it, but that not happens, you never see the loader, because the reactive properties are "checked" after the loop and at this point `this.loading` is `false`.

You can try to use `$.nextTick` but the result it's the same, you need to get out of the event loop with your long task


```js
...
  data: {
    return {
      loading: false
    }
  },
  methods: {
    ...
    longTask () {
      this.loading = true
      queueMicrotask(() => {
        // doing your long task stuff)
        this.loading = false      
      }      
    }
  }
...
```

Above I wrote that Javascript is _synchronous_, but I lied :sweat_smile:. You can use [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), this is topic for another post... :simple_smile:

More info: https://javascript.info/event-loop


