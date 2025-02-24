const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );
if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;
export function isLikeNone(x) {
    return x === undefined || x === null;
}


class WASM {
    constructor(wasm64, _imports) {
        const strBinary = atob(wasm64.replace(`data:application/wasm;base64,`, ``)),
              bytes = new Uint8Array(strBinary.length);
        for (let i = 0; i < strBinary.length; i++)
            bytes[i] = strBinary.charCodeAt(i);
        this.wasm = new WebAssembly.Module(bytes.buffer);
        const instance = new WebAssembly.Instance(this.wasm, _imports == undefined ? this.__wbg_get_imports() : _imports(this));
        this.__wbg_finalize_init(instance);
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