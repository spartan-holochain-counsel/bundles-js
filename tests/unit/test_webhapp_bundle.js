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
    webhappConfig,
}					from '../utils.js';
import {
    Bundle,
}					from '../../src/index.js';

const __dirname				= path.dirname( fileURLToPath( import.meta.url ) );

const WEBHAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_webhapp_1.webhapp` ) );

const TEST_DNA_CONFIG			= dnaConfig();
const TEST_HAPP_CONFIG			= happConfig([{
    "name": "fake-role-1",
    "dna": {
	"bytes": Bundle.createDna( TEST_DNA_CONFIG ).toBytes(),
    },
}]);
const TEST_WEBHAPP_CONFIG		= webhappConfig({
    "bytes": Bundle.createHapp( TEST_HAPP_CONFIG ).toBytes(),
});


function basic_tests () {
    it("should init Webhapp bundle", async () => {
	const bundle			= new Bundle( WEBHAPP_1_BYTES );

	expect( bundle.type		).to.equal("webhapp");

	const happ			= bundle.happ();
	const ui			= bundle.ui();
	log.normal("hApp: %s", json.debug(happ) );
	log.normal("UI: %s", json.debug(ui) );
    });

    it("should create Webhapp bundle", async function () {
	const bundle			= Bundle.createWebhapp( TEST_WEBHAPP_CONFIG );

	expect( bundle.type		).to.equal("webhapp");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 644 );

	const rebundled			= new Bundle( bytes );

	expect( bundle.type		).to.equal( rebundled.type );
    });

    it("should create a bundle again using the same config", async function () {
	const bundle			= Bundle.createWebhapp( TEST_WEBHAPP_CONFIG );

	expect( bundle.type		).to.equal("webhapp");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 644 );
    });

}

function errors_tests () {
}

describe("hApp Bundle", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
