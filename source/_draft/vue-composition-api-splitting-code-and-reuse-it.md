---
title: "Vue Composition API: How to split and reuse code"
date: 2021-11-2
permalink: vue-composition-api-how-to-split-and-reuse-code/
cover: /images/2021/vue-composition-api-3y1zF4hIPCg-unsplash.jpg
---
The Vue Composition API arrived at us in Nov 2018, 2 years ago, as a [preview](https://medium.com/vue-mastery/evan-you-previews-vue-js-3-0-ab063dec3547) and become with [some controversial](https://dev.to/danielelkington/vue-s-darkest-day-3fgh), because people believed composition API would replace the traditional Object API, but would not.

Anyway, after start to develop Vue apps using the composition API I don't want to go back, maybe for very small components makes you write more code than with the Object API, but in most cases, you can take advantage of the composition API features.

One of these features is code splitting, and by extension, code reusability.

# Options API

With the Options API we could reuse code through the mixins. The mixins in Vue works like a kind of object composition. Your component will use all the data, methods, etc presents in the mixin, and you can rewrite it. Let see an example. 

```vue
// Mixing
export default {
  props: {
    color: String,
    size: String
  },
  computed: {
    colorClasses: () => {
      return [`color-${this.color}`]
    },
    sizeClasses: () => {
      return [`size-${this.size}`]
    }
  }
}
```
Imagine we have components we can colorate or change the size, then our mixin includes the properties and the way (computed) to get the classes to apply, the mixing above do exactly that.

Now let write the component

```vue
// Component 
<template>
    <div :class="['component-a', ...colorClasses, ...sizeClasses]">
    ....
    </div>
</template>
<script>
import colorSizeMixin from '...'  
export default {
  mixins: { 
    colorSizeMixin 
  }
}
</script>
```

This thing works, but only looking at the component file, it's very hard to know from where we get the `colorClasses` and `sizeClasses`. You need to go to the mixin definition to know from where we are getting the values or which properties you could use in your component.

Mixins have another limitation, mixin can't adapt the behavior (in a simple way), I mean, you can't change the mixin behavior passing to it a flag, in this example, for example, a list of valid colors to accept.

# Composition API
Let's do the same with the composition API


```js
// useClasses.js
import { computed } from 'vue'
export default (props) => {
    const colorClasses = computed(() => [`color-${props.color}`])
    const sizeClasses =  computed(() => [`size-${props.size}`])
    
    return {
      colorClasses,
      sizeClasses
    }
      
}
```


```vue
// Component (Vue 3)
<template>
    <div :class="['component-a', ...colorClasses, ...sizeClasses]">
    ....
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import useClasses from './useClasses.js'

export default defineComponent({
  props: {
    color: String,
    size: String
  },
  setup(props) {
    const { colorClasses, sizeClasses } = useClasses(props)
  
    return {
      colorClasses,
      sizeClasses
    }
  }
})
</script>
```

Now we have the same functionality, the `colorClasses` and `sizeClasses` can be reusable in another component as we had using mixins. 

Composition API has some advantages:

* It's very easy to see from where the `colorClasses` and `sizeClasses` comes, and what input needs
* We don't need to "import" or use all the methods as in the mixins, for example here we can only get the sizeClasses computed value (`const { sizeClasses } = useClasses(props)`) without any modification in the `useClasses.js`
* We can parameterize the behavior, for example:


```js
// useClasses.js 
import { computed } from 'vue'
export default (props, allowedColors) => {
    const colorClasses = computed(() =>  allowedColors.indexOf(props.color) !== 1 
        ? [`color-${props.color}`]
        : []
         
    const sizeClasses =  computed(() => [`size-${props.size}`])
    
    return {
      colorClasses,
      sizeClasses
    }
      
}
```

Now we can pass to the `useClass` an array with all allowed colors that can be different in different components, with mixins that it's hard to achieve.

## Splitting the code

Using this technique we can split our component's code into different "uses" files, and if we put the related functionalities in the same "use" file we can reuse it. For example, we have a that needs to control the window scroll, we can write a "use" file like this:

```js
// useScroll.js
import { onBeforeUnmount, onMounted, Ref, ref } from '@vue/composition-api'

export default () => {
  const scrollY = ref(0)
  const scrollX = ref(0)
  // Before update the reactive values we store it in a local variable
  let localX = 0  
  let localY = 0

  const onScroll = (e) => {
    localX = window.scrollX
    localY = window.scrollY
  }

  //We only update reactive values every 100 to avoid a update it too much
  setInterval(() => {
    if (localX !== scrollX.value) {
      scrollX.value = localX
    }
    if (localY !== scrollY.value) {
      scrollY.value = localY
    }
  }, 100)

  onMounted(() => {
    window.addEventListener('scroll', onScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return {
    scrollX, scrollY
  }
}
```

Note that we can set the scroll position directly to the `scrollX` and `scrollY` but we want to avoid triggering the re-render of the component several times, and we store the values in a local variable, and every 100ms we dump the values to the reactive variables.

[vue-use-web](https://github.com/Tarektouati/vue-use-web) is a library inspired on that.

### Some tips passing values to the "use" files

In the example file `useClasses.js` I passed the component `props`, which means we pass all props, this is not very good, because the component using the "use" file must pass the necessary properties, and this couldn't happen.

It's better to define in the "use" signature the params we need. This is the previous code rewrite using this.

```js
// useClasses.js
import { computed } from 'vue'
export default (color, size) => {
    const colorClasses = computed(() => [`color-${color}`])
    const sizeClasses =  computed(() => [`size-${size}`])
    
    return {
      colorClasses,
      sizeClasses
    }
      
}
```
And in the component
```js
...
 const { colorClasses, sizeClasses } = useClasses(props.color, props.size)
...
```
You probably realized, that now the computed variables inside the use file will never be updated event if the property changes. That's because the prop.color is a string and is passed as copy not as reference.

To solve that, we must pass the properties through a function:

```js
...
 const { colorClasses, sizeClasses } = useClasses(() => props.color, () =>  props.size)
...
```

And change our "use" file, adding the `()` to call the wrapper function and get the "live" value of the property 

```js
// useClasses.js
import { computed } from 'vue'
export default (color, size) => {
    const colorClasses = computed(() => [`color-${color()}`])
    const sizeClasses =  computed(() => [`size-${size()}`])
    
    return {
      colorClasses,
      sizeClasses
    }
      
}
```

As personal opinion I being using Composition API for a long time, even in Vue 2.x, and I prefer it over Options API because I feel the code is better, easier to read, easier to reuse, and could be code non-related with Vue, I mean you can write all the logic without use anything related with Vue and after all the "calculations" put the results in a reactive variable, so this code could be used in other frameworks.
