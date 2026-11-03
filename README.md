# bt-runner

[![GitHub Actions CI](https://github.com/js-soft/bt-runner/workflows/Publish/badge.svg)](https://github.com/js-soft/bt-runner/actions?query=workflow%3APublish)
[![npm version](https://badge.fury.io/js/bt-runner.svg)](https://www.npmjs.com/package/bt-runner)

A browser-based test runner for NodeJS.

## Development

Run `npm ci`, `npm run build`, `npm run lint`, and `npm test` from the repository root.

TypeScript 7 is installed as `@typescript/native` and supplies `tsc` for builds and type checks.
The `typescript` dependency aliases `@typescript/typescript6` because ESLint and `ts-node` still require
its JavaScript compiler API. Keep these aliases in both workspace manifests when updating TypeScript.

## License

[MIT](LICENSE)
