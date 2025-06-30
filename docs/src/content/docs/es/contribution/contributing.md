---
title: Contribuyendo
description: Cómo ayudar a desarrollar el go-fast-cdn.
---

## Go-fast CDN

Puedes acceder al código fuente en [Github](https://github.com/kevinanielsen/go-fast-cdn/), donde se anima a todos a ayudar en todo lo que puedan para mejorar este proyecto. Aunque no puedas contribuir a las características de este proyecto, aún puedes contribuir escribiendo pruebas, corrigiendo errores o incluso corrigiendo erratas.

Si eso no es posible, aún puedes ayudar contribuyendo a la [Documentación](#documentación). Incluso dejar una estrella o compartir el proyecto es una excelente manera de contribuir.

Si quieres informar de un error o solicitar una característica, puedes crear un nuevo issue en GitHub, donde se presenta una plantilla y se anima a usarla. Si quieres corregir un error o implementar una nueva característica, abre un pull request con tu sugerencia.

Por favor, lee la [Guía de Desarrollo](/go-fast-cdn/es/contribution/development) para aprender más sobre cómo desarrollar en este proyecto.

### Commits

Este proyecto sigue la [convención @commitlint](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) y te pedimos que hagas lo mismo tanto como sea posible. Lo más importante es añadir un tipo de commit, que debe ser uno de los siguientes:

- **build** - cambios relacionados con la compilación
- **chore** - cambios no cubiertos por otros tipos
- **ci** - cambios relacionados con CI/CD
- **docs** - cambios relacionados con la documentación
- **feat** - nuevas características
- **fix** - correcciones de errores
- **perf** - cambios que mejoran el rendimiento
- **refactor** - refactorización de código
- **revert** - revertir a commits anteriores
- **style** - cambios relacionados con el estilo
- **test** - cambios relacionados con las pruebas

Un ejemplo de un mensaje de commit que sigue esta convención podría ser

```txt
docs: añadir la guía de convención de commits a la guía de contribución
```

Para especificar aún más lo que tu commit está cambiando, puedes añadir un ámbito con paréntesis, así:

```txt
feat(api): añadir endpoint para la subida de archivos
```

## Documentación

[Github](https://github.com/kevinanielsen/go-fast-cdn/) es un monorepo, donde la documentación se puede encontrar en el directorio /docs. Si quieres solicitar documentación para una característica, crea un nuevo issue en Github. Si tienes la solución para un issue o quieres editar la documentación, bifurca el proyecto y, cuando estés listo, abre un nuevo pull request.
