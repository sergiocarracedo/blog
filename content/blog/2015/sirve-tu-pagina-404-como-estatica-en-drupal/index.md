---
title: "Sirve tu página 404 como estática en Drupal"
url: 2015/02/05/sirve-tu-pagina-404-como-estatica-en-drupal/
date: 2015-02-05
cover: pexels-photo-1579062.jpeg
---
En la configuración estándar de **Drupal** este trata de absorber todo el tráfico que se genera contra el directorio (y subdirectorios) donde esta instalado en el servidor, esto incluye también a los errores 404. 

Cualquier solicitud de un fichero que no exista **Drupal** la gestionará en un nuevo dominio esto no es un problema ya que, en teoría, la mayoría de los errores 404 se deberán a errores de escritura en las rutas por parte de los usuarios, pero en un sitio con alto tráfico  que acabamos de remodelar y en el que no están correctamente creadas las redirecciones desde la antiguas rutas a la nuevas podemos encontrarnos con que estamos sirviendo muchas **páginas 404**.

Por desgracia,si estamos usando **Boost** este no cachea las páginas 404, por lo tanto Drupal tiene que ejecutar un proceso 'completo para devolver' la página (recuerda que si estamos usando Boost no podemos hacer uso del cacheado interno de Drupal) y por poco que esto pueda parecer esto supone un uso estéril de recursos del servidor.

El módulo **[Static 404](http://drupal.org/project/static_404)**, pone fin a este problema. Una vez instalado navegamos hasta **Configuración > Sistema > Información del sitio** y en la sección **Páginas de error**, pulsamos el botón _**Generate static 404 Page**_ y a partir de ese momento Drupal devolverá una página estática para cualquier error 404\. Aunque parezca una nimiedad, hemos realizado pruebas de stress en nuestro servidor local y hemos reducido el tiempo de respuesta un 80%, lo que hace que en websites con alto tráfico marque una diferencia y nos permita dedicar esos recursos liberados a lo que realmente importa.
