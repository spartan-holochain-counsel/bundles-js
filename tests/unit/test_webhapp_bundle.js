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


function basic_tests () {
    it("should init Webhapp bundle", async () => {
	const bundle			= new Bundle( WEBHAPP_1_BYTES );

	expect( bundle.type		).to.equal("webhapp");

	const happ			= bundle.happ();
	const ui			= bundle.ui();
	log.debug("hApp:", happ );
	log.debug("UI:", ui );
    });

    it("should create Webhapp bundle", async function () {
	const happ_config		= happConfig([{
	    "dna": {
		"bytes":		Bundle.createDna( dnaConfig() ).toBytes(),
	    },
	}]);
	const happ_bundle		= Bundle.createHapp( happ_config );
	const config			= webhappConfig({
	    "bytes": happ_bundle.toBytes(),
	});
	const bundle			= Bundle.createWebhapp( config );

	expect( bundle.type		).to.equal("webhapp");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 574 );

	const rebundled			= new Bundle( bytes );

	expect( bundle.type		).to.equal( rebundled.type );
    });

}

function errors_tests () {
}

describe("hApp Bundle", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
