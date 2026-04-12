<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Auth DB (PostgreSQL) and protected endpoints

This project now uses a dedicated PostgreSQL database for simple Basic Auth checks on:

- `/api/interpol/*`
- `/api/investigative-committee/*`

### 1. Start PostgreSQL via Docker

```bash
npm run db:up
```

### 2. Configure env

Required variables:

- `POSTGRES_DB_HOST`
- `POSTGRES_DB_PORT`
- `POSTGRES_DB_NAME`
- `POSTGRES_DB_USERNAME`
- `POSTGRES_DB_PASSWORD`
- `CLIENT_APPLICATION_1_USERNAME`
- `CLIENT_APPLICATION_1_PASSWORD`

On app startup, a migration service will:

- create `users` table (if missing)
- upsert one seeded user from `CLIENT_APPLICATION_1_USERNAME` / `CLIENT_APPLICATION_1_PASSWORD`

### 3. Call protected endpoints

Use HTTP Basic Auth header:

```bash
Authorization: Basic base64(username:password)
```

## AdminJS UI (RBAC Management)

Access the admin panel to manage API clients and permissions:

- **URL**: `http://localhost:${PORT}/admin`
- **Default credentials**:
   - Email: `admin@example.com`
   - Password: `admin123`

### Environment Variables

Override default credentials:

```bash
ADMINJS_EMAIL=your-email@example.com
ADMINJS_PASSWORD=your-password
ADMINJS_COOKIE_SECRET=your-cookie-secret
ADMINJS_SESSION_SECRET=your-session-secret
```

### Features

- **APIClients**: Manage API client accounts (username, password, active status)
- **Permissions**: List of all discovered endpoint permissions
- **APIClientPermissions**: Assign permissions to clients

### Permission Discovery

New endpoints are auto-discovered on application restart. The `PermissionScannerService` scans all controllers at startup and adds new permissions to the database.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
