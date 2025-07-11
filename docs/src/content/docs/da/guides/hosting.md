---
title: Hosting
description: Lær at dockerisere og hoste dit CDN.
---

Du kan nemt hoste et CDN gratis ved hjælp af Docker og fly.io. I denne guide lærer du, hvordan du gør dette med minimale krav.

---

#### Krav

Du behøver ikke have stor erfaring med Docker eller CDN'er generelt for at hoste et go-fast-cdn for første gang. Alt hvad du behøver er:

- meget grundlæggende kendskab til din foretrukne **terminal**.
- **Docker** downloadet og kørende på din maskine.

## Kom i gang

Du kan klone [Github-repositoriet](https://github.com/kevinanielsen/go-fast-cdn), men det behøver du ikke, da allerede byggede binære filer er tilgængelige under [releases-fanen](https://github.com/kevinanielsen/go-fast-cdn/releases). Så alt hvad du skal gøre er at oprette en ny mappe på din maskine, hvor vi vil arbejde fra.

Du kan oprette en ny mappe ved at køre følgende kommando i din terminal:

```bash
mkdir go-fast-cdn
```

Derfra skal du oprette en ny Dockerfile, hvilket du kan gøre enten med følgende kommando eller bare ved at oprette filen med din yndlingsteksteditor.

```bash
touch Dockerfile
```

Derfra skal du indsætte følgende linjer i Dockerfilen, som vil kopiere go-fast-cdn-binæren, der er lavet til Linux-distributioner, og servere den på port 8080.

```dockerfile
FROM alpine:latest

ARG GO_FAST_VERSION=0.1.6

RUN apk add --no-cache unzip openssh

# download og unzip go-fast-cdn
ADD https://github.com/kevinanielsen/go-fast-cdn/releases/download/${GO_FAST_VERSION}/go-fast-cdn_${GO_FAST_VERSION}_linux_amd64.zip /tmp/cdn.zip
RUN unzip /tmp/cdn.zip -d /cdn/

EXPOSE 8080

# start go-fast-cdn
CMD ["/cdn/go-fast-cdn"]

```

Nu, når du har gemt filen, kan du teste, om den virker som forventet, ved at bygge containeren. For dette trin skal du sørge for, at du har Docker kørende på din maskine.

```bash
docker build . -t cdn
```

Hvis den bygger succesfuldt, kan du køre den med følgende kommando

```bash
docker run -p 8080:8080 cdn
```

Hvis den kører, har du nu officielt containeriseret dit eget CDN, og du kan gå til [localhost:8080](http://localhost:8080) og se, om det virker som forventet.

## Hosting

Herfra kan du bruge dit CDN, som du ønsker, og hoste det, hvor du vil. Hvis du vil hoste det gratis, kan du gøre det på [fly.io](https://fly.io/).

For at gøre det skal du installere flyctl cli-værktøjet på din maskine. For at installere værktøjet skal du bare følge instruktionerne [her](https://fly.io/docs/hands-on/install-flyctl/).

Når flyctl er installeret, kan du køre

```bash
flyctl launch
```

En konfigurationsmenu skulle nu vises, og du kan følge de angivne instruktioner. Hvis alt går godt, skulle du blive mødt med følgende tekst:

> _Besøg din nyligt implementerede app på https://{dit-valgte-navn}.fly.dev/_

**Tillykke!** Du har nu hostet dit helt eget CDN. 