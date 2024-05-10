import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-unit", process.env.LOG_LEVEL );

import path				from 'path';
import { fileURLToPath }		from 'url';
import { readFile }			from 'fs/promises';

import { expect }			from 'chai';
import json				from '@whi/json';

import {
    expect_reject,
    linearSuite,
    sha256,
}					from '../utils.js';
import {
    Bundle,
}					from '../../src/index.js';

const __dirname				= path.dirname( fileURLToPath( import.meta.url ) );

const DNA_1_BYTES			= await readFile( path.join( __dirname, `../fake_dna_1.dna` ) );
const HAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_happ_1.happ` ) );
const WEBHAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_webhapp_1.webhapp` ) );


function basic_tests () {

    it("should init DNA bundle", async function () {
	const bundle			= new Bundle( DNA_1_BYTES );
	log.normal("DNA bundle: %s", json.debug(bundle) );

	expect( bundle.type		).to.equal("dna");
    });

    it("should init hApp bundle", async function () {
	const bundle			= new Bundle( HAPP_1_BYTES );
	log.normal("hApp bundle: %s", json.debug(bundle) );

	expect( bundle.type		).to.equal("happ");
    });

    it("should init WebhApp bundle", async function () {
	const bundle			= new Bundle( WEBHAPP_1_BYTES );
	log.normal("Webhapp bundle: %s", json.debug(bundle) );

	expect( bundle.type		).to.equal("webhapp");
    });

    it("should init bundle from config", async function () {
	const bundle			= new Bundle({
	    "manifest": {
		"manifest_version": "1",
		"name": "fake-dna-1",
		"integrity": {
		    "network_seed": null,
		    "properties": null,
		    "origin_time": "2023-01-01T00:00:00Z",
		    "zomes": [
			{
			    "name": "fake-wasm-1",
			    "hash": null,
			    "bundled": "../fake_wasm_1.wasm",
			    "dependencies": null,
			    "dylib": null
			}
		    ]
		},
		"coordinator": {
		    "zomes": [
			{
			    "name": "fake-wasm-2",
			    "hash": null,
			    "bundled": "../fake_wasm_2.wasm",
			    "dependencies": [
				{
				    "name": "fake-wasm-1"
				}
			    ],
			    "dylib": null
			}
		    ]
		},
	    },
	    "resources": {
		"../fake_wasm_1.wasm": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
		"../fake_wasm_2.wasm": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
	    },
	});
	log.normal("DNA bundle: %s", json.debug(bundle) );

	expect( bundle.type		).to.equal("dna");
    });

    it("should verify same DNA bundle contents", async function () {
	const bundle			= new Bundle( DNA_1_BYTES );

	const source_manifest		= bundle.manifest.source;
	const bundle_manifest		= bundle.manifest.toJSON();

	expect( source_manifest		).to.deep.equal( bundle_manifest );

	const mp_source_hash		= sha256( bundle.msgpack_source );
	const mp_bundle_hash		= sha256( bundle.toEncoded() );

	expect( mp_source_hash		).to.equal( mp_bundle_hash );

	const source_hash		= sha256( bundle.source );
	const bundle_hash		= sha256( bundle.toGzipped() );

	expect( source_hash		).to.not.equal( bundle_hash );
    });

}

function errors_tests () {

    it("should fail to init DNA bundle because missing coordinator resource", async function () {
	await expect_reject(async () => {
	    new Bundle({
		"manifest": {
		    "manifest_version": "1",
		    "name": "fake-dna-1",
		    "integrity": {
			"network_seed": null,
			"properties": null,
			"origin_time": "2023-01-01T00:00:00Z",
			"zomes": [
			    {
				"name": "fake-wasm-1",
				"hash": null,
				"bundled": "../fake_wasm_1.wasm",
				"dependencies": null,
				"dylib": null
			    }
			]
		    },
		    "coordinator": {
			"zomes": [
			    {
				"name": "fake-wasm-2",
				"hash": null,
				"bundled": "../fake_wasm_2.wasm",
				"dependencies": [
				    {
					"name": "fake-wasm-1"
				    }
				],
				"dylib": null
			    }
			]
		    },
		},
		"resources": {
		    "../fake_wasm_1.wasm": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
		},
	    });
	}, "missing resource for coordinator");
    });

    it("should fail to init hApp bundle because missing DNA resource", async function () {
	await expect_reject(async () => {
	    new Bundle({
		"manifest": {
		    "manifest_version": "1",
		    "name": "fake-happ-1",
		    "description": "Empty testing files",
		    "roles": [
			{
			    "name": "fake-dna-1",
			    "provisioning": {
				"strategy": "create",
				"deferred": false
			    },
			    "dna": {
				"bundled": "../fake_dna_1.dna",
				"modifiers": {
				    "network_seed": null,
				    "properties": null,
				    "origin_time": null,
				    "quantum_time": null
				},
				"installed_hash": null,
				"clone_limit": 0
			    }
			}
		    ]
		},
		"resources": {
		},
	    });
	}, "missing resource for DNA");
    });

    it("should fail to init hApp bundle because missing hApp resource", async function () {
	await expect_reject(async () => {
	    new Bundle({
		"manifest": {
		    "manifest_version": "1",
		    "name": "fake-webhapp-1",
		    "ui": {
			"bundled": "../fake_gui_1.zip"
		    },
		    "happ_manifest": {
			"bundled": "../fake_happ_1.happ"
		    }
		},
		"resources": {
		    "../fake_gui_1.zip": new Uint8Array( Array( 1_000 ).fill( 1 ) ),
		},
	    });
	}, "missing resource for hApp");
    });

    it("should fail to init hApp bundle because missing hApp resource", async function () {
	await expect_reject(async () => {
	    const happ_bundle		= new Bundle( HAPP_1_BYTES );
	    new Bundle({
		"manifest": {
		    "manifest_version": "1",
		    "name": "fake-webhapp-1",
		    "ui": {
			"bundled": "../fake_gui_1.zip"
		    },
		    "happ_manifest": {
			"bundled": "../fake_happ_1.happ"
		    }
		},
		"resources": {
		    "../fake_happ_1.happ": happ_bundle.toBytes(),
		},
	    });
	}, "missing resource for UI");
    });

}

describe("Bundles", () => {

    linearSuite("Basic", basic_tests );
    linearSuite("Errors", errors_tests );

});
