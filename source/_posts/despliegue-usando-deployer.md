---
title: "Despliegue usando Deployer"
date: 2015-10-29
cover: /images/deployer.png
---
Desde el momento que ponemos un sistema en producción y necesitamos mantener el código o continuar el desarrollo surge una tediosa tarea, subir los cambios al servidor de producción. Esto normalmente lo hacemos empleando un FTP mediante el cual subimos los ficheros modificados. Pero ahi esta el "problema", en muchos casos conocer los ficheros que se han modificado (aunque lo podemos hacer empleando _git_ y comparando _commits_ para obtener una lista de archivos cambiados) y una vez que los conocemos debemos subir a mano los ficheros modificados. 

Esto es un proceso tedioso, además tenemos un riesgo alto de cometer un error sin una posiblidad sencilla de volver atrás. que en muchos proyectos no es aceptable.

Para resolver esto existen multiples automatizadores de despliegue, pero sobre el que vamos a hablar hoy es [**Deployer**](http://deployer.org/)

Este tipo de herramientas (y _Deployer_ no es una excepción), emplea un repositiorio _git_ como fuente del código (podemos usar _github_, _bitbucket_, etc), por lo que en primer lugar debemos garantizar que el servidor destino tiene acceso a esa repo, lo que normamente haremos usando un sistema de clave pública / privada que nos garantice acceso al repo.

Una vez que tenemos acceso al repo desde el servidor remoto, instalamos Deployer en nuestro equipo local y configuramos los parametros de conexión al servidor en el fichero deploy.php

Es imporante indicar que es posible establecer varios entornos, por si por ejemplo tenemos un enterono de desarrollo, o de stage antes de enviar a produción

Una vez configurado _Deployer_ simplemente ejecutariamos 

```
dep deploy prod
```

y con esto deployer se encargará de  poner en producción las modificaciones que hubiesemos efectuado en el repo en unos instantes, y por defecto nos almacenará 3 displiegues por lo que si hay cualquier problema al desplejar, por ejemplo un error en el código, que se nos ha pasado por alto o algo que no funciona en el servidor con un simple

```
dep rollback prod
```

Volveremos al estado anterior, todo ello en unos segundos

_Deployer_ funciona basado en un sistema de recetas, de hehco el propio **deploy** es una receta, esto nos permite, por ejemplo crear una receta que cree en el servidor de producciñon el archivo de configuracion de nuestro CMS, con las credenciasles de BBDD y otras configuraciones especificas del servidor, ya que doy por hehco que ese archivo no va a estar en tu repo git por razones obvias.

Tambien podemos indicar diractorios _shared_, que serán directorios, donde normalmente se almacena imagenes y recursos del usaurio, que no deberian estar en el repo, por ejemplo el diretior wp-uploads de _Wordpress_ o _files_ en Drupal de forma que se linkeen en cada despliegue sin necesidad de copiarlo. 

En otra entrada de post explicaré como crear una receta, por ejemplo para Drupal 7, que nos permita configurar el _settings.php_ o descargar a local el directorio _files._

Si quereis más información sobre Deployer y como ponerlo en marcha podeis consultar su [documentación](http://deployer.org/docs)
