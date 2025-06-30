---
title: Bidragydende
description: Sådan hjælper du med at udvikle go-fast-cdn.
---

## Go-fast CDN

Du kan få adgang til kildekoden på [Github](https://github.com/kevinanielsen/go-fast-cdn/), hvor alle opfordres til at hjælpe på enhver måde, de kan, for at gøre dette projekt bedre. Selvom du måske ikke kan bidrage til funktionerne i dette projekt, kan du stadig bidrage ved at skrive tests, rette fejl eller endda rette stavefejl.

Hvis det ikke er muligt, kan du stadig hjælpe ved at bidrage til [Dokumentationen](#dokumentation). Selv bare at efterlade en stjerne eller dele projektet er en fantastisk måde at bidrage på.

Hvis du vil rapportere en fejl eller anmode om en funktion, kan du oprette et nyt issue på GitHub, hvor der er en skabelon, som du opfordres til at bruge. Hvis du vil rette en fejl eller implementere en ny funktion, skal du åbne en pull request med dit forslag.

Læs venligst [Udviklingsguiden](/go-fast-cdn/da/contribution/development) for at lære mere om, hvordan du udvikler på dette projekt.

### Commits

Dette projekt følger [@commitlint-konventionen](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional), og vi beder dig om at gøre det samme så meget som muligt. Det vigtigste er at tilføje en commit-type, som skal være en af følgende:

- **build** - ændringer vedrørende buildet
- **chore** - ændringer, der ikke er dækket af andre typer
- **ci** - ændringer vedrørende CI/CD
- **docs** - ændringer vedrørende dokumentation
- **feat** - nye funktioner
- **fix** - fejlrettelser
- **perf** - ændringer, der forbedrer ydeevnen
- **refactor** - refaktorering af kode
- **revert** - tilbageførsel til tidligere commits
- **style** - ændringer vedrørende stil
- **test** - ændringer vedrørende testning

Et eksempel på en commit-besked, der følger denne konvention, kunne være

```txt
docs: tilføj commit-konvention til bidragsguide
```

For yderligere at specificere, hvad din commit ændrer, kan du tilføje et omfang med parenteser, som dette:

```txt
feat(api): tilføj endepunkt for fil-uploads
```

## Dokumentation

[Github](https://github.com/kevinanielsen/go-fast-cdn/) er et monorepo, hvor dokumentationen kan findes i /docs-mappen. Hvis du vil anmode om dokumentation for en funktion, skal du oprette et nyt issue på Github. Hvis du har løsningen på et issue eller vil redigere dokumentationen, skal du forke projektet, og når du er klar, åbne en ny pull request.
