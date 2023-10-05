
export function set_tostringtag ( cls, name ) {
    Object.defineProperty( cls, "name", {
	value: name || cls.name,
    });
    Object.defineProperty( cls.prototype, Symbol.toStringTag, {
	value: name || cls.name,
	enumerable: false,
    });
}
