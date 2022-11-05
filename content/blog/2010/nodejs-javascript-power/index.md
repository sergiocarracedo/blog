---
title: "Node.js: Javascript power!!"
date: 2010-10-25
url: 2010/10/25/nodejs-javascript-power2/
cover: node.jpg
tags:
- node
- js
---
**[Node.js](http://www.nodejs.org)** es un entorno de programación de entrada/salida orientada a eventos, sobre el motor de Javascript **V8** (el mismo que usa Google Chrome)

_Pero ¿Que quiere decir todo esto? ¿Y para que me puede servir?_

Lo más básico que podemos realizar con **node.js** es un servidor web (HTTP).

```
var http = require('http');

http.createServer(function (req, res) {

  res.writeHead(200, {'Content-Type': 'text/plain'});

  res.end('Hello World\n');

}).listen(8124, "127.0.0.1");
```

Con estas pocas lineas tenemos un servidor web escuchando el puerto 8124 funcionando en nuestro equipo y respondiendonos siempre "_Hello World_"

Podemos crear tambien servidores  TCP.

Para programar un servidor **node.js** empleamos javascript como lenguaje, con los que nos evitamos muchas de las complicaciones de otros lenguajes de programación como C, C++, python, etc.

Como comentaba, esta completamente orientado a eventos por lo que no tendremos que preocuparnos de muchas tareas que el servidor realiza por nosotros, por ejemplo. Si queremos responder a una petición, programamos la respuesta al evento "on data".

Es muy ligero y rápido, y su [API](http://nodejs.org/api.html) es simplemente fantastica, tenemos acceso de recursos del equipo (ficheros) y muchas utilidades que nos facilitarán el trabajo de programación.

Muchos os preguntareis: _¿Para que necesito programar un servidor HTTP si hay opciones muy potentes disponibles (apache, ngix, etc)?_

_La respuesta es bien sencilla, no son tan ligeros y especificos como **node.js**, con el podremos hacer uso de la [tecnología push](http://es.wikipedia.org/wiki/Tecnolog%C3%ADa_Push) que nos permitira hacer virguerias como estas:_

*   Chat en el navegador: [http://chat.nodejs.org/](http://chat.nodejs.org/)

*   Podemos mostrar el cursor de los otros visitantes de la web: [http://jeffkreeftmeijer.com/2010/experimenting-with-node-js/](http://jeffkreeftmeijer.com/2010/experimenting-with-node-js/)

*   Servidor de archivos estáticos [http://net.tutsplus.com/tutorials/javascript-ajax/learning-serverside-javascript-with-node-js/](http://net.tutsplus.com/tutorials/javascript-ajax/learning-serverside-javascript-with-node-js/)

En proximos post seguiremos adentrandonos en este maravilloso proyecto
