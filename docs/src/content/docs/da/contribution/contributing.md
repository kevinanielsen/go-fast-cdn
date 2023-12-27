---
title: Bidragelse
description: Hvordan du kan hjælpe til med at bygge Go-Fast CDN.
---

## Go-fast CDN

Du kan se koden på [Github](https://github.com/kevinanielsen/go-fast-cdn/), hvor alle er opfordret til at hjælpe til på enhver måde de kan. Selvom du måske ikke kan hjælpe til med at bidrage til nye funktioner, kan du stadig hjælpe til med at lave tests, fikse bugs eller endda rette stavefejl.

Hvis det stadig ikke er muligt, kan du stadig hjælpe til med at bidrage til [Dokumentationen](#documentation). Du kan endda hjælpe til ved bare at give projektet en stjerne eller dele det.

Hvis du vil rapportere en fejl eller anmode om en funktion, kan du oprette et nyt issue på GitHub, hvor der vil være en skabelon som opfordres til at bruges. Hvis du vil rette en fejl eller implementere en ny funktion, kan du åbne en ny pull request med dine forslag.

Venligst læs [Udviklingsguiden](/go-fast-cdn/contribution/development) for at lære mere om hvordan man udvikler på dette projekt.

### Commits

Dette projekt følger [@commitlint konventionen](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) og vi forventer at du gør det samme så vidt muligt. Det vigtigeste er at du tilføjer en commit-type som skal være en af følgende:

- **build** - ændringer på sammensætningen af projektet
- **chore** - ændringer der ikke er dækket af andre kategorier
- **ci** - ændringer der har at gøre med CI/CD
- **docs** - ændringer til dokumentationen
- **feat** - nye funktioner
- **fix** - rettelser af fejl
- **perf** - ændringer som er relateret til ydeevnen
- **refactor** - omskrivning af kode
- **revert** - tilbageførsler til tidligere commits
- **style** - ændringer til styling
- **test** - ændringer til tests
- **i18n** - ændringer til lokalisering

Commits skal skrives på engelsk, og kan se ud som følgende:

```txt
docs: add commit-convention to contribution guide
```

For at yderligere specificere hvad din commit ændrer, kan du tilføje et scope med parenteser, som således:

```txt
feat(api): add endpoint for file uploads
```

## Dokumentation

[Github](https://github.com/kevinanielsen/go-fast-cdn/) er et monorepo, hvor dokumentationen kan findes i mappen `/docs`. Hvis du vil anmode om dokumentation til en funktion, kan du oprette et nyt issue på GitHub, hvis du har løsningen på et issue eller vil redigere dokumentationen, kan du forke projektet og når du er klar, åbne en ny pull request.
