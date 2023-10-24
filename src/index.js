import { Logger }			from '@whi/weblogger';
const log				= typeof process === "undefined"
      ? new Logger("bundles", ((import.meta.url === import.meta.main) && localStorage.getItem("LOG_LEVEL")) || "fatal" )
      : new Logger("bundles", process.env.LOG_LEVEL || "fatal" );

import { encode, decode }		from '@msgpack/msgpack';
import {
    gzipSync,
    gunzipSync,
}					from 'fflate';

import { set_tostringtag }		from './utils.js';


export function unpack_bundle ( bytes ) {
    log.normal("Unpacking bundle with %s bytes", bytes.length );
    let msgpack_bytes			= gunzipSync( bytes );
    log.normal("Unzipped package: %s bytes", msgpack_bytes.length );
    let bundle				= decode( msgpack_bytes );
    log.normal("Decoded msgpack content (%s resources)", Object.keys(bundle.resources).length );

    for (let path in bundle.resources) {
	bundle.resources[path]		= new Uint8Array( bundle.resources[path] );
    }

    log.normal("Found resource: %s", Object.keys(bundle.resources) );
    return bundle;
}

export function pack_bundle ( bundle ) {
    let msgpack_bytes			= encode( bundle );
    log.normal("Encoded msgpack content (%s bytes)", msgpack_bytes.length );
    let bytes				= gzipSync( msgpack_bytes, {
	"mtime": 0,
    });
    log.normal("Zipped package: %s bytes", bytes.length );

    return bytes;
}


function derive_manifest_version ( manifest ) {
    if ( manifest.manifest_version === "1" )
	return new ManifestV1( manifest );
    else
	throw new Error(`Unknown manifest version '${manifest.manifest_version}'`);
}


export class Bundle {
    #manifest				= null;
    #resources				= null;

    static createDna ( manifest ) {
	const resources			= {};
	const integrity_zome_names	= [];

	manifest.integrity.zomes	= manifest.integrity.zomes.map( zome => {
	    integrity_zome_names.push( zome.name );

	    const rpath			= `${zome.name}.wasm`;
	    resources[ rpath ]		= zome.bytes;

	    delete zome.bytes;
	    zome.bundled		= rpath;

	    return Object.assign({
		"hash": null,
		"dylib": null
	    }, zome );
	});

	manifest.coordinator.zomes	= manifest.coordinator.zomes.map( zome => {
	    zome.dependencies.forEach( integrity_name => {
		if ( !integrity_zome_names.includes( integrity_name ) )
		    throw new Error(`Integrity dependency '${integrity_name}' does not exist; available dependencies are: ${integrity_zome_names.join(', ')}`);
	    });

	    const rpath			= `${zome.name}.wasm`;
	    resources[ rpath ]		= zome.bytes;

	    delete zome.bytes;
	    zome.bundled		= rpath;

	    return Object.assign({
		"hash": null,
		"dylib": null
	    }, zome );
	});

	manifest.integrity		= Object.assign({
	    "network_seed": null,
	    "properties": null,
	    "origin_time": (new Date()).toISOString(),
	}, manifest.integrity );

	manifest			= Object.assign({
	    "manifest_version": "1",
	}, manifest );

	return new Bundle({
	    manifest,
	    resources,
	});
    }

    static createHapp ( manifest ) {
	const resources			= {};

	manifest.roles			= manifest.roles.map( role => {
	    const rpath			= `${role.name}.dna`;
	    resources[ rpath ]		= role.dna.bytes;

	    delete role.dna.bytes;
	    role.dna.bundled		= rpath;

	    return Object.assign({
		"provisioning": {
		    "strategy": "create",
		    "deferred": false
		},
		"dna": Object.assign({
		    "modifiers": Object.assign({
			"network_seed": null,
			"properties": null,
			"origin_time": null,
			"quantum_time": null
		    }, role.dna.modifiers ),
		    "installed_hash": null,
		    "clone_limit": 0
		}, role.dna ),
	    }, role );
	});

	manifest			= Object.assign({
	    "manifest_version": "1",
	}, manifest );

	return new Bundle({
	    manifest,
	    resources,
	});
    }

    static createWebhapp ( manifest ) {
	const resources			= {};

	{
	    const rpath			= "ui.zip";
	    resources[ rpath ]		= manifest.ui.bytes;

	    delete manifest.ui.bytes;
	    manifest.ui.bundled		= rpath;
	}

	{
	    const rpath			= "bundled.happ";
	    resources[ rpath ]		= manifest.happ_manifest.bytes;

	    delete manifest.happ_manifest.bytes;
	    manifest.happ_manifest.bundled	= rpath;
	}

	manifest			= Object.assign({
	    "manifest_version": "1",
	}, manifest );

	return new Bundle({
	    manifest,
	    resources,
	});
    }

    constructor ( bundle, expected_type ) {
	if ( Array.isArray( bundle ) )
	    bundle			= new Uint8Array(bundle);
	if ( bundle instanceof Uint8Array )
	    bundle			= unpack_bundle( bundle );

	// validate_bundle( bundle )

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

    toBytes () {
	return pack_bundle( this.toJSON() );
    }

    toString () {
	return `Bundle [${this.name}] { ${this.resources.names} }`;
    }

    toJSON () {
	return {
	    "manifest": this.manifest.toJSON(),
	    "resources": this.resources.toJSON(),
	};
    }

    zomes () {
	if ( "dna" !== this.type )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'dna' types contain zomes`);

	return {
	    "integrity": this.manifest.integrity.zomes.map( config => {
		return Object.assign( {}, config, {
		    "bytes":	new Uint8Array( this.resources[ config.bundled ] ),
		});
	    }),
	    "coordinator": this.manifest.coordinator.zomes.map( config => {
		return Object.assign( {}, config, {
		    "bytes":	new Uint8Array( this.resources[ config.bundled ] ),
		});
	    }),
	};
    }

    dnas () {
	if ( !["happ", "webhapp"].some( k => k === this.type ) )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'happ' or 'webhapp' types contain DNAs`);

	return Object.values( this.resources )
	    .map( bytes => new Bundle( bytes, "dna" ) );
    }

    happ () {
	if ( "webhapp" !== this.type )
	    throw new Error(`Wrong bundle type '${this.type}'; only 'webhapp' types contains a hApp`);

	const rpath			= this.manifest.happ_manifest.bundled;
	return new Bundle( this.resources[ rpath ], "happ" );
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

    toJSON () {
	return Object.assign( {}, this.source );
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

    toJSON () {
	return Object.assign( {}, this );
    }

}
set_tostringtag( Resources );


export default {
    Bundle
};
