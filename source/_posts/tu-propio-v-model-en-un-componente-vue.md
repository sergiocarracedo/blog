---
title: Tu propio v-model en un componente Vue (The right way)
date: 2019-12-05
cover: /images/vmodel-256302.jpg
tags: vue v-model js
---

Si has usado componentes de Vue (o incluso un input básico) habrás usado `v-model` para enlazar un valor en el componente padre y en el componente hijo.

```js
<input v-model="message">
// o
<datepicker v-model="date"></datepicker>
```
Si en el componente padre (aquel donde incluimos _datepicker_) modificamos el valor de `date` automáticamente se modificará el valor dentro del componente, de igual forma si el componente modifica el valor de `date` el valor se modificará en el padre. Esto lo que permite, por ejemplo, es que cuando en un campo input escribimos algo en el componente padre se pueda mostrar lo que escribimos usando `{% raw %}{{ date }}{% endraw %}`

Pues bien, realmente `v-model` es la combinación de la _prop_ `value` y el evento `input`, es decir para que nuestro componente disponga de su `v-model` debe tener un aspecto similar a este

```html
<template>
  <label>Fecha: </label>
  <input v-model="value" @change="$emit('input', value)">
</template>

<script>
export default {
  props: {
    value: {
      required: true
    }
  }
}
</script>
```
#### ¿Y ya está?
Pues no, no está. Si recuerdas, las propiedades de un componente deben ser inmutables ([One-way data flow](https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow)) desde el propio componente, y si te fijas metiéndolo dentro del `v-model` del `input` cada vez que se escriba algo en el, el valor de la propiedad cambiará, y esto (aunque funciona) genera un error como el siguiente en la consola:

> Error message: Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value.  

Para resolver esto nuestro componente debe usar una variable interna intermedia, que tome el valor de la propiedad de inicio y que cuando cambie emita el evento, también debemos tener en cuanta que cuando el valor de la propiedad cambie la variable local tome el nuevo valor.

La forma más simple de hacerlo es con una variable interna, a la que llamaremos `localValue` y dos **_[watchers](https://vuejs.org/v2/guide/computed.html#Computed-vs-Watched-Property)_**, uno para emitir el evento `input` con el valor de `localValue` y otro para modificar el valor de `localValue` si el valor de `value` cambia desde el exterior.

Y el componente nos quedará así:

```html
<template>
  <label>Fecha: </label>
  <input v-model="localValue">
</template>

<script>
export default {
  props: {
    value: {
      required: true
    }
  },
  data () {
    return {
      localValue: this.value
    }
  },
  watch: {
     localValue (newValue) {
       this.$emit('input', newValue)
     },
     value (newValue) {
       this.localValue = value
     }
  }
}
</script>
```

Como ves eliminamos el `@change` para que el cambio en el `<input>` pase a ser controlado en uno de los _watchers_.


A primera vista podría parecer que esto provocarían un bucle infinito, ya que al modificar `localValue` emitimos el evento que modifica el valor de `value` en el componente padre y este a su vez modifica de nuevo `localValue` repitiéndose otra vez, pero los _watchers_ solo se ejecutan cuando el valor cambia, es decir como el valor de `localValue` y `value` coincide una vez emitido el evento `input` el segundo _watcher_ no se dispara deteniendo el bucle.  

Podemos hacerlo usando **propiedades calculadas** (_computed_), empleando los _getters_ y _setters_ de estas:
 
```js
...
computed: {
  computedValue: {
    set(value) {
      this.localValue = value
    },
    get() {
      return this.localValue
    }
  }
}
...
```
pero seguimos necesitando la variable `localValue` y el _watcher_ de `value`, con lo cual para mi gusto, a parte de no ahorrar código, complicamos la legibilidad.

De sencilla esta forma cumplimos con la regla de [_One-Way Data Flow_](https://vuejs.org/v2/guide/components-props.html#One-Way-Data-Flow) sin complicar demasiado el código.

Como último apunte podríamos llevar esto a un _mixin_:

```js
// custom.vmodel.mixin.js
export default {
  props: {
    value: {}
  },
  data () {
    return {
      localValue: this.value
    }
  },  
  watch: {
     localValue (value) {
           this.$emit('input', value)
         },
    value (value) {
      this.localValue = value
    }
  }
}
```
y solo lo tendríamos que importar en nuestro componente que quedaría así:

```html
<template>
  <label>Fecha: </label>
  <input v-model="localValue">
</template>

<script>
import customvmodelMixin from './custom.vmodel.mixin.js'
export default {
  mixins: [customvmodelMixin]
  props: {
    //Otras propiedades
  },
  data () {
    return {
      // Más variables
    }
  },  
}
</script>
```
