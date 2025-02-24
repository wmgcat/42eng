use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn distance(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    (((y2 - y1).powi(2) + (x2 - x1).powi(2)).sqrt())
}

#[wasm_bindgen]
pub fn direction(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    (y2 - y1).atan2(x2 - x1)
}

#[wasm_bindgen]
pub fn sign(x: f64) -> f64 {
    if x > 0.0 {
        1.0
    } else if x < 0.0 {
        -1.0
    } else {
        0.0
    }
}

#[wasm_bindgen]
pub fn lerp(a: f64, b: f64, step: f64) -> f64 {
    a + step * (b - a)
}

#[wasm_bindgen]
pub fn clamp(x: f64, min: f64, max: f64) -> f64 {
    if x < min {
        min
    } else if x > max {
        max
    } else {
        x
    }
}

#[wasm_bindgen]
pub fn torad(x: f64) -> f64 {
    x * std::f64::consts::PI / 180.0
}

#[wasm_bindgen]
pub fn todeg(x: f64) -> f64 {
    x / std::f64::consts::PI * 180.0
}

#[wasm_bindgen]
pub fn collision_rect(px: f64, py: f64, x: f64, y: f64, w: f64, h: f64) -> bool {
    let height = if h == 0.0 { w } else { h };
    (px >= x && py >= y) && (px <= x + w && py <= y + height)
}

#[wasm_bindgen]
pub fn collision_circle(px: f64, py: f64, x: f64, y: f64, range: f64) -> bool {
    distance(px, py, x, y) <= range
}