---
title: "Convertir tablas InnoDB en MyISAM"
date: 2011-08-29
cover: /images/technology-servers-server-159282.jpeg
---
Recientemente me surgió la necesidad de convertir _motor_ de las tablas de una base de datos que usaban **InnoDB a MyISAM**, la solución es trivial en apariencia, es decir, convertir una tabla es tan sencillo como 
```
ALTER TABLE [NOMBRE_BBDD].[NOMBRE_TABLA] engine=MyISAM;
```

Pero si son muchas las tablas a convertir esta tarea se puede convertir en insufrible haciéndonos perder un valioso tiempo, e aquí la solución:

```
SELECT CONCAT('ALTER TABLE ',table_schema,'.',table_name,' engine=MyISAM;') FROM information_schema.tables WHERE ENGINE = 'InnoDB' AND table_schema = '[NOMBRE_BASE_DE_DATOS]'
```

Con esta consulta conseguimos como resultado una cantidad de [tuplas](http://es.wikipedia.org/wiki/Tupla) igual al numero de tablas a convertir como único contenido de cada uno de ellos es la consulta SQL necesaria para convertir la tabla. Ya solo nos queda ejecutar las consultas obtenidas y _voilá_ tendremos nuestras tablas convetidas a _MyISAM_
