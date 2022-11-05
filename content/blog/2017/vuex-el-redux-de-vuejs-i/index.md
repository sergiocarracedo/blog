---
title: "Vuex el Redux de Vue.js (I)"
date: 2017-04-03
url: 2017/04/03/vuex-el-redux-de-vuejs-i/
cover: pexels-photo-99541_0.jpeg
---
[**Vuex**](https://vuex.vuejs.org/en/) se define a si mismo como una _librería de control del patrón de estado._ Veremos lo que implica este patrón, pero antes veamos los conceptos básicos:

### Estado (state)

El estado es un objeto plano, este contiene los valores que definen tu aplicación en un momento dado. Es la **única fuente de verdad**, es decir, es el único lugar donde consultar estos valores. Aclarar que el estado es el conjunto de valores que usa la aplicación para reaccionar como lo hace en un momento determinado, por ejemplo, si estamos mostrando una lista de _posts de blog_, esta lista es parte del estado, la página que estamos viendo es otra parte del estado. 

```
const state = {
    counter: 0,
    blog: {
        posts: []
        currentPage: 0
    }
}
```

El paradigma subyacente de este patrón es que, en una SPA (_Single page application_) los componentes acceden y manipulan datos que son usados en otros componentes y que cualquier cambio en un valor debe trasladarse de forma sencilla a todos los componentes que lo necesitan, por ello el **estado debe ser la única fuente de verdad**.

Además, hay una estricta regla que debe cumplirse: **los componentes no pueden modificar el valor de estado directamente.** Para garantizar que un cambio de estado se traslada a todos los componentes, cualquier cambio se debe hacer mediante _mutations_, que explico un poco más abajo en este mismo post.

### Getters

En ocasiones necesitamos manipular el resultado de un estado, por ejemplo, paginar los resultados o filtrar por título, normalmente esto lo realizaríamos en el componente, pero si queremos reusar esa función podemos usar los _getters_, que no son más que datos derivados el estado actual.

```
getters: {
  postsActive: state => {
    return state.blog.posts.filter(post => post.active)
  }
}
```

### Mutaciones / Mutations

Como deciamos, la única forma de alterar el estado es usando mutaciones, que son algo parecido a lanzar un evento. Cada mutación tiene un **tipo (type)** y un **manejador (handler).**

El_handler_ es una función que recibe como primer argumento el estado actual, y puede recibir opcionalmente un _payload_ como segundo parametro.

```
mutations: {
	nextPage (state) {
	  	// mutate state
	  	state.blog.currentPage++
	},
	prevPage (state, payload) {
		state.blog.currentPage = state.blog.currentPage - payload.pages
	}
}
```

Un _mutation_ nunca debe ser llamado directamente, la forma de hacerlo es usar **store.commit('mutation type')**, por ejemplo:

```
store.commit('nextPage')
```

Las mutaciones siguen las reglas de reactividad de **vue.js**, esto es muy importante, por que cuando el valor del estado sea alterado mediante mutaciones, cualquier componente que esté observando el estado, recibirá el nuevo valor.

Algo que debemos tener en cuenta y que es MUY IMPORTANTE, **las mutaciones deben ser síncronas. **Supongamos que tenemos un _mutation_ que al ser lanzado hace una llamada asíncrona para actualizar los post del blog y otro que simplemente elimina uno de la lista. Al ser el primero asíncrono no podemos garantizar el orden real en el que se alterará el estado.

Esto lo veremos en detalle en el siguente post y la forma en la que resolver la necesidad de hacer llamadas asíncronas.
