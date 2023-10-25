

export function dnaConfig () {
    return {
	"name": "fake-dna-1",
	"integrity": {
	    "origin_time": "2023-01-01T00:00:00Z",
	    "zomes": [{
		"name": "fake-wasm-1",
		"bytes": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
	    }],
	},
	"coordinator": {
	    "zomes": [{
		"name": "fake-wasm-2",
		"bytes": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
		"dependencies": [
		    "fake-wasm-1",
		],
	    }],
	},
    };
}


export function happConfig ( roles ) {
    return {
	"name": "fake-happ-1",
	"description": "Empty testing files",
	"roles": roles,
    };
}


export function webhappConfig ( happ_manifest ) {
    return {
	"name": "fake-webhapp-1",
	"ui": {
	    "bytes": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
	},
	happ_manifest,
    };
}


export default {
    dnaConfig,
    happConfig,
    webhappConfig,
};
