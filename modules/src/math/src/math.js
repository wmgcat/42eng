import WASM from '../../wasm.js';
const clWASM = new WASM(require('./wasm/math.wasm'));

export default {
    distance: clWASM.wasm.distance,
    direction: clWASM.wasm.direction,
    sign: clWASM.wasm.sign,
    lerp: clWASM.wasm.lerp,
    clamp: clWASM.wasm.clamp,
    torad: clWASM.wasm.torad,
    todeg: clWASM.wasm.todeg,
    collision: {
        rect: clWASM.wasm.collision_rect,
        circle: clWASM.wasm.collision_circle
    }
}
