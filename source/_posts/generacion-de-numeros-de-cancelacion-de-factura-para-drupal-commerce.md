---
title: "Generación de números de cancelación de factura para Drupal Commerce"
date: 2018-01-22
cover: /images/pexels-photo-811103_1.jpeg
---

Recientemente a uno de nuestros clientes para el cual hemos diseñado, y programado una tienda online, empleando para ello Drupal 7 y [Drupal commerce](https://drupalcommerce.org/), le surgieron varias necesidades relativas a la facturación.

En primer lugar necesitaba que los pedidos generasen automáticamente una serie de números de factura por cada año, de la forma **2018-123, 2018-124, ... **Hasta aquí todo normal, uno de los módulos contribuidos de _Drupal Commerce_.

Este módulo se llama [Commerce Billy](https://www.drupal.org/project/commerce_billy), y cumple esta necesidad, además de proporcionarnos la generación de facturas en PDF,  posibilidad de facturación automática o manual, y un largo etc de pequeñas pero útiles funcionalidades relativas a la facturación.

Pero nuestro cliente además de generar una serie para las facturas de venta, necesitaba que en caso de devolución, generar una nueva serie, también con números consecutivos, pero independiente de la serie de facturación.

_Commerce Billy_ no proporcionaba esta funcionalidad, así que decidimos aprovechar la potencia de _hookeado_ que proporciona Drupal, esto es, poder "enganchar" tu código en distintos punto del flujo del programa, pudiendo alterar  o ampliar la funcionalidad del _core _o de un módulo, sin necesidad de modificarlo, y creamos un sencillo, pero útil módulo que realiza funcionalidad aprovechando parte de las funcionalidades de _Commerce Billy_, como por ejemplo la configuración del tipo de serie (Anual, mensual o infinita) se extrae de la especificada el _Commerce Billy_, simplificando la configuración por parte del usuario.

Nuestro módulo se llama [**Commerce Billy Cancel** ](https://www.drupal.org/project/commerce_billy_cancel)(un nombre muy original ;) ) y hemos decidido liberarlo para que cualquiera que tenga la misma necesidad que nosotros pueda resolverla fácilmente.

Podéis descargarla [aquí](https://www.drupal.org/project/commerce_billy_cancel)
