---
title: "Entidad con propietario en Laravel 5.4"
date: 2017-03-07
permalink: 2017/03/07/entidad-con-propietario-en-laravel-54/
cover: /images/pexels-photo-132907_0.jpeg
---
Recientemente he iniciado un proyecto con **Laravel 5.4**, en el que algunos de mis modelos tienen un propietario, es decir, los crea un usuario y sólo el tiene acceso para ver o editar los datos de su entidad.

La forma más simple que he encontrado es hacer uso de las posiblilidades que Laravel nos ofrece mediante los _middleware._

En primer lugar extendemos el _Model_ que nos provee _Elocuent_

```
<?php

namespace App;
use Illuminate\Database\Eloquent\Model;

class OwnableModel extends Model {

  public function getOwnerId() {
    return isset($this->user_id) ? $this->user_id : null;
  }

  public function checkIsOwner($user_id) {
    return $this->getOwnerId() == $user_id;
  }
}
```

Esta clase tiene dos métodos: 

`getOwnerID()` que se encarga de devolver el id del propietario de la entidad (por defecto usa el campo user_id)

`checkIsOwner($user_id)` devuelve TRUE si el user_id el el propietario de la entidad

Ahora el modelo concreto que queramos controlar debe extender de _OwnableModel_ en lugar de _Model_.

Los dos métodos mencionados podremos sobreescribirlos para adaptarlos a nuestras necesidades.

Ahora tenemos que crear el _middleware_, en la carpeta _app/Http/Middleware_ creamos el archivo _AbortIfNotOwner.php_ con el siguente contenido.

```
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AbortIfNotOwner {
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request $request
   * @param  \Closure $next
   * @return mixed
   */
  public function handle($request, Closure $next) {
    $isOwner = TRUE;
    foreach ($request->route()->parameters() as $model) {
      if ($model instanceof \App\OwnableModel && !$model->checkIsOwner(Auth::id())) {
        $isOwner = FALSE;
      }
    }

    if (!$isOwner) {
      return response('Unauthorized.', 401);
    }

    return $next($request);

  }
}
```

Este middleware debemos añadirlo a las rutas que deseemos comprobar que el dueño de la entidad es el que accede a ella.

```
Route::get('/ruta/{entity}/', [ 'uses' => 'RutaController@index', ])->middleware('owner');
```

Con estos sencillos pasos tenemos protegida la entidad de forma que si un usuario intenta acceder a una entidadad de las que no es propietario recibirá un error HTTP 401.
