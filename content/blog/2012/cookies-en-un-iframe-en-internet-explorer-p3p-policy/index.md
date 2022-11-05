---
title: "Cookies en un IFRAME en Internet Explorer: p3p policy"
date: 2012-02-22
url: 2012/02/22/cookies-en-un-iframe-en-internet-explorer-p3p-policy/
cover: cookies_en_un_iframe_en_internet_explorer_p3p_policy.jpg
---
Si desarrollas  una aplicación PHP web que trabaja dentro de un IFRAME  lo más probable es que necesite usar una sesión y para almacenar el id de la sesión necesitarás una **cookie** (de esto se encarga el propio PHP) pero deberás tener en cuenta algunas consideraciones para evitarte **problemas de funcionamiento en Internet Explorer 6+**

IE considera que el contenido del IFRAME es "_contenido de terceras partes_" y siguiendo la configuración por defecto de seguridad del navegador  **bloqueará las cookies** del IFRAME y por lo tanto perderás la sesión. Siempre existe la posibilidad de emplear el método de paso de sesión por URL, pero solo resolverá el problema respecto a PHP si usas otro tipo de herramientas que necesiten sesiones (Facebook, Twitter, etc) estas no tendrán acceso a su cookie.

## Como resolverlo

Para resolver este problema, necesitamos que el IFRAME defina la **[política p3p](http://www.w3.org/P3P/details.html)**, segun la wikipedia

> La **Plataforma de Preferencias de Privacidad** (_Platform for Privacy Preferences_) o **P3P** es un [protocolo](http://es.wikipedia.org/wiki/Protocolo "Protocolo") que permite a los [sitios Web](http://es.wikipedia.org/wiki/Servidor_web "Servidor web") declarar las intenciones de uso de la información recopilada sobre los usuarios que lo visitan y dar de esta forma un mayor control a éstos sobre su información personal cuando navegan. P3P fue desarrollado por el [World Wide Web Consortium](http://es.wikipedia.org/wiki/World_Wide_Web_Consortium "World Wide Web Consortium") (W3C) y se recomendó oficialmente el [16 de abril](http://es.wikipedia.org/wiki/16_de_abril "16 de abril") de [2002](http://es.wikipedia.org/wiki/2002 "2002"). La plataforma establece un formato estandar para declarar la identidad y las prácticas sobre la información de los usuarios. Esta información puede ser interpretada por usuarios o por software dedicado a este propósito. Por tanto se pueden construir herramientas (agentes de usuario) que permiten al usuario especificar sus preferencias y éste software se encarga de comprobar automáticamente si lo específicado por el usuario se verifica en un website concreto. Dependiendo de las preferencias especificadas el agente puede por ejemplo mostrar un mensaje de alerta, generar una ventana para pedir instrucciones, permitir el acceso, rechazar el acceso... El proceso de comprobación de las preferencias se debe llevar a cabo en una zona segura en la cual el servidor web debe recoger sólo la mínima información posible del cliente.

Básicamente nos obliga a indicar nuestras _intenciones_ _para que el navegador se fíe de nosotros_. La forma más sencilla de implementarlo en PHP es mediante el envío de cabeceras 
```
header('P3P: CP="NOI ADM DEV COM NAV OUR STP"');
```
Tienes un listado completo del significado de estas directivas y de otras muchas en [http://www.p3pwriter.com/LRN_111.asp](http://www.p3pwriter.com/LRN_111.asp) Esta cabecera mágica hará que nuestras cookies funcionen correctamente.   Este artículo se ha basado en información extraída de: [http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer](http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer) [http://blog.sweetxml.org/2007/10/minimal-p3p-compact-policy-suggestion.html](http://blog.sweetxml.org/2007/10/minimal-p3p-compact-policy-suggestion.html)
