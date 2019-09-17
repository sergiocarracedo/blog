---
title: "Abstraer los datos de su representación en un CMS = WIN"
date: 2017-11-27
cover: /images/architecture-construction-build-building-162557.jpeg
---
Tanto en desarrollo web como en otras muchas áreas la **abstracción** es fundamental para poder avanzar sin necesidad de estar pensando en cada uno de los niveles de complejidad. La [**abstracción**](https://es.wikipedia.org/wiki/Abstracci%C3%B3n_(inform%C3%A1tica)) básicamente consiste en aislar un elemento de su contexto.

Si has leído el título del _post_, te habrá dado cuenta de que vamos a hablar de **abstracción de contenido** respecto a la **representación (**que tendrá para el visitante de la web), por ejemplo esto es que el campo fecha  (de un artículo), no lo tenga que insertar el autor junto con el resto del texto. Lo mismo que el título, las imágenes o cualquier otro elemento.

### ¿Y por qué no hacerlo así, insertando todo en un campo de texto?

Se me ocurren muchos motivos para no hacerlo así: por ejemplo, si necesitas ordenar por fecha y la fecha esta en medio del texto, la tarea de ordenación será mucho más complicada que si la fecha estuviese en un campo separado.

Aún más, si la fecha además de estar guardada en un campo separado, está guardada de forma estructurada (por ejemplo un _timestamp + timezone_) podremos mostrar la fecha y hora en las distintas zonas horarias y en los distintos formatos de fecha: _DD/MM/YYY, MM/DD/YYY, etc_

### ¿Cómo puedo llevar la abstracción a cabo?

Existen varias formas de hacerlo:

*   **Tokenizado**: El tokenizado no es la solución optima, pero si es una mejora respecto a insertar todo "junto" en un solo campo.   
    En este caso, lo que hacemos en lugar de insertar la fecha en el campo principal, podemos insertar un token se substituirá por la fecha, por ejemplo [fecha_creacion].  
    Esta solución solo se puede aplicar a algunos campos, ya que al final dependemos de datos ya separados por lo cual es mejor usar el siguiente método.  

*   **Separación en campos:** Consiste en realizar un análisis previo del contenido para separarlo en campos independientes.

Vamos a ver el método de **Separación en campos** con un ejemplo: Supongamos esta misma entrada del blog, en esta web, ¿qué elementos la componen?, A primera vista, un **título**, un **cuerpo de texto**, la **imagen** de cabecera, la **fecha**, las **etiquetas** y los **relacionados.**

Además de estos elementos, en algunas entradas necesito añadir varias imágenes o videos.

Pues ya tenemos los elementos, ahora en nuestro _backend_ tenemos un campo para cada uno de estos elementos como puede verse en la imagen inferior:

Quiero llamar la atención sobre el campo **Cuerpo de texto** que es un habitual campo de texto [WYSIWYG](https://es.wikipedia.org/wiki/WYSIWYG). Este tipo de campos es "peligroso" por que puede tender a ser un cajón desastre donde terminar insertando todo tipo de contenido. En mi opinión para evitar esto, y conseguir la máxima abstracción posible este campo solo debería permitir insertar:

*   Negritas (strong), cursiva (em)
*   Enlaces (a)
*   Títulos (h2, h3....) pero solo de modo semántico, es decir, que como se muestren corre a cargo del frontend
*   Listas (ul, ol)

En general otras etiquetas que aporten valor semántico al contenido, nada que tenga que ver con la visualización:

*   Colores
*   Tamaños de texto
*   Tipograficas
*   Imágenes (como etiqueta,, como token es correcto)

¿Qué ventajas me da abstraer contenido y separarlo de la visualización?

Como ya mencionamos antes, una de las ventajas es poder manipular y transformar el contenido antes su visualización, por ejemplo, la fecha en esta entrada de blog, aunque fue introducida como una fecha _DD/MM/YYYY HH:MM_, se muestra en un formato relativo (_Hace x días)_

Las imágenes, son recortadas y reescaladas según necesidades, pudiendo tener distintos tamaño en función del tamaño de la pantalla para evitar la descarga innecesaria de datos. Todo ello manteniendo la imagen original inalterada.

Pero una **ventaja** que se suele ver a **largo plazo**, y que para nosotros es muy importante, es que podríamos **cambiar el diseño de la web sin necesidad de tocar el contenido** en el backend.

Un cambio de tipografías y/o colores por que el cliente ha cambiado su imagen corporativa, una restructuración profunda del diseño, por ejemplo moviendo elementos de sitio.

Esto no es solo teoría, tenemos casos reales de clientes que han modificado hasta 4 veces el diseño de la web a o largo de 8 o 9 años, manteniendo la misma estructura interna de contenido, pero modificando la visualización de la web.

Para finalizar, solo puedo alabar la **simplicidad** que nos aporta **Drupal** a la hora de estructurar el contenido de formas correcta, y mantenerlo separado de la visualización.
