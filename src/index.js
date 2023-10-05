import { Logger }			from '@whi/weblogger';
const log				= typeof process === "undefined"
      ? new Logger("bundles", ((import.meta.url === import.meta.main) && localStorage.getItem("LOG_LEVEL")) || "fatal" )
      : new Logger("bundles", process.env.LOG_LEVEL || "fatal" );

import { encode, decode }		from '@msgpack/msgpack';
import gzip_js				from 'gzip-js';

import { set_tostringtag }		from './utils.js';


export function unpack_bundle ( bytes ) {
    try {
	let msgpack_bytes		= gzip_js.unzip( bytes );
	log.normal("Unzipped package: %s bytes", msgpack_bytes.length );
	let bundle			= decode( msgpack_bytes );
	log.normal("Decoded msgpack content (%s resources)", Object.keys(bundle.resources).length );

	for (let path in bundle.resources) {
	    bundle.resources[path]	= new Uint8Array( bundle.resources[path] );
	}

	log.normal("Found resource: %s", Object.keys(bundle.resources) );
	return bundle;
    } catch (err) {
	console.log( err );
	return bytes;
    }
}


function derive_manifest_version ( manifest ) {
    if ( manifest.manifest_version === "1" )
	return new ManifestV1( manifest );
    else
	throw new Error(`Unknown manifest version '${manifest.manifest_version}'`);
}


export class Bundle {
    #manifest				= null;
    #resources				= {};

    constructor ( bytes, expected_type ) {
	if ( Array.isArray( bytes ) )
	    bytes			= new Uint8Array(bytes);

	if ( !(bytes instanceof Uint8Array) )
	    throw new TypeError(`Bundle contents do not match expect type '${expected_type}'; found type '${this.type}'`);

	let bundle			= unpack_bundle( bytes );

	this.#manifest			= derive_manifest_version( bundle.manifest );
	this.#resources			= new Resources( bundle.resources );

	if ( expected_type && expected_type !== this.type )
	    throw new TypeError(`Bundle contents do not match expect type '${expected_type}'; found type '${this.type}'`);
	// console.log( this.manifest );
	// console.log( this.resources );
    }

    get manifest () {
	return this.#manifest;
    }

    get resources () {
	return this.#resources;
    }

    get name () {
	return this.manifest.name;
    }

    get type () {
	return this.manifest.type;
    }

    toString () {
	return `Bundle [${this.name}] { ${this.resources.names} }`;
    }

    toJSON () {
	return String(this);
    }

    zomes () {
	if ( "dna" !== this.type )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'dna' types contain zomes`);

	return {
	    "integrity": Object.fromEntries(
		this.manifest.integrity.zomes.map( config => {
		    const bytes		= this.resources[ config.bundled ];
		    return [ config.name, new Uint8Array(bytes) ];
		})
	    ),
	    "coordinator": Object.fromEntries(
		this.manifest.coordinator.zomes.map( config => {
		    const bytes		= this.resources[ config.bundled ];
		    return [ config.name, new Uint8Array(bytes) ];
		})
	    ),
	};
    }

    dnas () {
	if ( !["happ", "webhapp"].some( k => k === this.type ) )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'happ' or 'webhapp' types contain DNAs`);

	return Object.values( this.resources )
	    .map( bytes => new Bundle(bytes) );
    }

    happ () {
	if ( "webhapp" !== this.type )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'webhapp' types contains a hApp`);

	const rpath			= this.manifest.happ_manifest.bundled;
	return new Bundle( this.resources[ rpath ] );
    }

    ui () {
	if ( "webhapp" !== this.type )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'webhapp' types contains a UI`);

	const rpath			= this.manifest.ui.bundled;
	return new Uint8Array( this.resources[ rpath ] );
    }

}
set_tostringtag( Bundle );


export class ManifestV1 {
    static VERSION			= "1";
    #source				= null;

    constructor ( manifest ) {
	this.#source			= manifest;
	this.deriveType();

	Object.assign( this, manifest );

    }

    get source () {
	return this.#source;
    }

    get version () {
	return this.constructor.VERSION;
    }

    deriveType () {
	if ( ["coordinator", "integrity" ].every(k => k in this.source) )
	    this.type			= "dna";
	else if ( "roles" in this.source )
	    this.type			= "happ";
	else if ( ["ui", "happ_manifest" ].every(k => k in this.source) )
	    this.type			= "webhapp";
	else
	    throw new Error(`Unknown manifest type with properties: ${Object.keys(this.source)}`);
    }

}
set_tostringtag( ManifestV1 );


export class Resources {

    constructor ( resources ) {
	Object.assign( this, resources );
    }

    get names () {
	return Object.keys( this ).join(", ");
    }

}
set_tostringtag( Resources );


export default {
    Bundle
};
