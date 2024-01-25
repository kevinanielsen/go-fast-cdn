---
title: Desarrollo
description: Cómo ayudar a desarrollar go-fast-cdn.
---

## Instalación

### Clonando el repositorio

Puedes clonar este repositorio con alguno de los siguientes comandos:

```bash title="SSH"
git clone git@github.com:kevinanielsen/go-fast-cdn
```

```bash title="HTTPS"
git clone https://github.com:kevinanielsen/go-fast-cdn
```

### Configurando el proyecto

Este proyecto utiliza [dotenv](https://dotenv.org) y puedes acceder al `.env.example` [aquí](https://vault.dotenv.org/project/vlt_a602c18fc8f8fd898bfacba2ed8715a9deca301c87e06fbb3ea2cde40c41e109/example).
Puedes copiar eso y pegarlo en tu archivo `.env`.

## Compilación

Este proyecto utiliza un Makefile, y puedes usarlo para construir los binarios.

```bash
make prep   # Instalar dependencias
make clean  # Limpiar los archivos de salida (no utilices si es la primera vez que construyes)
make build  # Compilar los binarios.
```

Esto compilará cruzadamente los binarios para Windows, Darwin y Linux, así que asegúrate de tener los compiladores instalados en tu máquina si ejecutas `make build`. Si no tienes el compilador instalado, en su lugar ejecuta:

```bash
go build .
```

### Ejecución

Tu binario debería estar construido ahora y puedes ejecutarlo con uno de los siguientes comandos, dependiendo de tu sistema:

```sh title="Windows"
.\bin\go-fast-cdn-windows
```

```bash title="MacOS"
/bin/go-fast-cdn-darwin
```

```bash title="Linux"
/bin/go-fast-cdn-linux
```
