---
title: 'Composition API: Las novedades de Vue 3 en Vue 2.x'
date: 2019-10-26
permalink: 2019/10/26/composition-api-las-novedades-de-vue-3-en-vue-2-x/
cover: /images/composition-api-414579.jpg
---

Hace ahora casi un año, **Evan You**, creador de Vue, durante la [VueConf presentó una _preview_](https://medium.com/vue-mastery/evan-you-previews-vue-js-3-0-ab063dec3547) de lo que será **Vue 3** cuyas principales lineas maestras son:

* Más rápido
* Más pequeño
* Un código más mantenible
* Más amistoso con entornos nativos (Android, iOS, Desktop, etc.)
* Más fácil de usar

Una de las novedades, que nos traerá es lo que en ese momento se llamó **Hooks API** ([inspirado en React Hooks](https://vue-composition-api-rfc.netlify.com/#comparison-with-react-hooks)), y que ha pasado a llamarse **Composition API**. 

Esta nueva API nos permite simplificar los componentes y facilitar reusar código, sobre todo tendrá repercusión en componentes de tamaño medio y grande ya que permitirá extraer parte de la lógica de forma sencilla en varios ficheros, reusarla y organizar mejor el código por conceptos lógicos en lugar de por opciones. Actualmente en Vue 2.x tenemos que organizar el código de un componente por opciones, de la siguente manera:

```javascript
export default {
    name: 'component-name',
    props: {
        ...
    },
    components: {
        
    },
    data () {
        return { ... }
    },
    computed: {
        ....
    },
    watch () {
        ....
    },
    methods: {
        ....
    },
    mounted () {
        
    }
    ....    
}
```

Esto, en componentes de cierta complejidad, hace que, por ejemplo, las variables y los métodos que las gestionan esten separados.

Veamos con un ejemplo simple a que me refiero, un componente que muestra lo que escribimos en un input, lo muestra en mayúsculas y además tenemos un botón para añadir un emoji:

{% iframe https://codesandbox.io/embed/vue-template-rg169?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FDemo2x.vue&view=editor %}

Si os fijais tenemos por un lado la variable `text`, en otro la variable computada `uppercase` y en otroel método `addEmoji`. En este componente estan todos bastante "cerca", pero si seguimos añadiendo metodos y variables empiezan a separarse. 

Con **Composition API** podemos tener "cerca" todos estos elementos por lógica o funcionalidad (En el video que enlazo al final se ve esto de forma muy gráfica)  

Antes de continuar, debemos saber que en Vue 2.x, para poder emplear _Composition API_ necesitamos instalar el paquete [vue/composition-api](https://github.com/vuejs/composition-api) con un simple:

```
yarn add @vue/composition-api
```

Una vez hecho esto refactorizamos el componente de la siguiente forma

{% iframe  https://codesandbox.io/embed/vue-template-rg169?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FDemoCompositionApi.vue&view=editor %}

En el `<template>` no ha cambiado nada significativo, así que vamos al _javascript_ que es donde está la _chicha_.

En primer lugar vemos un `import` que nos _trae_: `reactive`, `computed` y `ref`, en seguida vamos a ver que es cada uno

A continuación vemos un metodo `setup()`, nada de las opciones "tradicionales" (_data_, _methods_, _computed_, etc), y aquí es donde haremos la magia del **composition API**. En lugar de tener una opción en el objeto para cada cosa: _data_, _computed_, _methods_ los definimos directamente en el método `setup()` y los devolvemos. **Vamos paso por paso:**

```javascript
const text = ref("")
```
_Vue_ necesita que el elemento _reactivo_ sea [pasado por referencia](https://vue-composition-api-rfc.netlify.com/#computed-state-and-refs), cosa que _javascript_ no hace con los tipos primitivos como en este caso (un _String_), para ello _Composition API_ nos provee el `ref()`.

En el caso de que usásemos un objeto que quisiésemos que fuese reactivo, usaríamos 'reactive'

```javascript
const state = reactive({
  text: ''
})
```

Lo siguiente que nos encontramos es la variable computada:
```javascript
const uppercase = computed(() => text.value.toUpperCase());
```

Sencillo, usamos el `computed` y le pasamos la función _computada_ y transformamos el valor de la variable `text` a mayúsculas.

Aquí ya podemos ver un par de detalles:
* el `.value`: esto es por qué `ref` convierte el tipo primitivo en un objeto plano, guardando el valor real en la propiedad `value`. Nótese que en los _templates_ no es necesario usar el `.value` ya que se realiza un [_ref unwrapping_](https://vue-composition-api-rfc.netlify.com/#ref-unwrapping)
* Otro detalle importante es **¿dónde esta el _this_?**, pues básicamente no está, `setup()` es llamado antes de montar el componente, por lo que en ese contexto _this_ no funciona como lo conocíamos.  

Un poco más adelante tenemos lo que antes era el método `addEmoji` que ahora es una función:
```javascript
function addEmoji() {
    text.value += "😂";
}
```
 
y finalmente devolvemos todos los elementos que vamos a usar:
```javascript
return {
  text,
  uppercase,
  addEmoji
};
```

A primera vista parece todo un poco más complicado y engorroso, y seguro que lo es para componentes pequeños, pero en cuanto el componente empieza a crecer esto nos permite agrupar la lógica de cada parte del componente en lugar de tenerla separada en las distintas propiedades del objeto, además nos simplifica extraer tanto las variables reactivas y computadas, como los métodos a un fichero externo:

```javascript
import compositionFunction from "./demoCompositionApi.js";
export default {
  setup() {
    return {
      ...compositionFunction()
    };
  }
};
```

Señalar que el método tradicional seguirá estando disponible y no hay planes a largo plazo de eliminarlo, por lo que podremos usar uno u otro método de desarrollo. Esto es algo que **Evan You** ha dejado muy claro despues de el denominado ["Vue Darkest Day"](https://dev.to/danielelkington/vue-s-darkest-day-3fgh), en el que, con el anuncio del Composition API la comunidad interpretó que se eliminaría el sistema "tradicional" y generó bastante polémica.

Recomiendo ver este video para entender de una forma muy gráfica las ventajas del _Composition API_

{% youtube 6HUjDKVn0e0 %}

Tambien consultar el [RFC de Composition API](https://vue-composition-api-rfc.netlify.com/#summary)

Os dejo el proyecto _demo_ en _codesandbox_:

{%iframe https://codesandbox.io/embed/vue-template-rg169?fontsize=14 100% 600px %}


 


