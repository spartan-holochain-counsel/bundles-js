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


function basic_tests () {
    it("should init hApp bundle", async () => {
	const bundle			= new Bundle( HAPP_1_BYTES );

	expect( bundle.type		).to.equal("happ");

	const dnas			= bundle.dnas();
	log.debug("DNAs:", dnas.map( dna => String(dna)) );
    });

    it("should create hApp bundle", async function () {
	const config			= happConfig([{
	    "dna": {
		"bytes":		Bundle.createDna( dnaConfig() ).toBytes(),
	    },
	}]);
	const bundle			= Bundle.createHapp( config );

	expect( bundle.type		).to.equal("happ");

	const bytes			= bundle.toBytes();

	expect( bytes			).to.have.length( 424 );

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
