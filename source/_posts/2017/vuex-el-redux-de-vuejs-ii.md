---
title: "Vuex el Redux de Vue.js (II)"
date: 2017-04-06
permalink: 2017/04/06/vuex-el-redux-de-vuejs-ii/
cover: /images/pexels-photo-99541_1.jpeg
---

En la {% post_link 2017/vuex-el-redux-de-vuejs-i primera parte %}, expliqué algunos de los conceptos básicos de **vuex: **El **state, ** los **getters** y las **mutations**. Si recuerdas, el paradigma de una _librería de control del patrón de estado_ como **vuex** es mantener el _state_ como única fuente de verdad, y para ello los valores del estado solo pueden ser modificados mediante _mutations_, que deben ser además **síncronas**. Si necesitamos hacer "cambios" de forma asíncrona podemos hacer uso de las **acciones / actions.**
   
> Hago aquí un pequeño inciso, aunque parezca repetitivo, escribiré al menos una vez todos los conceptos en castellano y en ingles; en castellano para que se entiendan mejor los conceptos y la lectura no sea extraña y en inglés para mantener la misma terminología que **vuex.**
   
### **Acciones / Actions**
   
Las acciones son similares a las mutaciones, con dos diferencias principales:

*   Las acciones no modifican el estado, sino que las acciones **emiten mutaciones (commit mutations)**
*   Las acciones pueden contener **operaciones asíncronas**.

Las acciones reciben un objeto **contexto (context)** que expone los mismos métodos y propiedades que el **Store** (el store no es más que la instancia de vuex que contiene el estado, las mutaciones, las acciones y los getters.

Una acción se vería así:

```
actions: {
   getAllPosts: (context) => {
    Api.getAllPosts().then(response => {
      let posts = response.data;
      context.commit(types.RECEIVE_POSTS, { posts })
    })
  }
}
```

Esta acción, como ves es asíncrona, ya que descarga una lista de _posts_ haciendo uso de un objeto API, y una vez resuelta la promesa, emite un _mutation _pasándole como _payload_ la lista de posts.

Las acciones tampoco se llaman de forma directa, si no que lo hacemos mediante un _dispatch_.

```
store.dispatch('getAllPosts', {payload})
```

Como ves, la acción puede también recibir un _payload_, de la misma forma que una mutación.

Como hemos visto las acciones pueden ser asíncronas y si necesitamos saber cuando se ha ejecutado la podemos devolver una _promesa_ que el _dispacher_ se encargará de devolver. Modificando el ejemplo anterior:

```
actions: {
  getAllPosts: (context) => {
    return new Promise((resolve, reject) => {
      Api.getAllPosts().then(response => {
        let posts = response.data;
        context.commit(types.RECEIVE_POSTS, { posts })
      })
    }
  }
}

// y de esta forma llamamos a la acción y obtenemos su promesa
store.dispatch('getAllPosts').then(() => {
  //......
})
```

Y ahora, ¿como usamos todo esto en la vida real?. La respuesta es sencilla, (doy por hecho que tienes vuex [instalado](https://vuex.vuejs.org/en/installation.html) como dependencia de tu proyecto). Por un lado debemos crear un _store_ de esta forma:

```
// Asegurate de llamar a Vue.use(Vuex) primero

const store = new Vuex.Store({
 state: {
   count: 0
 },
 mutations: {
    increment: (state) => {
      state.count++
    }
 }, 
 actions: {
 },
 getters: {
 }
})

//Ahora puedes modificar el estado y acceder a el de esta forma
store.commit('increment');
console.log(store.status.count); // retorna 1
```

### Usando el estado y las mutaciones en componentes

Ahora, lo lógico es que queramos acceder al estado o emitir una mutación desde un componente. Lo primero es inyectar el _store_ recién creado en Vue, para que este se inyecte en todos los componentes (por el momento no entraremos en más detalles, pero es posible usar un _store_ de forma local en un componente)

```
const app = new Vue({
 el: '#app',
 store,
 ......
})
```

Para acceder al store desde un componente lo hacemos de la sigueinte manera:

<pre>this.$store.state.count</pre>

Lo normal es que queramos usar la reactividad, así que solo tenemos que hacer uso de las **propiedades computadas **(_computed properties_)

```
const Counter = {
   //....
  computed: { 
    count() { return this.$store.state.count } 
  } 
}
```

De un modo similar, podemos llamar a las acciones o a las mutaciones desde un componente:

```
this.$store.dispatch('accion')
this.$store.commit('mutacion')   
```

Todo lo que aquí he contado, no es más que la punta del iceberg de **vuex**, hay mucho más detrás (por ejemplo los _mapping helpers_, los módulos, el _scaffolding_). Yo os recomiendo leer en detalle la documentación https://vuex.vuejs.org/en/

También he dejado un github https://github.com/sergiocarracedo/vuex-demo un proyecto de ejemplo, algo sencillo, simplemente descarga una lista de posts y los pagina.

Espero que estos dos posts sobre **vuex** te gustasen y espero hacer en el futuro algún otro entrando más en detalle.
