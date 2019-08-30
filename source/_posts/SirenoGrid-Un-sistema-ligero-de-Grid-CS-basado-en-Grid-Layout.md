---
title: 'Sireno Grid: Un sistema ligero de Grid CSS, basado en Grid Layout'
date: 2019-08-26 12:31:08
cover: /images/sireno-grid.jpg
---

_CSS Grid Layout_ es un estándar del W3C que fue llevado a _webkit_ y _blink_ por [Igalia](https://igalia.com) una empresa asentada en Galicia con programadores por todo el mundo y además tuvimos el honor de organizar una charla [[Video](https://www.youtube.com/watch?v=NbeP64e8DZQ)] de uno de los desarrolladores encargado de implementar CSS Grid Layout en Chromium/Blink y Safari/Webkit: [Manuel Rego](https://blogs.igalia.com/mrego/resources/)

Los que llevamos mucho tiempo maquetando (pero mucho, mucho), recordaremos una época en la que se maquetaba usando tablas, ¿por qué?, pues porque la mayoría de los diseños de web, se pueden _trocear_ en áreas o zonas cuadradas o rectangulares, algo que un su momento permitían las tablas. Con la llegada de la _web semántica_ y las mejoras de CSS la maquetación con tablas fue marcada como una mala práctica (que lo era). CSS Grid Layout es "como" volver a maquetar con tablas pero **bien**. No voy a entrar en muchos detalles, pero la maquetación con tablas se definía con las etiquetas y aquí las definimos con las hojas de estilo.

# ¿Por qué?

Un buen día, hace ya más de un año, cayó en mis manos un proyecto de maquetación web, pero en este caso tenia un requisito nada habitual en ese momento, y este era que la maquetación estuviese basada en [CSS Grid Layout](https://developer.mozilla.org/es/docs/Web/CSS/CSS_Grid_Layout). Yo llevaba tiempo usando _Bootstrap_ para el _layout_ de columnas, ya que me parece muy cómodo el hecho de poder definir unos tamaños para cada "bloque" según el tamaño de pantalla, y esto no lo quería perder, así que decidí a hacer un sistema de grid similar / inspirado en el de Bootstrap, pero en lugar de usar _<div>_ flotantes, como en el caso de _Bootstrap 3_, o _flexbox_, como en _Bootstrap 4_, usaría *CSS Grid Layout*.

Una vez realizado este proyecto y viendo que esta herramienta funcionaba razonablemente bien, me decidí a usarla en más proyectos y finalmente a *compartirla con la comunidad*, liberándola a principios de este año.

Así nació **[Sireno Grid](https://sirenogrid.com)** con un nombre inspirado en una de las [estatuas](https://es.wikipedia.org/wiki/El_Sireno), para mi gusto, más feas de mi ciudad (Vigo), pero a la vez con más personalidad.

# Objetivo

**[Sireno Grid](https://sirenogrid.com)** tiene un simple objetivo: Servir de estructura de _grid responsive_ para que puedas crear tu layout de forma simple, nada de botones, badgets, etc... solo el grid,  los "margenes" y el _embed_ de elementos de forma _responsive_

Como ya comenté _Sireno Grid_ esta inspirado en _Bootstrap_ y por ello he usado más o menos los mismos nombres de clases y con la misma función, para que cambiar de uno a otro sea sencillo. El cambio principal viene en usar la clase `.grid-row` en lugar de `.row` para definir la fila, esto lo he hecho pensando en que se puedan usar los dos "frameworks" si fuese necesario.  

## Breakpoints
Los breakpoints definidos son estos (definidos en una variable SCSS)

`
$grid-breakpoints: (
  xs: 0,
  lxs: 576px,
  sm: 768px,
  md: 992px,
  lg: 1200px
) !default;
`

## Los containers
Una cosa que siempre tenia que modificar o añadir sobre _Bootstrap_ eran los containers, por defecto _Bootstrap 4_ solo tiene dos _container_ uno fluid que ocupa el 100% del ancho del navegador y el fijo que adquiere distintos tamaños según el _brakpoint_ usado.

En ninguno de los proyectos esto me encajaba al 100%, el que más encajaba es el de un _container_ fluido, pero con un tamaño máximo, pero ello _Sireno Grid_ dispone de un '.container-fluid' que se ajusta al 100% del _viewport_ y un '.container-fluid-1920' y un '.container-fluid-1440' que se ajustan al 100% del viewport con un máximo de 1920px y 1440px respectivamente.

## Los gutters o grid-gap

Por defecto el `.grid-row` establece un espacio entre columnas o "gutter" de 15px, pero en ocasiones necesitamos que ese gap no exista, para ellos he creado una colección de clases aplicables a cada columna que desactivan ese gap de la forma:

`.no-gutters` => para eliminar los espacios en los dos lados en todos los breakpoints.
`.no-gutter-[xs|lxs|sm|md|lg]` => para eliminar los espacios a los dos lados del breakpoint indicado en adelante.
`.no-gutter-[left|right]` => para eliminar el espacio en el lado indicado en todos los breakpoints.
`.no-gutter-[left|right]-[xs|lxs|sm|md|lg]` => para eliminar el espacio en el lado indicado del breakpoint indicado en adelante.

> Como nota un poco técnica, indicar que los gap entre columnas no hacen uso de 'grid-column-gap' como pudiera parecer lógico, ya que este establece un gap entre columnas fijo para todas, no pudiéndose indicar uno para el gap entre dos columnas y otro distintos entre otras dos.

## Rellenador de columnas o Col filler
Seguramente en alguna ocasión os ha sucedido que alrededor de un container has tenido que poner un fondo distinto a cada lado (ya sea un color o una imagen), si esto te ha ocurrido el `.grid-filler` está pensado para ti.

{% img /images/sirenogrid/fillers.png %}

&nbsp; 
Como veras en la página de ejemplos de **[Sireno Grid](https://sirenogrid.com)** la maquetación de esto es muy sencilla y permite un comportamiento responsive.


## _Flexbox fallback_
Por desgracia no todos los usuarios actualizan sus navegadores (ya bien por que no pueden por limitaciones técnicas o de políticas corporativas o por que simplemente no lo hacen) así que era requisito establecer un fallback para las funcionalidades de _Sireno Grid_ a _flexbox_ para aquellos navegadores que no implementen el estándar _Grid Layout_. Esperemos poder eliminar este _fallback_ cuando _Grid Layout_ [esté más extendido](https://caniuse.com/#feat=css-grid)

## Otras características
   
Me he dejado otras características para que las consulteis en la propia web de **[Sireno Grid](https://sirenogrid.com)** donde están explicadas y con ejemplos de uso.

Además en la propia web se indica como usar _Sireno Grid_ en tu proyecto (usando por ejemplo **NPM**) y se muestran ejemplos (código incluido) de las funcionalidades ya comentadas.

Dejo también aquí enlazada una [_lightning talk_](https://docs.google.com/presentation/d/18dWK5St8n-9aRmVK27_BSt78rnnEqjbVPBwlPxGsC48/edit?usp=sharing) que hice sobre _Sireno Grid_ en un meetup de [PHPVigo](https://www.meetup.com/es-ES/PHPVigo/)


## Agradecimientos
   
Agradecer a [Pedro Figueras](https://pedrofiguera.com) el diseño del logo y a [BrowserStack](https://www.browserstack.com/) la cesión de una licencia de uso de su herramienta para realizar el testeo en múltiples navegadores.


https://sirenogrid.com/



 





 


