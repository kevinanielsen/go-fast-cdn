<p align="center">
  <a href="https://kevinanielsen.github.io/go-fast-cdn/" target="_blank" rel="noopener">
    <img src="https://i.imgur.com/zVNCMfV.png" alt="Go-Fast CDN - Fast and simple Open Source CDN" />
  </a>
  <a href="https://github.com/kevinanielsen/go-fast-cdn/actions/workflows/release.yml/" target="_blank" rel="noopener">
    <img src="https://github.com/kevinanielsen/go-fast-cdn/actions/workflows/release.yml/badge.svg?branch=main" />
  </a>
  <a href="https://goreportcard.com/report/github.com/kevinanielsen/go-fast-cdn" target="_blank" rel="noopener">
    <img src="https://goreportcard.com/badge/github.com/kevinanielsen/go-fast-cdn" />
  </a>
</p>

# Go-Fast CDN (English)

_"The PocketBase of CDNs" - Me_

### A fast and easy-to-use CDN, built with Go.

Utilizing an SQLite database with GORM and the Gin web framework. UI built with [Vite](https://vite.js/) + [React](https://react.dev/) and [wouter](https://github.com/molefrog/wouter).

## How to use

See our documentation at [kevinanielsen.github.io/go-fast-cdn/](https://kevinanielsen.github.io/go-fast-cdn/)

## Community

Join the [discord](https://discord.gg/z9uqNtU6yS) to talk to fellow users and contributors!

## Development

### Clone the Repository

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com/kevinanielsen/go-fast-cdn`

### Add env variables

This project uses [dotenv](https://vault.dotenv.org/) and I recommend that you do the same. <br>
Read more about the usage on their page. <br><br>
If you do not wish to use this, you can just rename `.example.env` to `.env` and fill in the fields.

### Building the binary

1. Run `make prep`
2. Run `make clean`
3. Run `make test`
4. Run `make build`

Your binary should now be tested, built, and you can run it with `bin/go-fast-cdn-linux` or `bin/go-fast-cdn-windows` or `bin/go-fast-cdn-darwin`

### Quick start with Docker

`git clone git@github.com:kevinanielsen/go-fast-cdn`
or `git clone https://github.com/kevinanielsen/go-fast-cdn`

```
docker-compose up -d
```



# 🇫🇷 Go-Fast CDN (Français)

*« Le PocketBase des CDNs » – Moi*

### Un CDN rapide et simple d’utilisation, développé en Go.

Il utilise une base de données SQLite avec GORM et le framework web Gin.
L’interface utilisateur est construite avec [Vite](https://vite.js/), [React](https://react.dev/) et [wouter](https://github.com/molefrog/wouter).

## Comment l’utiliser

Consultez la documentation sur [kevinanielsen.github.io/go-fast-cdn/](https://kevinanielsen.github.io/go-fast-cdn/)

## Communauté

Rejoignez le [serveur Discord](https://discord.gg/z9uqNtU6yS) pour discuter avec d’autres utilisateurs et contributeurs !

## Développement

### Cloner le dépôt

`git clone git@github.com:kevinanielsen/go-fast-cdn`
ou
`git clone https://github.com/kevinanielsen/go-fast-cdn`

### Ajouter les variables d’environnement

Ce projet utilise [dotenv](https://vault.dotenv.org/), et je vous recommande d’en faire autant. <br>
Vous trouverez plus d’informations sur leur site. <br><br>
Si vous ne souhaitez pas utiliser dotenv, renommez simplement le fichier `.example.env` en `.env` et complétez les champs nécessaires.

### Compiler le binaire

1. Exécutez `make prep`
2. Exécutez `make clean`
3. Exécutez `make test`
4. Exécutez `make build`

Votre binaire est maintenant testé, compilé et prêt à être lancé avec :
`bin/go-fast-cdn-linux`, `bin/go-fast-cdn-windows` ou `bin/go-fast-cdn-darwin`

### Démarrage rapide avec Docker

`git clone git@github.com:kevinanielsen/go-fast-cdn`
ou
`git clone https://github.com/kevinanielsen/go-fast-cdn`

```
docker-compose up -d
```
