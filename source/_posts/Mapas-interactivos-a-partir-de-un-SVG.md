---
title: Mapas interactivos SVG con Vue
date: 2019-06-30 13:17:33
cover: /images/vuemaps.jpg
---
En un reciente proyecto me ha surgido la necesidad de crear un mapa de España interactivo en el que cada provincia fuese un elemento sobre le que poder hacer _hover_ y _click_.

El proyecto lo estaba realizando el _Nuxt.js_ y por lo tanto en **Vue**, por lo que decidí crear un componente que encapsulara la generación gráfica del mapa y emitiera los correspondientes eventos.

Lo primero que necesitamos es el mapa en formato SVG, no nos vale cualquiera debe ser un mapa en el que cada provincia esté en un path y este esté correctamente etiquetado, por ejemplo podemos usar [este](https://simplemaps.com/resources/svg-es) que es de libre tanto para uso comercial como personal.

Si lo abrimos vemos que cumple la condición de que cada provincia esté en un path, y además este tiene metadatos como el nombre de la provincia.

{% codeblock lang:xml %}
<path id="ESP5840" name="Pontevedra" d="M451.9 ...." >
{% endcodeblock %}

El siguiente paso es convertir ese SVG a JSON para facilitar el manejo con JS, yo he usado esta herramienta https://www.freeformatter.com/xml-to-json-converter.html#ad-output, aunque hay librería para hacer la conversión _al vuelo_ desde JS.

Lo que nos dejará algo como esto:

{% iframe https://codesandbox.io/embed/vue-template-fct8t?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fcomponents%2FSpainProvincesMap%2Fspain-provinces.json&view=editor %}

Para volver a convertir esta información a un SVG que podamos manipular usé [svg.js](https://svgjs.com/) 

La estrategia consiste en generar de nuevo el SVG desde el componente de Vue pero añadiendo los eventos y necesarios, para ello una vez montado el componente, y usando _svg.js_ creamos un _path_ por cada provincia, este _path_ viene definido por la _key_ **@d** del json que generamos a partir del SVG.

 {% codeblock lang:js %}
 generateMap() {
   const svgContainer = svg(this.id)
     .size("100%", "100%")
     .viewbox(0, 0, 1000, 891);
   provinces.forEach(pathObj => {
     this.generatePath(svgContainer, pathObj);
   });
 },
 generatePath(svgCont, pathObj) {
   const attrs = {
     fill: "transparent",
     stroke: "#28586c",
     "stroke-width": 1,
     title: pathObj["@name"],
     "map-id": pathObj["@id"]
   };

   const province = svgCont.path(pathObj["@d"]).attr(attrs);
 }
 {% endcodeblock %}

Si os fijáis, indicamos al SVG que creamos que ocupe el 100% (tanto en ancho como en alto) de un _viewbox_ cuyo tamaño viene definido por el SVG original, esto define el tamaño real del SVG si que parte será visible, es decir si dibujamos un elemento más allá de 1000x891 este no se verá por que esta fuera del _viewbox_, pero el SVG es totalmente responsive, por decirlo de otra forma el tamaño del _viewbox_ no tiene una relación 1:1 con la visualización real.

Como se ve en el ejemplo, creamos un path para cada provincia, ahora necesitamos dotarlo de interactividad para que pueda responder a un click.

{% codeblock lang:js %}
...
const province = svgCont.path(pathObj["@d"]).attr(attrs);

province.click(e => {        
  const mapId = e.target.attributes["map-id"].value;
  const title = e.target.attributes.title.value;        
  this.$emit("mapClick", { mapId, title });
});
...
{% endcodeblock %}

Simplemente emitimos un evento de componente en el que pasamos el ID y el nombre de la provincia, para que fuera del componente podamos gestionar ese click.

Y este el resultado final.

{% iframe https://codesandbox.io/embed/vue-template-fct8t?fontsize=14&view=preview 100% 600px %}

El ejemplo completo lo he dejado en [codesandbox.io](https://codesandbox.io/s/spainmapcomponent-fct8t)
