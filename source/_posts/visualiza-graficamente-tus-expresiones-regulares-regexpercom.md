---
title: "Visualiza gráficamente tus expresiones regulares: regexper.com"
date: 2013-01-07
cover: /images/visualiza_graficamente_tus_expresiones_regulares_regexper.com.jpg
---
Las [expresiones regulares](http://es.wikipedia.org/wiki/Expresi%C3%B3n_regular) en cualquier lenguaje de programación son muy útiles y potentes, ahorrándonos escribir muchas lineas de código. Si la expresión es sencilla, nos va a ser fácil como humanos comprenderla de un vistazo, pero si  la expresión se complica, si no la hemos creado nosotros, o si ya ha pasado tiempo desde que lo hemos hecho, puede ser un poco más complicado entender lo que hace o para que nos sirve.

Hace unos días descubrí en twitter a través de un _retweet_ a un usuario que merece la pena seguir [@patxangas](http://twitter.com/patxangas) y en uno de sus tweets nos descubira la herramienta [www.regexper.com](http://www.regexper.com) que a partir de una expresión regular genera un grafo como el que veis en la imagen que acompaña a esta entrada. El ejemplo empleado es

```
/(ftp|http|https):\/\/(\w :{0,1}\w*@)?(\S )(:[0-9] )?(\/|\/([\w#!:.? =&amp;%@!\-\/]))?/
```

Como ves en la imagen, es muy fácil entender lo que hace esta expresión regular. Ahora puedes probar las tuyas!
