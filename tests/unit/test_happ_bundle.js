import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-unit", process.env.LOG_LEVEL );

import path				from 'path';
import { fileURLToPath }		from 'url';
import { readFile }			from 'fs/promises';

import { expect }			from 'chai';

import json				from '@whi/json';
import {
    dnaConfig,
    happConfig,
}					from '../utils.js';
import {
    Bundle,
}					from '../../src/index.js';

const __dirname				= path.dirname( fileURLToPath( import.meta.url ) );

const HAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_happ_1.happ` ) );

const TEST_DNA_CONFIG			= dnaConfig();
const TEST_HAPP_CONFIG			= happConfig([{
    "name": "fake-role-1",
    "dna": {
	"bytes": Bundle.createDna( TEST_DNA_CONFIG ).toBytes(),
    },
}]);


function basic_tests () {
    it("should init hApp bundle", async () => {
	const bundle			= new Bundle( HAPP_1_BYTES );

	expect( bundle.type		).to.equal("happ");

	const dnas			= bundle.dnas();
	log.normal("DNAs: %s", json.debug(dnas) );
    });

    it("should create hApp bundle", async function () {
	const bundle			= Bundle.createHapp( TEST_HAPP_CONFIG );

	expect( bundle.type		).to.equal("happ");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 491 );

	const rebundled			= new Bundle( bytes );

	expect( bundle.type		).to.equal( rebundled.type );
    });

    it("should create a bundle again using the same config", async function () {
	const bundle			= Bundle.createHapp( TEST_HAPP_CONFIG );

	expect( bundle.type		).to.equal("happ");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 491 );
    });

}

function errors_tests () {
}

describe("hApp Bundle", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
