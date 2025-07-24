---
title: Udvikling
description: Sådan hjælper du med at udvikle go-fast-cdn.
---

## Installation

### Kloning af repo'et

Du kan klone dette repo med en af følgende kommandoer:

```bash title="SSH"
git clone git@github.com:kevinanielsen/go-fast-cdn
```

```bash title="HTTPS"
git clone https://github.com:kevinanielsen/go-fast-cdn
```

### Opsætning af projektet

Dette projekt bruger [dotenv](https://dotenv.org), og du kan få adgang til `.env.example` [her](https://vault.dotenv.org/project/vlt_a602c18fc8f8fd898bfacba2ed8715a9deca301c87e06fbb3ea2cde40c41e109/example). Du kan kopiere det og indsætte det i din `.env`-fil.

## Bygning

Dette projekt bruger en makefile, og du kan bruge den til at bygge de binære filer.

```bash
make prep   # installer afhængigheder
make clean  # ryd outputfilerne (brug ikke, hvis det er første gang, du bygger)
make build  # byg de binære filer
```

Dette vil krydskompolere til windows-, darwin- og linux-binære filer, så sørg for, at du har kompilatorerne installeret på din maskine, hvis du kører `make build`. Hvis du ikke har kompilatoren installeret, skal du i stedet køre

```bash
go build .
```

### Kørsel

#### Kørsel af den binære fil

Din binære fil skulle nu være bygget, og du kan køre den med en af følgende kommandoer, afhængigt af dit system:

```sh title="Windows"
.\bin\go-fast-cdn-windows
```

```bash title="MacOS"
/bin/go-fast-cdn-darwin
```

```bash title="Linux"
/bin/go-fast-cdn-linux
```

#### Kørsel med live reload

For hurtigere udviklingscyklusser kan du også køre projektet med [air](https://github.com/air-verse/air).

```bash
make prep  # hvis du ikke allerede har gjort det
make dev   # kører med live reload
```

Prøv nu at lave ændringer i koden og se dem med det samme afspejlet i browseren. 