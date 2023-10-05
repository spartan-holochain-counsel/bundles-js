[![](https://img.shields.io/npm/v/@spartan-hc/bundles/latest?style=flat-square)](http://npmjs.com/package/@spartan-hc/bundles)

# Holochain Bundles
A toolkit for managing Holochain bundles (.dna, .happ, .webhapp)

[![](https://img.shields.io/github/issues-raw/spartan-holochain-counsel/bundles-js?style=flat-square)](https://github.com/spartan-holochain-counsel/bundles-js/issues)
[![](https://img.shields.io/github/issues-closed-raw/spartan-holochain-counsel/bundles-js?style=flat-square)](https://github.com/spartan-holochain-counsel/bundles-js/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr-raw/spartan-holochain-counsel/bundles-js?style=flat-square)](https://github.com/spartan-holochain-counsel/bundles-js/pulls)


## Install

```bash
npm i @spartan-hc/bundles
```

## Basic Usage

```javascript
import { readFile } from 'fs/promises';
import { Bundle } from '@spartan-hc/bundles';

const bytes = await readFile("../some_dna_bundle.dna`);
const bundle = new Bundle( bytes );

// bundle.type === "dna"

const zomes = bundle.zomes();
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
