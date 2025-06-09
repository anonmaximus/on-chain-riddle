# Application

## Table des matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Scripts](#scripts)
4. [Dépendances](#dépendances)
5. [Déploiement](#déploiement)

## Introduction

Ce projet est structuré en trois parties principales : le front-end, le back-end et les ressources communes.

## Installation

Pour installer toutes les dépendances du projet, exécutez la commande suivante à la racine du projet :

```bash
npm run postinstall
```

## Scripts

### Scripts généraux

- `postinstall`: Installe les dépendances pour les parties communes, front-end et back-end.
- `install:common`: Installe les dépendances pour les ressources communes.
- `install:back-end`: Installe les dépendances pour le back-end.
- `install:front-end`: Installe les dépendances pour le front-end.
- `install:cron`: Installe les dépendances pour les ressources communes et le back-end.
- `build`: Construit les parties communes, front-end et back-end.
- `build:common`: Construit les ressources communes.
- `build:front-end`: Construit le front-end.
- `build:back-end`: Construit le back-end.
- `build:cron`: Construit les ressources communes et le back-end.
- `start:dev`: Lance le serveur de développement pour le back-end et le front-end.
- `start:prod`: Lance le serveur de production pour le back-end.
- `watch:front-end`: Lance le serveur de développement pour le front-end.
- `watch:back-end`: Lance le serveur de développement pour le back-end.
- `cron:dev`: Lance le processus cron en mode développement.
- `cron:prod`: Lance le processus cron en mode production.
- `format`: Formate le code avec Prettier.
- `test`: Exécute les tests.

### Scripts front-end

- `express_test`: Lance un serveur Express pour tester le front-end.
- `dev`: Lance le serveur de développement Next.js avec Turbopack.
- `build`: Construit le front-end avec Next.js.
- `start`: Lance le serveur de production Next.js.
- `lint`: Lint le code avec ESLint.

### Scripts back-end

- `watch`: Surveille les fichiers et reconstruit le back-end en cas de changement.
- `build`: Construit le back-end.
- `postbuild`: Copie les fichiers publics après la construction.
- `start:dev`: Construit et lance le serveur de développement pour le back-end.
- `start:prod`: Déploie les migrations et lance le serveur de production pour le back-end.
- `cron:prod`: Lance le processus cron en mode production.
- `cron:dev`: Lance le processus cron en mode développement.
- `migrate:dev`: Exécute les migrations en mode développement.
- `migrate:deploy`: Déploie les migrations.
- `migrate:status`: Affiche le statut des migrations.
- `migrate:help`: Affiche l'aide pour les migrations Prisma.
- `migrate:generate`: Génère les fichiers Prisma.
- `db:client`: Lance Prisma Studio.
- `db:seed`: Construit et exécute le seed de la base de données.