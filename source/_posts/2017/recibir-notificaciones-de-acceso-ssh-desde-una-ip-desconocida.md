---
title: "Recibir notificaciones de acceso SSH desde una IP desconocida"
date: 2017-05-18
permalink: 2017/05/18/recibir-notificaciones-de-acceso-ssh-desde-una-ip-desconocida/
cover: /images/pexels-photo-397225.jpeg
---
Es habitual que administremos o accedamos de una u otra forma a máquina remotas mediante SSH, ya sea mediante contraseña o _key_ (muy recomendado), pero el acceso remoto es una vulnerabilidad en si misma, o al menos es un posible punto de entrada de un atacante o individuo malicioso. 

Lo habitual es disponer de **_fail2ban_** sobre el servicio _sshd_ que evite los ataques de fuerza bruta.

Pero además, puede ser muy interesante recibir una notificación (SMS, email, Push, etc...) cada vez que se produzca un login correcto en el sistema mediante _ssh_.

### PAM es tu amigo

[Linux Pluggable Authentication Modules](https://en.wikipedia.org/wiki/Linux_PAM) (PAM), sin entrar en mucho detalle, es un sistema de módulos de autentificación para Linux. Simplificando PAM nos permite indicar que se ejecute una aplicación o un script _**bash**_bajo ciertas condiciones, como puede ser en el caso que comentamos, cuando un usuario se loguee exitosamente mediante SSH en nuestro sistema.

En la mayoría de los sistemas el fichero relativo el login ssh se encuentra en **/etc/pam.d/sshd**, así que editamos dicho fichero

<pre>$ sudo nano /etc/pam.d/sshd</pre>

y añadimos el final del mismo lo siguente

`session optional pam_exec.so /usr/local/bin/notify-on-ssh-login.sh`

Con esta modificación estamos indicando que se ejecute un script _on login_.

El contenido del fichero que se ejecutará es el siguiente:

```
!/bin/bash

if [ "$PAM_TYPE" != "open_session" ]
then
  exit 0
fi

MY_IP=_XXX.XXX.XXX.XXX_
REMOTE_IP=$(getent hosts "$PAM_RHOST" | awk '{ print $1 }')
if [ "$OFFICE_IP" != "$REMOTE_IP" ]
then
   echo "Login '$PAM_USER' from '$REMOTE_IP'" | mailx -s "ALERT!!!!" _recipient@somewhere.com_
fi
exit 0

```

Este script lo que hace es comprobar que se ha abierto una sesión (desde SSH), si es asi, comprueba que la IP remota (desde la que se han conectado) no coincide con la que nosotros especifiquemos (para evitar recibir notificaciones cada vez que nosotros mismos nos logueemos) y si no coincide, emplea el _mailx_ para enviar un correo avisándonos de esto.

En mi caso, como método de notificación uso [Pushover](https://pushover.net/) que permite lanzar notificaciones push a tu móvil, y como ventaja aporta niveles de prioridad, permitiendo, por ejemplo, en un caso "grave" como este que se salte el modo "no molestar" del teléfono.

Obviamente este script es mejorable y es posible que realice las acciones que nosotros indiquemos.

Usando _PAM_ también podríamos tener notificaciones de conexiones _ppp_, o cuando un usuario haga un _sudo_, hay mucho donde "jugar".
