import WASM from "../wasm";
import wasmMath from "./wasm/math.wasm";
const clWASM = new WASM(wasmMath);

const RandomFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => clWASM.wasm.__wbg_random_free(ptr >>> 0, 1));

export class random {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RandomFinalization.unregister(this);
        return ptr;
    }

    free() { clWASM.wasm.__wbg_random_free(this.__destroy_into_raw(), 0); }
    constructor(seed) {
        const ret = clWASM.wasm.random_new(!isLikeNone(seed), isLikeNone(seed) ? 0 : seed);
        this.__wbg_ptr = ret >>> 0;
        RandomFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    setSeed(seed) { clWASM.wasm.random_setSeed(this.__wbg_ptr, seed); }
    rand() { return clWASM.wasm.random_rand(this.__wbg_ptr); }
}