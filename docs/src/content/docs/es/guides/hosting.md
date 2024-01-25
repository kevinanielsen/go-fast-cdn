---
title: Alojamiento
description: Aprende a dockerizar y alojar tu CDN.
---

Puedes alojar fácilmente una CDN de forma gratuita utilizando Docker y fly.io. En esta guía aprenderás cómo hacerlo con requisitos mínimos.

---

#### Requisitos

No necesitas tener mucha experiencia con Docker o CDNs en general para alojar por primera vez un go-fast-cdn. Todo lo que necesitas es:

- Conocimientos muy básicos sobre tu **terminal** de elección.
- **Docker** descargado y ejecutándose en tu máquina.

## Comenzando

Podrías clonar el [repositorio Github](https://github.com/kevinanielsen/go-fast-cdn) pero no es necesario hacerlo, ya que los binarios ya construidos están disponibles en la [pestaña de versiones](https://github.com/kevinanielsen/go-fast-cdn/releases). Así que todo lo que necesitas hacer es crear un nuevo directorio en tu máquina donde trabajaremos.

Puedes crear un nuevo directorio ejecutando el siguiente comando en tu terminal:

```bash
mkdir go-fast-cdn
```

A partir de ahí, necesitas crear un nuevo archivo Dockerfile, lo cual puedes hacer con el siguiente comando o simplemente creando el archivo con tu editor de texto favorito.

```bash
touch Dockerfile
```

A partir de ahí, debes pegar las siguientes líneas en el Dockerfile, que copiarán el binario de go-fast-cdn diseñado para distribuciones de Linux y lo servirán en el puerto 8080.

```dockerfile
FROM alpine:latest

ARG GO_FAST_VERSION=0.1.6

RUN apk add --no-cache unzip openssh

# download and unzip go-fast-cdn
ADD https://github.com/kevinanielsen/go-fast-cdn/releases/download/${GO_FAST_VERSION}/go-fast-cdn_${GO_FAST_VERSION}_linux_amd64.zip /tmp/cdn.zip
linux.zip /tmp/cdn.zip
RUN unzip /tmp/cdn.zip -d /cdn/

EXPOSE 8080

# start go-fast-cdn
CMD ["/cdn/go-fast-cdn-linux"]

```

Ahora, después de haber guardado el archivo, puedes probar si funciona como se espera construyendo el contenedor. Para este paso, asegúrate de que Docker esté en ejecución en tu máquina.

```bash
docker build . -t cdn
```

Si se construye correctamente, puedes ejecutarlo con el siguiente comando:

```bash
docker run -p 8080:8080 cdn
```

Si se ejecuta, ahora has contenerizado oficialmente tu propia CDN y puedes ir a [localhost:8080](http://localhost:8080) y verificar si funciona como se espera.

## Alojamiento

A partir de aquí, puedes utilizar tu CDN como desees y alojarlo donde prefieras. Si deseas alojarlo de forma gratuita, puedes hacerlo en [fly.io](https://fly.io/).

To do so, you need to install the flyctl cli-tool on your machine. To install the tool, just follow the instructions [aquí](https://fly.io/docs/hands-on/install-flyctl/).

Cuando flyctl esté instalado, puedes ejecutar

```bash
flyctl launch
```

Ahora debería aparecer un menú de configuración, y puedes seguir las instrucciones enumeradas. Si todo va bien, deberías recibir el siguiente texto:

> _Visit your newly deployed app at https://{your-chosen-name}.fly.dev/_

**¡Felicidades!** Ahora has alojado tu propia CDN.
