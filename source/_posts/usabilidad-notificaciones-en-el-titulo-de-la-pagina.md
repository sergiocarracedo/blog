---
title: "Usabilidad: Notificaciones en el título de la página"
date: 2010-08-25
cover: /images/chrome-blank-new-tab.gif
---
Hoy en dia la mayoria de los usuarios cuando estamos navegando tenemos abiertas simultaneamente varias pestañas en el navegador. A veces nuestra aplicación web necesita llamar la atención del usuario para requerir de el una acción o simplemente hacerle sabes que ha recibido una notificación.

Una buena manera de hacerlo es cambiar alternativamente el título de la página por un aviso, de la misma forma que hace facebook cuando recibimos una notificación de chat; el título de la página cambia 3 o 4 veces entre "Facebook...." y "Fulanito te ha enviado un mensaje".

Para facilitar esta, a simple vista tarea, hemos crado un plugin de jQuery muy sencillo de utilizar.

Solo tenemos que pasarle como parámetro, el mensaje de aviso que se va a alternar con el título original de la página.

Podemos pasarle como opciones el número de repeticiones del cambio y el tiempo (en milisegundos) entre cambios.

<div class="geshifilter">

<div class="de1 li1">$<span class="sy0">.</span>titleBlink<span class="br0">(</span><span class="st0">"Tienes un nuevo correo"</span><span class="sy0">,</span><span class="br0">{</span>repeat<span class="sy0">:</span> <span class="nu0">10</span><span class="sy0">,</span>delay<span class="sy0">:</span> <span class="nu0">1000</span><span class="br0">}</span><span class="br0">)</span><span class="sy0">;</span></div>

</div>

Os dejo el código fuente del pluign 

```
/**
* Title blink for web pages that allow to change title page blinks like facebook chat notificacion
*
* This file is part of jquery.titleBlink
*
* jquery.titleBlink is free software: you can redistribute it and/or modify it under
* the terms of the GNU Lesser General Public License as published by the Free
* Software Foundation, either version 3 of the License, or (at your option)
* any later version.
*
* jquery.titleBlink is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
* more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with jquery.titleBlink. If not, see .
*
* @author Sergio Carracedo Martinez
* @copyright 2010 Sergio Carracedo Martinez
* @license <a href="http://www.gnu.org/licenses/lgpl-3.0.txt">http://www.gnu.org/licenses/lgpl-3.0.txt</a> GNU LGPL 3.0
* @version SVN: $Id: jquery.titleBlink.js 1 2010-08-25 17:44:00Z gasman406f $
*/
 
jQuery.extend({
  titleBlink : function(title,options) {
    var defaults = {
      repeat : 5,
      delay : 800
    };
    var options = $.extend(defaults, options);
    var repeatCount = 0;
    var currentTitle=$(document).attr("title");
 
    var blinkInterval = setInterval(function() {
      if($(document).attr("title")==currentTitle) {
        $(document).attr("title",title);
      } else {
        $(document).attr("title",currentTitle);
        repeatCount++;
        if (repeatCount==options.repeat) {
          clearInterval(blinkInterval);
        }
      }
    }, options.delay);
  }
})


```
</div>
