---
title: "¿Por qué el directorio home en linux se representa con ~ (tilde)?"
date: 2017-06-13
cover: /images/pexels-photo-698808.jpeg
---
Cuando comencé a dar mis primeros pasos en Linux me llamó la atención que si quería cambiar a mi directorio home, lo podía hacer de "la forma larga"

```
$ cd /home/usuario
```

O usando ~ (lo que los anglosajones llaman _tilde_)

```
$ cd ~/
```

lo que era un ahorro de escritura y la mayor ventaja que un script funcionaria para cualquier usuario.


![](/images/l3esv.jpg)

Alguna vez me pregunte cual era el origen del uso de este carácter, pero nunca investigué mucho más, hasta que hace unos días encontré esta explicación en https://unix.stackexchange.com/questions/34196/why-was-chosen-to-represent-the-home-directory/34198#34198 que no deja de ser curiosa y traduzco de forma libre "En los sistemas operativos tipo Unix, la tilde significa el directorio home, una practica derivada de la Terminal **Lear-Siegler ADM-3A** muy común en los 70s que en la misma tecla aparecía la _tilde_ y la inscripción _HOME _que servia para ir a la parte superior de la pantalla.

Como también se comenta esta terminal también es el origen de las teclas de movimiento de Vi (solo tienes que ver la foto para darte cuenta de porqué. ;)
