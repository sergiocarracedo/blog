---
title: "Usar un 'field widget' en un formulario convencional en Drupal 7"
date: 2017-06-08
url: 2017/06/08/usar-un-field-widget-en-un-formulario-convencional-en-drupal-7/
cover: pexels-photo-268466_0.jpeg
---
El [Form API](https://api.drupal.org/api/drupal/developer%21topics%21forms_api_reference.html/7.x) de Drupal es muy potente, para mí es algo, que cuando programo sobre otros _CMS_ o _frameworks_ echo mucho en falta, por que Drupal ha conseguido que la laboriosa tarea de crear, validar, y securizar formularios, quede reducida a un "simple" array.

Este Form API dispone de unos tipos, que yo denominaría primitivos, y no porque'estén anticuados, si no por que a partir de ellos se pueden crear construcciones más complejas, como hace el módulo [Field](https://api.drupal.org/api/drupal/modules%21field%21field.module/group/field/7.x), más concretamente su submódulo [Field UI](https://api.drupal.org/api/drupal/modules!field_ui!field_ui.module/7.x), que como ya sabréis es el que nos facilita la creación de los distintos tipos de campos, por ejemplo en la creación de contenido. 

Doy por hecho que conoces Drupal y con ello lo potente que es a la hora de tener distintos tipos de campos para crear contenido, no los campos convencionales de una base de datos, si no campos como, un mapa de [localización](https://www.drupal.org/project/geolocation), [imágenes que pueden ser recortadas](https://www.drupal.org/project/imagefield_crop), un [campo de dirección postal](https://www.drupal.org/project/addressfield) que cambia según el país seleccionado, etc....

Estos campos (_fields_) disponen de _widgets_ para introducir los valores, por ejemplo el campo localización en lugar de pedir, las coordenadas de forma numérica (algo generalmente complicado para un usuario), lo hace mostrando un mapa sobre el que podemos hacer búsquedas y pinchar en la localización que deseemos, esto internamente sigue siendo un par de números, pero la forma de introducirlos es lo que marca la diferencia.

Estos _widgets_ que implementan los módulos (ya sea el propio _Fields_ o los de terceros) lo que hacen en realidad es usar como base la potencia del **Form API. ¿**Y si pudiésemos nosotros reutilizar los widgets que se están usando, por ejemplo en un formulario de creación de un tipo de contenido (nodo)?. Pues podemos y es relativamente sencillo.

```
function mymodule_register_form($form, &$form_state) {
    $form['organization_name'] = array(
      '#type' => 'textfield',
      '#title' => 'Name of the organization',
      '#required' => true
    );

    $tmpnode = new stdClass();
    $tmpnode->type = 'organization';
    field_attach_form('node', $tmpnode, $form, $form_state, LANGUAGE_NONE, array(
      'field_name' => 'field_full_address',
    ));

    return $form;

}
```

En el ejemplo, tenemos un formulario estándar con un campo _organization_name_ que es un simple _textfield_ del Form API, pero además, necesitamos recuperar una dirección, para lo cual podríamos crear varios campos y programar la intereactividad, buscar la lista de países, con sus provincias y como se estructura una dirección en cada uno, etc. Podríamos hacer, si, pero ya está hecho por el módulo [addressfield](http://www.drupal.org/project/addressfield), que ademas estamos usando en un tipo de contenido llamado "Organización" con el nombre de campo _field_full_address _y lo único que tenemos que hacer es reusar el widget de dicho campo.

```
$tmpnode = new stdClass();
$tmpnode->type = 'organization';
field_attach_form('node', $tmpnode, $form, $form_state, LANGUAGE_NONE, array(
  'field_name' => 'field_full_address',
));
```

Con las lineas encima de este párrafo, lo que estamos haciendo es crear un objeto estándar con la única propiedad _type_ que indica el tipo de nodo donde esta el campo del que vamos a "copiar" el widget. E invocando a [field_attach_form](https://api.drupal.org/api/drupal/modules%21field%21field.attach.inc/function/field_attach_form/7.x) lo que hacemos es "inyectar" en un formulario todos los campos de otro (en este caso todos los campos del formulario que se mostraría al crear o editar un nodo de tipo _organization_, pero como solo queremos usar un campo concreto, el último parámetro es un array de opciones donde especificamos que solo queremos usar el campo llamado _field_full_address ¡_y listo!

Ya podemos usar el widget en nuestro formulario.

El caso que ha motivado esta entrada de blog, es algo que puede ser relativamente habitual, en mi caso, en el formulario de registro de usuario de Drupal, necesitaba pedir una serie de campos adicionales (como la dirección) que no iban a ser almacenados en el usuario, sino que crearían un nodo en nombre del usuario con los datos adicionales pedidos en el formulario de registro, de esta forma el usuario solo tiene que completar un formulario mejorando su experiencia en el uso de la web.
