# Misskey API

[![Greenkeeper badge](https://badges.greenkeeper.io/misskey-delta/misskey-api.svg)](https://greenkeeper.io/)
[![][travis-badge]][travis-link]
[![][david-badge]][david-link]
[![][david-dev-badge]][david-dev-link]
[![][mit-badge]][mit]

Misskey API is written in TypeScript.

## External dependencies
* Node.js
* npm
* MongoDB
* Redis
* GraphicsMagick
* OpenSSL

## How to build
Ensure that you have [node-gyp](https://github.com/nodejs/node-gyp#installation) installed.

1. `git clone git://github.com/misskey-delta/misskey-api.git`
2. `cd misskey-api`
3. `npm install`
4. `npm run build`

## How to run tests
`npm run test`

## How to start Misskey API server
`npm start`

## License
The MIT License. See [LICENSE](LICENSE).

[mit]:             http://opensource.org/licenses/MIT
[mit-badge]:       https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square
[travis-link]:     https://travis-ci.org/misskey-delta/misskey-api
[travis-badge]:    http://img.shields.io/travis/misskey-delta/misskey-api.svg?style=flat-square
[david-link]:      https://david-dm.org/misskey-delta/misskey-api
[david-badge]:     https://img.shields.io/david/misskey-delta/misskey-api.svg?style=flat-square
[david-dev-link]:  https://david-dm.org/misskey-delta/misskey-api#info=devDependencies&view=table
[david-dev-badge]: https://img.shields.io/david/dev/misskey-delta/misskey-api.svg?style=flat-square