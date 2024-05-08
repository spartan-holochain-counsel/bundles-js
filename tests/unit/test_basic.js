import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-unit", process.env.LOG_LEVEL );

import path				from 'path';
import { fileURLToPath }		from 'url';
import { readFile }			from 'fs/promises';

import { expect }			from 'chai';
import json				from '@whi/json';

import {
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
}

describe("Bundles", () => {

    linearSuite("Basic", basic_tests );
    linearSuite("Errors", errors_tests );

});
