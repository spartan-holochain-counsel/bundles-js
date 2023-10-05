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

const DNA_1_BYTES			= await readFile( path.join( __dirname, `../fake_dna_1.dna` ) );


function basic_tests () {
    it("should init DNA bundle", async () => {
	const bundle			= new Bundle( DNA_1_BYTES );

	expect( bundle.type		).to.equal("dna");

	const zomes			= bundle.zomes();
	log.debug("Zomes:", zomes );
    });

}

function errors_tests () {
}

describe("DNA Bundle", () => {

    describe("Basic", basic_tests );
    describe("Errors", errors_tests );

});
