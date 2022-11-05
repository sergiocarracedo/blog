---
title: "Mejorando node.js: Faye"
date: 2011-07-11
url: 2011/07/11/mejorando-nodejs-faye/
cover: mejorando_node.js_faye.jpg
---
Como ya comentamos en una entrada anterior **node.js** es una herramienta muy potente, que nos permite crear servidores empleando javascript como lenguaje de programación en el servidor, pero puede ser costoso crear ciertas herramientas y protocolos desde 0\. **[Faye](http://faye.jcoglan.com/node.html "Faye")** es una capa (extensión) sobre **node.js**, lógicamente escrita en javascript, que crea un sistema de publicación y suscripción a canales de mensajes basados en el protocolo **[Bayeux](http://svn.cometd.com/trunk/bayeux/bayeux.html).**

En otras palabras, **faye** se encarga de gestionar los canales, los envios de mensajes y la recepción por parte de los subscriptores a esos canales. **Faye** consta de dos partes, una en el lado servidor y otra en el lado cliente (también escrita en javascript) Para explicar el funcionamiento de **faye** más fácilmente pongamos un ejemplo: Imaginemos que estamos creando una aplicación que necesita enviar notificaciones en tiempo real a todos los usuarios conectados a una página. En nuestro _script_ para **node.js** instroducimos lo siguiente: 

```javascript
var Faye = require('faye'), server = new Faye.NodeAdapter({mount: '/'}); server.listen(8000);
```
y lanzamos **node.js** 
```
$ node faye.js
```
Ahora en el cliente, cargamos un fichero javascript con este contenido: 

```javascript
 var client = new Faye.Client('<a href="http://localhost:8000/">http://localhost:8000/</a>'); client.subscribe('/messages', function(message) { alert('Got a message: ' + message.text); });
```

Con estas dos sencillas operaciones, todos los usuarios que estén conectados a nuestra web estarán subscritos al canal _messages_ y estarán en disposición de recibir información. Para enviar un mensaje, desde uno de los clientes, que puede ser nuestro panel de control de la web ejecutamos el siguiente javascript:
```javascript
 client.publish('/messages',{ text: 'Hello world' });

```
Y inmediatamente en todos los navegadores de los visitantes de la web aparecerá un _alert_ con el mensaje "Hello world" Este es un ejemplo extraído de la web de faye, pero quería explicarlo con un ejemplo práctico. Como veis la potencialidad y simpleza de este sistema es grande, ya que podemos enviar más variables que _message_ si lo necesitasemos (por ejemplo, número de mensajes sin leer, fecha, etc), tambien podemos tener varios canales distintos a por los que enviar distintos tipos de información o solo subscribir a algunos usuarios a esos canales. En un próximo post explicaré como manipular los mensajes en el lado servidor, para por ejemplo, almacenarlos en una base de datos, enviar mensajes desde el propio servidor, etc.
