---
title: "Simplificando la gestión del router de Vue"
date: 2019-10-02 16:47:34
url: 2019/10/02/simplificando-la-gestion-del-router-de-vue/
cover: vue-router-2742048.jpg
---

Cuando creamos nuestra aplicación Vue una de las cosas que debemos configurar, si nuestra app dispone de varias páginas, es el [router](https://router.vuejs.org/guide/#javascript).

Vue dispone de un router propio lo suficientemente bueno para que no necesites usar ningún otro y que se configura de una forma similar a esta:

```javascript
import Vue from 'vue'
import Router from 'vue-router'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Article from '../pages/Article'

Vue.use(Router)

new Router({
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                auth: true
            }
        },
        {
            path: '/articulo/:slug',
            name: 'home',
            props: true,
            component: Article,
            meta: {
                auth: true
            }
        },
    ]
})
```

Como vemos las cada ruta se define en un Objeto dentro de un Array, indicando el _path_ al que responderá, el nombre y el componente que mostrará dicha página o vista, además de otras muchas configuraciones que podría tener.

Si nuestra aplicación tiene muchas páginas este array se volverá un poco complicado de manejar.

Si habeis trabajado con [Nuxt.js](https://nuxtjs.org/) conoceréis que en su caso, con colocar los componentes en la carpeta _pages_, ya se genera de forma automática la ruta con el nombre del componente, que además podemos meter en distintos niveles de carpetas.

Pues ese comportamiento es lo que vamos a replicar de una forma más básica para cualquier aplicación Vue que no necesite emplear _Nuxt.js_

En primer lugar modificamos el `router.js`, vamos a explicarlo por partes:

Importamos _Vue_ y _Vue router_ y le indicamos a Vue que lo use, nada extraño aquí:
```
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
```

Haciendo uso de la [gestión de dependencias](https://webpack.js.org/guides/dependency-management/) de _Webpack_, en concreto de `require.context()`, que nos permite, en nuestro caso, obtenemos un contexto con todos los archivos `*.vue` en la carpeta `/pages` que es donde guardamos las páginas de nuestra _App_.

> Esto sólo funciona en un entorno webpack si usamos Vue directamente en el navegador  `require.context` no estará definido.

```
const files = require.context('../pages/', false, /\.vue$/)
const pages = []

files.keys().forEach((key) => {
    if (key === './index.js') return
    pages[key.replace(/(\.\/|\.vue)/g, '')] = files(key).default
})
```

A continuación vamos añadiendo rutas de _vue-router_ en función de los archivos que tenemos en nuestro contexto, usando el nombre del fichero como ruta (en minúsculas) y para el nombre de la ruta el nombre indicado en el componente o el nombre del fichero, y, obviamente el propio componente como componente que gestionará esa ruta.

```
const routes = []
Object.keys(pages).forEach(page => {  
  const route = {
    path: '/' + page.toLowerCase()
    name: pages[page].name.toLowerCase || page.toLowerCase()
    component: pages[page]
  }  
  routes.push(route)
})
```

Ahora sólo tenemos que instanciar el router
```
const router = new Router({  
  routes: routes
})
```

Y _voilà_ cada componente que añadamos a la carpeta `/pages` tendrá su propia ruta sin necesidad de hacer nada más.

### Pero, ¿y si quiero personalizar la ruta, añadirle parámetros, o metas?. Un paso más
    
Lo que acabamos de hacer es cómodo pero poco flexible, ya que no podríamos configurar por ejemplo una ruta que contenga parámetros o indicarle un _meta.requireAuth_ para que el router mediante un _guard_ compruebe si el usuario esta sogueado.

Para solucionarlo lo que podemos hacer es definir en nuestro componente una _key_ llamada 'route' que contenga esa configuración y que si esta existe nuestro generador de rutas lo lea y aplique, y si no que use el procedimiento por defecto.

Modificamos la parte de generación de rutas
```
const routes = []
Object.keys(pages).forEach(page => {  
  let route = {}

  if (pages[page].route !== undefined) {
    route = pages[page].route
  } else {
    route = {
      path: '/' + page.toLowerCase()
    }
  }
  route.component = pages[page]
  routes.push(route)
})
```

Y en nuestro componente, por ejemplo `Articule.vue` añadimos la key de esta forma:

```
<template>
  ....
</template>
<script>
export default {
  ....
  route: {
    path: '/articulo/:slug',
    name: 'article',
    props: true,    
    meta: {
        auth: true
    }
  }
  ...
}
</script>  
```

Y así el generador de rutas que hemos creado usará esa configuración.

De esta forma además tenemos la configuración de la página en el propio componente.

Esto podríamos ir iterandolo para permitir, por ejemplo, como hace _Nuxt.js_ crear rutas a partir de las carpetas y demás, pero creo que esta ya fuera del objetivo y ¿por qué no usar _Nuxt.js_ directamente?
