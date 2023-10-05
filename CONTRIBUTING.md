[back to README.md](README.md)

# Contributing

## Overview
The purpose of this package is to navigate the configurations inside Holochain bundles.

## Development

### Environment

- Developed using Node.js `v18.14.2`
- Enter `nix develop` for development environment dependencies.

### Building
No build is required for Node.

Bundling with Webpack is supported for web
```
npx webpack
```

### Testing

To run all tests with logging
```
make test-debug
```

- `make test-unit-debug` - **Unit tests only**

> **NOTE:** remove `-debug` to run tests without logging
