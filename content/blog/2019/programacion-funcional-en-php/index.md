---
title: 'Programación funcional en PHP: Un poco de teoría y Lambdish/phunctional'
date: 2019-12-03
url: 2019/12/03/programacion-funcional-en-php/
cover: phunctional-33317.jpg
tags:
- php
---
Hace unas semanas [@felixgomexlopez](https://twitter.com/felixgomezlopez) me habló de una librería en PHP que te ofrecía un montón de funciones para manejar iterables y funciones de primera clase (u orden superior) en programación funcional, así que la he probado y (spoiler) me ha encantado. 

Antes de nada veamos algunos conceptos importantes de la [programación funcional](https://es.wikipedia.org/wiki/Programaci%C3%B3n_funcional):

### Funciones de primera clase o de orden superior

Son aquellas que pueden recibir como parámetros otra función, por ejemplo la función ['array_map'](https://www.php.net/manual/es/function.array-map.php) de PHP, recibe dos argumentos, un _callable_ y un _array_, devolviendo una matriz con el resultado de aplicar el _callable_ (normalmente una función) a cada elemento de la matriz original.

### Funciones puras

Son aquellas que no tienen efectos secundarios, es decir aplican el concepto matemático de función en el que dado un valor/es de entrada aplicamos un conjunto de operaciones y obtenemos un resultado. 
Y ese resultado **es siempre el mismo para la misma entrada**, el resultado no puede depender de un estado interno o de una lectura interna de datos.

Esto nos da ventajas como poder cachear sin miedo el valor del resultado para un conjunto de parámetros de entrada ya que el resultado *siempre* será el mismo.

```php
// Función pura
function suma($a, $b) {
    return $a + $b
}

//Función impura
function sumaFactor($a, $b) {
    return ($a + $b) * $_ENV['factor']
}
```
La segunda función es impura por que cada vez que la llamamos devuelve un valor que depende de algo externo que podria cambiar.

### Clausuras o _closures_
Otra de las piezas importantes de la *programación funcional* en PHP (y otros lenguajes) las _closures_. Las _closures_ permiten a una función acceder a las variables del ámbito donde es ejecutada.

Por ejemplo:
```php
$text = 'El número es: ';

$function = function($number) use ($text) {
    return $text . $number;  
}

$function(12); //Prints 'El número es: 12'  
```
Donde el valor de `$text` es el del contexto de ejecución. (Este es un ejemplo _chorra_).
En PHP las _closures_ se representan internamente como una [clase](https://www.php.net/manual/es/class.closure.php).

### Funciones λ (lambda)
También llamadas _funciones anónimas_, son aquellas que no tienen un nombre y se invocan, o bien directamente o almacenando su referencia en una variable.
```php
(function($a) {
  echo 'El número es '. $a * 2;
})(12); // Prints 'El número es 24
```

### Vale ya de teoría! Vamos
Después de esta pequeña introducción a la programación funcional seguro que has visto que la has usado más de una vez, a lo mejor sin darte cuenta.

Estoy convencido de que lo has hecho, y si no deberías.

Como decía al principio, [@felixgomexlopez](https://twitter.com/felixgomezlopez) me habló de una librería PHP que nos da herramientas para trabajar de forma más cómoda con programación funcional en PHP.

Esta librería es [Phunctional](https://github.com/Lambdish/phunctional) y se instala de una forma tan simple como:

```bash
$ composer require Lambdish/phunctional
```

Nos aporta en muchos casos funcionalidades ya presentes de alguna forma en PHP pero de forma que homogeniza la forma de pasar parámetros.

Ya hablé hace en unos años en una [_lightning_ en un PHPVigo](https://docs.google.com/presentation/d/1C7eEtWsiawZA0X0Vm1N-KE5QFxaHX6Y45DK50uL9lJ0/edit#slide=id.g1d60cdcfc8_0_36) de las vergüenzas de PHP, con respecto a algunas de las funciones de manejo de _arrays_, por ejemplo 
```php
array_map ( callable $callback , array $array1 [, array $... ] ) : array
array_reduce ( array $array , callable $callback [, mixed $initial = NULL ] ) : mixed
```
Que como veis, no mantiene una consistencia en el orden de los parámetros.

Por lo contrario, Lambdish\Phunctional si la mantiene

```php
Lambdish\Phunctional\map( callable $fn, $coll ) : array
Lambdish\Phunctional\reduce( callable $fn, $coll, $initial = null ) : array
```

Sólo por esto vale la pena usarlo :joy:

Ya en serio nos provee de mogollón de funciones chulas que nos simplifican la vida, por ejemplo:
```php
<?php
use function Lambdish\Phunctional\group_by;

group_by('strlen', ['manzana', 'patata', 'melón', 'jamón', 'fresa', 'mandarina']); 
// [5 => ['melón', 'jamón', 'fresa'], 6 => ['patata'], 7 => ['manzana'], 9 => ['mandarina']
```
Que nos devuelve un nuevo array con los elementos agrupados por el valor resultado de aplicar a cada elemento la función, en este caso `strlen`

También podemos encadenar varias funciones:
```php
<?php
use function Lambdish\Phunctional\do_if;
use function Lambdish\Phunctional\each;

each(
    do_if(
        function ($item) {
            print $item . PHP_EOL;
        },
    [
        function($item) { return $item > 10;  },
        function($item) { return is_numeric($item) && !is_string($item); }
    ]),
    [ 11, 3, '14', 'a', 40]    
);
```

En este caso, recorremos el _array_ y aplicamos a cada elemento `do_if` que lo que hace es ejecutar la primera función si el resultado de todas las funciones indicadas en el _array_ es `true`

Como veis las posibilidades son muchas sobre todo para trabajar con *Colecciones* (_arrays_, _objectos_ o _generadores_).

No voy a hacer una descripción de cada función una a una, porque no tiene demasiado sentido ya que tenéis la documentación completa de todas las funciones disponibles en https://github.com/Lambdish/phunctional/blob/master/docs/docs.md y el objetivo de este post es dar a conocer un poco la programación funcional en PHP y esta fantástica librería.

P.D. Uno de los principales contribuidores del proyecto es [Rafa Gómez](https://twitter.com/rafaoe), al que he tenido el placer de conocer en persona en la
[PulpoCon 19]({{< ref "blog/2019/pulpocon-19" >}})





