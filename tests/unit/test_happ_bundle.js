import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-unit", process.env.LOG_LEVEL );

import path				from 'path';
import { fileURLToPath }		from 'url';
import { readFile }			from 'fs/promises';

import { expect }			from 'chai';

import json				from '@whi/json';
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
	log.debug("DNAs:", dnas );
    });

}

function errors_tests () {
}

describe("hApp Bundle", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
