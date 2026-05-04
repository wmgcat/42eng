import WASM, { isLikeNone } from "./wasm";
import wasmTimer from "./wasm/timer.wasm";

const clWASM = new WASM(wasmTimer, (oWasm) => ({
  wbg: {
    __wbg_call_672a4d21634d4a24: () => (oWasm.handleError((arg0, arg1) => arg0.call(arg1), arguments)),
    __wbg_instanceof_Window_def73ea0955fc569: arg0 => (arg0 instanceof Window),
    __wbg_newnoargs_105ed471475aaf50: (arg0, arg1) => new Function(oWasm.getStringFromWasm0(arg0, arg1)),
    __wbg_now_807e54c39636c349: () => performance.now(),
    __wbindgen_is_undefined: arg0 => arg0 == undefined,
    __wbg_static_accessor_GLOBAL_88a902d13a557d07: () => {
      const ret = typeof global === 'undefined' ? null : global;
      return isLikeNone(ret) ? 0 : oWasm.addToExternrefTable0(ret);
    },
    __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: () => {
      const ret = typeof globalThis === 'undefined' ? null : globalThis;
      return isLikeNone(ret) ? 0 : oWasm.addToExternrefTable0(ret);
    },
    __wbg_static_accessor_SELF_37c5d418e4bf5819: () => {
      const ret = typeof self === 'undefined' ? null : self;
      return isLikeNone(ret) ? 0 : oWasm.addToExternrefTable0(ret);
    },
    __wbg_static_accessor_WINDOW_5de37043a91a9c40: () => {
      const ret = typeof window === 'undefined' ? null : window;
      return isLikeNone(ret) ? 0 : oWasm.addToExternrefTable0(ret);
    },
    __wbindgen_throw: (arg0, arg1) => {
      throw new Error(oWasm.getStringFromWasm0(arg0, arg1))
    },
    __wbindgen_init_externref_table: () => {
      const table = oWasm.wasm.__wbindgen_export_2,
            offset = table.grow(4);
      table.set(0, undefined);
      table.set(offset + 0, undefined);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    }
  }
}), (instance) => {
    instance.exports.__wbindgen_start();
    return instance.exports;
});

const TimerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => clWASM.wasm.__wbg_timer_free(ptr >>> 0, 1));

class Timer {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TimerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        clWASM.wasm.__wbg_timer_free(ptr, 0);
    }
    constructor(x, multi=1000) {
        const ret = clWASM.wasm.timer_new(x, !isLikeNone(multi), isLikeNone(multi) ? 0 : multi);
        this.__wbg_ptr = ret >>> 0;
        TimerFinalization.register(this, this.__wbg_ptr, this);
    }
    get max() { return clWASM.wasm.timer_max(this.__wbg_ptr); }
    set max(x) { clWASM.wasm.timer_set_max(this.__wbg_ptr, x); }
    check(loop_mode) { return clWASM.wasm.timer_check(this.__wbg_ptr, loop_mode) != 0; }
    delta() { return clWASM.wasm.timer_delta(this.__wbg_ptr); }
    count() { return (clWASM.wasm.timer_count(this.__wbg_ptr) >>> 0); }
    fcount() { return clWASM.wasm.timer_fcount(this.__wbg_ptr); }
    reset(x) { clWASM.wasm.timer_reset(this.__wbg_ptr, !isLikeNone(x), isLikeNone(x) ? 0 : x); }
    pause() { clWASM.wasm.timer_pause(this.__wbg_ptr); }
    resume() { clWASM.wasm.timer_resume(this.__wbg_ptr); }
}

export default Timer;