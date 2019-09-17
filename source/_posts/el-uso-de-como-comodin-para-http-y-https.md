---
title: "El uso de &#039;//&#039; como comodín para &#039;http://&#039; y &#039;https://&#039;"
date: 2013-01-21
cover: /images/el_uso_de_039039_como_comodin_para_039http039_y_039https039.jpg
---
Crear una web que pueda ser navegable mediante http y https normalmente supone tener algún tipo de variable  o modificador en el lenguaje que genere la salida HTML del website, por ejemplo PHP para que las peticiones de los recursos, como CSS, JS, imágenes, etc se realicen mediante el protocolo correcto.

Por ejemplo si estamos navegando por una web en http:// (modo no encriptado) y pedimos una imagen mediante _http**s**://[www.misitio.com/imagen.png](http://www.misitio.com/imagen.png)_  en principio puede parecer que no deberíamos tener ningún problema, pero si la red del visitante filtra el puerto 443 (https) cosa que sucede en algunas empresas (cada vez menos) no podría acceder al recurso, si el recurso que solicitamos (que no coincide en protocolo) necesita hacer uso de alguna cookie, dependiendo de como este configurada esta podría no poder acceder a ella.

Pero el problema más evidente es cuando el usuario esta navegando por nuestra web usando **https** y la página solicita un recurso mediante **http**, da igual lo buena, caro y bonito que sea nuestro certificado, el navegador mostrará una advertencia que pueda hacer que los usuarios desconfíen de nuestro website.

Para evitar estos problemas, podemos o bien hacer uso de una variable o similar que modifique el protocolo en nuestra programación o podemos optar por una solución mucho más sencilla que nos cubre en los dos casos: hacer uso de '**//**' en lugar de http:// o https://, si has leído bien, solo usar // **Por ejemplo, [http://www.misitio.com/miimagen.jpg](http://www.misitio.com/miimagen.jpg) se convertiría en //[www.misitio.com/miimagen.jpg](http://www.misitio.com/miimagen.jpg)** Ahora es el navegador el que se encarga de decidir el protocolo que usa en función de como hemos pedido el documento HTML que va a solicitar esos recursos.

Sobra decir que si por el motivo que sea necesitamos forzar uno de los protocolos, simplemente especificamos el protocolo como hemos hecho hasta el momento. Puedes encontrar más información sobre el uso de SSL en la web en [http://support.google.com/adwords/answer/2580401/?hl=es](http://support.google.com/adwords/answer/2580401/?hl=es)
