---
title: "Desacoplando la interacción con una API en Vue: vue.$api"
date: 2019-09-09
cover: /images/vue-api.jpg
---
Durante el desarrollo de una web, una SPA en _Vue_ es muy habitual que ese desarrollo implique interactuar con una _API_ y lo habitual será que uses _[axios](https://github.com/axios/axios)_ para ello (aunque lo que voy a explicar valdría para cualquiera otra librería)

Es muy habitual que cuando necesitamos interactuar con un _endpoint_ de la _API_, lo hagamos directamente desde el controlador, entendiendo por controlador el componente que se encarga de responder a una ruta.

Por ejemplo:

```
....
data() {
 return {
  users: []
 },
...
methods:
 ...
 getUsers(page) {
   axios({
      method: 'get',
      url: 'https://reqres.in/api/users',
      data: {
        page          
      }
    }).then(res => {
      this.users = res.data.data
    }).catch(res => {
      // Do something on error
    })  
 }   
...    
```
Esto cumple su función básica que es la de pedirle a la _API_ la lista de usuarios de la página indicada y guardarlos en _users_ para que este disponible para renderizar.

Se me ocurren varios problemas que nos podemos encontrar a botepronto:
* Si necesitamos pedir los usuarios desde varios controladores tendríamos que duplicar este código.
* Si para hacer la llamada necesitamos añadir alguna cabecera de autorización, token o similar, tendríamos que saber en todas las llamadas a la _API_ que usen esa autentificación aplicarlo y usarlo desde una variable de entorno que deberíamos conocer.
* La gestión de errores puede ser tediosa, si por ejemplo siempre que la _API_ responda un error lo vamos a mostrar en pantalla de la misma forma tendríamos que programarlo en cada llamada.
* Lo mismo si usamos _loaders_ en pantalla, tenemos que acordarnos de añadirlos cada vez que usemos una llamada a la _API_.

Una solución más elegante seria mover las llamadas a la _API_ a funciones en un fichero externo que importamos en cada controlador y de las que hacemos uso:

```
import Api from './api.js'
....
data() {
 return {
  users: []
 },
...
methods:
 ...
 getUsers(page) {
  Api.getUsers(page)
    .then(res => {
      this.users = res.data.data
    })
 }   
...    
```

Y el contenido de `api.js` sería:

```
export default {
  getUsers: function (page) {
    return axios({
       method: 'get',
       url: 'https://reqres.in/api/users',
       data: {
         page          
       }
     }) 
  }
}  
```

Con esto además de simplificar el código ya podríamos reusar la llamada a la _API_ en varios controladores.

Si queremos que cada vez que hagamos una llamada a la _API_ se muestre un cargador en el front (y este desaparezca al terminar la carga), seria razonable usar _[vuex](https://vuex.vuejs.org/)_ o similar para esto, entonces nuestro _controlador_ quedaría así

```
import Api from './api.js'
....
data() {
 return {
  users: []
 },
...
methods:
 ...
 getUsers(page) {
  this.$store.commit('loading', true)
  Api.getUsers(page)
    .then(res => {
    this.$store.commit('loading', false)
      this.users = res.data.data
    })
    .catch(error => {
      this.$store.commit('loading', false)
    })
 }   
...    
```
(Doy por supuesto que hay un store que tiene una mutación encargada de mostrar un componente _loading_ en la UI)

Pero, de esta forma volvemos a tener el mismo problema, para cada llamada a la función que gestiona la _API_ tenemos que acordarnos de hacer el _commit_ al _store_ tanto al principio de la llamada como cuando devuelve datos como, importante, cuando hay un error.

Vale, llevemos esto a nuestro `api.js`

```
import store from './store.js' // Donde tengamos nuestra store definida

export default {
  getUsers: function (page) {
    store.commit('loading', true)
    return 
      axios({
        method: 'get',
        url: 'https://reqres.in/api/users',
        data: {
          page          
        }
      })
      .then(res => {
        store.commit('loading', false)
      })
      .catch(error => {
        store.commit('loading', false)
      })
  }
}  
```

**OJO**, pero si dejamos esto así, al capturar la resolución de la _promesa_ (con el _then_ y el _catch_), nuestro controlador no recibirá dicha resolución, por lo que tenemos que reenviarselas de la siguiente forma:

```
import store from './store.js' // Donde tengamos nuestra store definida

export default {
  getUsers: function (page) {
    store.commit('loading', true)
    return 
      axios({
        method: 'get',
        url: 'https://reqres.in/api/users',
        data: {
          page          
        }
      })
      .then(res => {
        store.commit('loading', false)
        return res // <--- Devolvemos la misma promesa ya resuelta (propagamos)
      })
      .catch(error => {
        store.commit('loading', false)
        throw error // <-- Lanzamos de nuevo la misma excepción
      })
  }
}  
```

De esta forma el propagar la resolución de la promesa el controlador ni se ha enterado que hemos lanzado el _loader_ y lo hemos desactivado.

Vale, pues ahora, porqué, en lugar de tener que importar `api.js` en cada controlador, no hacemos que esté disponible en toda la app, de la misma forma que lo esta, por ejemplo la _store_ de _vuex_: 'vue.$store' es decir: 'vue.$api.getUsers()'

Para ello creamos un plugin de _vue_, que es tan sencillo como lo siguiente en nuestro `api.js`

```
import store from './store.js' // Donde tengamos nuestra store definida
import axios from 'axios'

export default {
  install (Vue) {
    Vue.prototype.$api = Api
  }
}
const Api = {
  getUsers: function (page) {
    store.commit('loading', true)
    return 
      axios({
        method: 'get',
        url: 'https://reqres.in/api/users',
        data: {
          page          
        }
      })
      .then(res => {
        store.commit('loading', false)
        return res // <--- Devolvemos la misma promesa ya resuelta (propagamos)
      })
      .catch(error => {
        store.commit('loading', false)
        throw error // <-- Lanzamos de nuevo la misma excepción
      })
  }
}  
```

Y nuestro _entrypoint_, que suele ser `main.js`, lo dejamos como algo así:
 
```
import Vue from "vue";
import App from "./App.vue";
import Api from "./api.js"; // <----------------

Vue.config.productionTip = false;

Vue.use(Api) // <----------------

new Vue({
  render: h => h(App)
}).$mount("#app");
```

Ahora ya tenemos disponible el acceso al objecto _Api_ en cualquier controlador con solo usar `this.$api.getUser()`, y en el caso de nuestro ejemplo quedaría

```
...
data() {
 return {
  users: []
 },
...
methods:
 ...
 getUsers(page) {
  this.$api.getUsers(page)
    .then(res => {
      this.users = res.data.data
    })
 }   
...    
```

Obviamente nuestro objeto _Api_ puede tener más funciones que hagan llamadas a otros endpoints, tener una forma común de mostrar errores, etc. Eso se lo dejo a vuestra imaginación

Por último, y como _spoiler_ de un próximo _post_, decir que si hacemos uso de muchos endpoints distintos, el fichero `api.js` puede ser enorme y lo razonable sería trocearlo, e incluso separar las el objecto de la entidad a la que acceda, por ejemplo `this.$api.user.get` o `this.$api.user.create` o `this.$api.billing.list` o cualquier otro ejemplo que se os ocurra, pero como digo eso da para otro _post_.


