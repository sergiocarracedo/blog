---
title: "Introducción a Vue.js"
date: 2017-03-15
permalink: 2017/03/15/introduccion-vuejs/
cover: /images/pexels-photo-196160.jpeg
---
Desde hace unos años han aparecido multitud de librerías y frameworks javascript para el desarrollo de aplicaciones frontend, facilitado por el aumento de rendimiento y velocidad de _javascript_ en los navegadores modernos.

Existe una variedad, que yo definiria como excesiva, de frameworks JS. Entre los más famosos o extendidos estan _Angular.js, Angular2, React.js, Ember.js_, y también el objeto de este post: **Vue.js**.

**Vue.js** se define a si mismo como "_Intuitivo, rápido y por componentes MVVM para construir interfaces interactivas_" (podéis saber más sobre el patrón Model-View-Viewmodel aquí: [https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel))

Bajo mi punto de vista las ventajas de **Vue.js** son,

*   Es muy sencillo de aprender.
*   El código es sencillo de entender y de mantener.
*   El sistema de compomentes es muy sencillo de entender y crear componentes es casi trivial.
*   El sistema de data binding.
*   La velocidad de ejecución (prometen ser más rápidos que React.js y Angular)

Si has trabajado con _React.js_, **Vue.js** te parecera conceptualmente similar (por ejemplo también usa Virtual DOM), ellos mismos lo explican aquí https://vuejs.org/v2/guide/comparison.html

**Vue.js** esta enfocado en el core. Por defecto no aporta _routing _ni otras funcionalidades, pero estas pueden realizarse mediante plugins, de hecho **Vue.js **tiene dos plugins oficiales **vue-router**, y **vuex** un _port_ de _Redux_ para **Vue.js**.

Vamos a ver un ejemplo muy simple de **Vue.js**

```
<!DOCTYPE html>
<html lang="es">  
<head>  
   <meta charset="UTF-8">
   <title>Introdución a Vue.js</title>
</head>  
<body>  
   <div id="app">        
        <input type="text" placeholder="Escribe tu nombre" v-model="name" />
        <span>Has escrito {{ name }}</span>
    </div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.0.3/vue.js"></script>
<script>
vm = new Vue({
        el: '#app',
        data() {
            return {
                name: '',            
            }
        },
    });
    </script>
</body>  
</html> 
```

Puedes ver el ejemplo funcionando en https://jsfiddle.net/sergio_carracedo/0d2ymgft/

Lo que vemos aquí, es un ejemplo básico del _data binding_, al crear la instancia principal de **Vue** le pasamos un objeto plano, con dos elementos:

* `el`: es el punto de montaje de **Vue**, normalmente es un div con el id _#app_
* `data`: debe ser una función que devuelva las variables que se van a _bindear**, **_en nuestro ejemplo _name_

En el _input_ vemos el atributo _v-model_ que indica a **Vue** el nombre de la variable que se _bindeará_, funcionando en ambos sentidos, si modificamos en cualquier lugar el valor del _name_ se modificará en el input (y en todos los lugares donde se referencie) y si modificamos el valor del input el valor de _name_ se modificará en todos los lugares, por ejemplo en el <span> _{{ name }}_ </span>

Como ves en unas pocas y sencillas líneas hemos puesto a funcionar **Vue.js**, obviamente este es un ejemplo casi trivial, y **Vue.js** es mucho más que esto, se pueden crear aplicaciones complejas con facilidad y en poco tiempo.

Estos dos videos que dejo a continuación explican mejor que como funciona de **Vue.js** en 60 minutos. En el segundo explica como crear un _CRUD_ usando **Vue.js** a partir de una API (creada en ese caso en **Slim**)

{% youtube z6hQqgvGI4Y %}
{% youtube IUgstalu6zo %}

