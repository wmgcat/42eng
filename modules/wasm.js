const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );
if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;
let cachedDataViewMemory0 = null;
export function isLikeNone(x) {
    return x === undefined || x === null;
}
const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );


const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});


class WASM {
    constructor(wasm64, _imports) {
        const strBinary = atob(wasm64.replace(`data:application/wasm;base64,`, ``)),
              bytes = new Uint8Array(strBinary.length);
        for (let i = 0; i < strBinary.length; i++)
            bytes[i] = strBinary.charCodeAt(i);
        this.wasm = new WebAssembly.Module(bytes.buffer);
        const instance = new WebAssembly.Instance(this.wasm, _imports == undefined ? this.__wbg_get_imports() : _imports(this));
        this.__wbg_finalize_init(instance);
        this.WASM_VECTOR_LEN = 0;
    }

    __wbg_get_imports() {
        const imports = {}

        imports.wbg = {};
        imports.wbg.__wbindgen_init_externref_table = () => {
            const table = this.wasm.__wbindgen_export_0;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
            ;
        };
        imports.wbg.__wbindgen_throw = (arg0, arg1) => {
            throw new Error(this.getStringFromWasm0(arg0, arg1));
        };
        
        return imports;
    }

    getUint8ArrayMemory0() {
        if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
            cachedUint8ArrayMemory0 = new Uint8Array(this.wasm.memory.buffer);
        }
        return cachedUint8ArrayMemory0;
    }
    getStringFromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return cachedTextDecoder.decode(this.getUint8ArrayMemory0().subarray(ptr, ptr + len));
    }

    addToExternrefTable0(obj) {
        const idx = this.wasm.__externref_table_alloc();
        this.wasm.__wbindgen_export_2.set(idx, obj);

        return idx;
    }

    passStringToWasm0(arg, malloc, realloc) {
        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length, 1) >>> 0;
            this.getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
            this.WASM_VECTOR_LEN = buf.length;
            return ptr;
        }

        let len = arg.length;
        let ptr = malloc(len, 1) >>> 0;

        const mem = this.getUint8ArrayMemory0();

        let offset = 0;

        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F) break;
            mem[ptr + offset] = code;
        }

        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
            const view = this.getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);

            offset += ret.written;
            ptr = realloc(ptr, len, offset, 1) >>> 0;
        }

        this.WASM_VECTOR_LEN = offset;
        return ptr;
    }

    getDataViewMemory0() {
        if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== this.wasm.memory.buffer)) {
            cachedDataViewMemory0 = new DataView(this.wasm.memory.buffer);
        }
        return cachedDataViewMemory0;
    }

    takeFromExternrefTable0(idx) {
        const value = this.wasm.__wbindgen_export_2.get(idx);
        this.wasm.__externref_table_dealloc(idx);
        return value;
    }

    handleError(f, args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            const idx = this.addToExternrefTable0(e);
            this.wasm.__wbindgen_exn_store(idx);
        }
    }

    __wbg_finalize_init(instance) {
        this.wasm = instance.exports;
        this.wasm.__wbindgen_start();
    }
}

export default WASM;