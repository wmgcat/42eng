import WASM from "../wasm";
import wasmMath from "./wasm/math.wasm";
const clWASM = new WASM(wasmMath);

let is_init = false;
export function init() {
    if (is_init) return;
    Math.distance = clWASM.wasm.distance;
    Math.direction = clWASM.wasm.direction;
    Math.sign = clWASM.wasm.sign;
    Math.lerp = clWASM.wasm.lerp;
    Math.clamp = clWASM.wasm.clamp;
    Math.torad = clWASM.wasm.torad;
    Math.todeg = clWASM.wasm.todeg;
    Math.collision = {
        rect: clWASM.wasm.collision_rect,
        circle: clWASM.wasm.collision_circle
    }
    is_init = true;
}