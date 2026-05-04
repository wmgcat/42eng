import WASM, { isLikeNone } from "./wasm";
import wasmByte from "./wasm/byte.wasm";

const clWASM = new WASM(wasmByte, (oWasm) => ({
  wbg: {
    __wbg_buffer_609cc3eee51ed158: function(arg0) {
        const ret = arg0.buffer;
        return ret;
    },
    __wbg_call_672a4d21634d4a24: function() { return oWasm.handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) },
    __wbg_done_769e5ede4b31c67b: function(arg0) {
        const ret = arg0.done;
        return arg0.done;
    },
    __wbg_get_67b2ba62fc30de12: function() { return oWasm.handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) },
    __wbg_instanceof_ArrayBuffer_e14585432e3737fc: function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    },
    __wbg_instanceof_Uint8Array_17156bcf118086a9: function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    },
    __wbg_isArray_a1eab7e0d067391b: function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    },
    __wbg_iterator_9a24c88df860dc65: function() {
        const ret = Symbol.iterator;
        return ret;
    },
    __wbg_length_a446193dc22c12f8: function(arg0) {
        const ret = arg0.length;
        return ret;
    },
    __wbg_new_a12002a7f91c75be: function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    },
    __wbg_new_c68d7209be747379: function(arg0, arg1) {
        const ret = new Error(oWasm.getStringFromWasm0(arg0, arg1));
        return ret;
    },
    __wbg_next_25feadfc0913fea9: function(arg0) {
        const ret = arg0.next;
        return ret;
    },
    __wbg_next_6574e1a8a62d1055: function() { return oWasm.handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) },
    __wbg_set_65595bdd868b3009: function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    },
    __wbg_value_cd1ffa7b1ab794f1: function(arg0) {
        const ret = arg0.value;
        return ret;
    },
    __wbg_values_99f7a68c7f313d66: function(arg0) {
        const ret = arg0.values();
        return ret;
    },
    __wbindgen_boolean_get: function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    },
    __wbindgen_debug_string: function(arg0, arg1) {},
    __wbindgen_init_externref_table: function() {
        const table = oWasm.wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    },
    __wbindgen_is_function: function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    },
    __wbindgen_is_null: function(arg0) {
        const ret = arg0 === null;
        return ret;
    },
    __wbindgen_is_object: function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    },
    __wbindgen_is_undefined: function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    },
    __wbindgen_memory: function() {
        const ret = oWasm.wasm.memory;
        return ret;
    },
    __wbindgen_number_get: function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        oWasm.getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        oWasm.getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbindgen_string_get: function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : oWasm.passStringToWasm0(ret, oWasm.wasm.__wbindgen_malloc, oWasm.wasm.__wbindgen_realloc);
        var len1 = oWasm.WASM_VECTOR_LEN;
        oWasm.getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        oWasm.getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbindgen_string_new: function(arg0, arg1) {
        const ret = oWasm.getStringFromWasm0(arg0, arg1);
        return ret;
    },
    __wbindgen_throw: function(arg0, arg1) {
        throw new Error(oWasm.getStringFromWasm0(arg0, arg1));
    }
  }
}), (instance) => {
    instance.exports.__wbindgen_start();
    return instance.exports;
});

const ByteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => clWASM.wasm.__wbg_byte_free(ptr >>> 0, 1));

class Byte {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ByteFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        clWASM.wasm.__wbg_byte_free(ptr, 0);
    }

    constructor(...keys) {
        const ret = clWASM.wasm.byte_new(keys);
        if (ret[2]) {
            console.log(ret, keys);
            throw clWASM.takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        ByteFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    add(...keys) {
        const ret = clWASM.wasm.byte_add(this.__wbg_ptr, keys);
        if (ret[1]) {

            throw clWASM.takeFromExternrefTable0(ret[0]);
        }
    }
    clear(...keys) {
        const ret = clWASM.wasm.byte_clear(this.__wbg_ptr, keys);
        if (ret[1]) {
            throw clWASM.takeFromExternrefTable0(ret[0]);
        }
    }
    check(...keys) {
        const ret = clWASM.wasm.byte_check(this.__wbg_ptr, keys);
        if (ret[2]) {
            throw clWASM.takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    addKey(...keys) {
        const ret = clWASM.wasm.byte_addKey(this.__wbg_ptr, keys);
        if (ret[1]) {
            throw clWASM.takeFromExternrefTable0(ret[0]);
        }
    }
    get key() {
        const ret = clWASM.wasm.byte_key(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
}

export default Byte;