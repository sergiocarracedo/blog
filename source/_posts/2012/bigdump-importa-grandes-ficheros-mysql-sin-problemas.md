---
title: "Bigdump: Importa grandes ficheros mysql sin problemas"
permalink: 2012/11/29/bigdump-importa-grandes-ficheros-mysql-sin-problemas/
date: 2012-11-29
cover: /images/pexels-photo-129544.jpeg
---
Una de las pesadillas de los desarrolladores web (a menos es una de las mías) es encontrase con la necesidad de subir un volcado SQL muy grande a un servidor y no tener acceso remoto al servidor mysql y, tampoco, tener acceso via shell, es decir la "única" vía es usar **PhpMyAdmin**.

He puesto ú_nica_  entre comillas por que desde luego hay muchas más alternativas, algunas muy manuales, o algunas más cómodas como la que os propongo: **[Bigdump](http://www.ozerov.de/bigdump/) **

**Bigdump** es un pequeño script **php** que una vez configurado con los datos de nuestra base de datos se encarga de trocear los archivos SQL que subamos para insertarlos "poco a poco" en la base de datos, incluso en servidores con limitaciones como `safe_mode`.

Su uso es muy sencillo:

1.  En el fichero descargado _bigdump.php_ configuramos los datos de conexión a la base de datos, es importante no olvidar modificar también la codificación para evitarnos problemas con los caracteres ya que por defecto usará _latin1_

3.  Subimos _bigdump.php_ al servidor donde necesitamos hacer la importación "problematica"

5.  Subimos al mismo directorio el fichero _.sql_ a importar (podemos subirlo comprimido con __gz__). Si el directorio tiene permisos de escritura nos ofrecerá la posibilidad de subir el fichero directamente desde un formulario, aunque no recomiendo esta opción ya que estamos hablando siempre de ficheros muy grandes

7.  Ejecutamos el fichero _bigdump.php_ desde el navegador, por ejemplo `http://www.tuweb.com/bigdump.php`

9.  Escogemos el fichero a importar, y comienza la importación del mismo sin tener que preocuparnos de nada más, eso si **no podremos cerrar la ventana del navegador mientras se esta ejecutando la impotación**

11.  **IMPORTANTÍSIMO!!! Por razones de seguridad obvias eliminar el fichero _bigdump.php_ y los _.sql_ o _.gz_ que hemos subido al terminar.**

[Descargar BigDump ver. 0.34b (beta) ](http://www.ozerov.de/bigdump.zip) directamente de la web de su creador
