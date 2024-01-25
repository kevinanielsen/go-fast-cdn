---
title: Contribuciones
description: Cómo ayudar en el desarrollo de go-fast-cdn.
---

## Go-fast CDN

Puedes acceder al código fuente en [Github](https://github.com/kevinanielsen/go-fast-cdn/), donde se anima a todos a contribuir de cualquier manera posible para mejorar este proyecto. Aunque es posible que no puedas contribuir a las características de este proyecto, aún puedes contribuir escribiendo pruebas, corrigiendo errores o incluso corrigiendo errores tipográficos.

Si eso no es posible, aún puedes ayudar contribuyendo a la [Documentación](#documentation). Incluso solo dejar una estrella o compartir el proyecto es una excelente manera de contribuir.

Si deseas informar un error o solicitar una nueva característica, puedes crear un nuevo problema en GitHub, donde se proporciona una plantilla y se anima a su uso. Si deseas corregir un error o implementar una nueva característica, adelante y abre una solicitud de extracción con tu propuesta.

Por favor, lee la [Guía de Desarrollo](/go-fast-cdn/contribution/development) para obtener más información sobre cómo desarrollar en este proyecto.

### Commits

Este proyecto sigue las [convenciones de @commitlint](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) y pedimos que por favor hagas lo mismo en la medida de lo posible. Lo más importante es agregar un tipo de commit que debe ser uno de los siguientes:

- **build** - cambios relacionados con la compilación
- **chore** - cambios no cubiertos por otros tipos
- **ci** - cambios relacionados con CI/CD
- **docs** - cambios relacionados con la documentación
- **feat** - nuevas características
- **fix** - correcciones de errores
- **perf** - cambios que mejoran el rendimiento
- **refactor** - cambios que mejoran el rendimiento
- **revert** - revirtiendo a commits anteriores
- **style** - cambios relacionados con el estilo
- **test** - cambios relacionados con las pruebas

Un ejemplo de un mensaje de commit siguiendo esta convención podría ser:

```txt
docs: add commit-convention to contribution guide
```

Para especificar aún más qué está cambiando tu commit, puedes agregar un alcance con paréntesis, así:

```txt
feat(api): add endpoint for file uploads
```

## Documentación

[Github](https://github.com/kevinanielsen/go-fast-cdn/) Es un monorepo, donde la documentación se encuentra en el directorio /docs. Si deseas solicitar documentación para una característica, adelante y crea un nuevo problema en Github. Si tienes la solución para un problema o quieres editar la documentación, adelante y haz un fork del proyecto, y cuando estés listo, abre una nueva solicitud de extracción.
