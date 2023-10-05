import { Logger }			from '@whi/weblogger';
const log				= new Logger("test-unit", process.env.LOG_LEVEL );

import path				from 'path';
import { fileURLToPath }		from 'url';
import { readFile }			from 'fs/promises';

import { expect }			from 'chai';

import {
    Bundle,
}					from '../../src/index.js';

const __dirname				= path.dirname( fileURLToPath( import.meta.url ) );

const DNA_1_BYTES			= await readFile( path.join( __dirname, `../fake_dna_1.dna` ) );
const HAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_happ_1.happ` ) );
const WEBHAPP_1_BYTES			= await readFile( path.join( __dirname, `../fake_webhapp_1.webhapp` ) );


function basic_tests () {

    it("should init DNA bundle", async () => {
	const bundle			= new Bundle( DNA_1_BYTES );
	log.debug("%s", bundle );

	expect( bundle.type		).to.equal("dna");
    });

    it("should init hApp bundle", async () => {
	const bundle			= new Bundle( HAPP_1_BYTES );
	log.debug("%s", bundle );

	expect( bundle.type		).to.equal("happ");
    });

    it("should init WebhApp bundle", async () => {
	const bundle			= new Bundle( WEBHAPP_1_BYTES );
	log.debug("%s", bundle );

	expect( bundle.type		).to.equal("webhapp");
    });

}

function errors_tests () {
}

describe("Bundles", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
