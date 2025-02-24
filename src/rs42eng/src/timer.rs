use wasm_bindgen::prelude::*;
use web_sys;

#[wasm_bindgen]
pub fn get_time() -> f64 {
    let window = web_sys::window().expect("no global `window` exists");
    js_sys::Date::now()
}

#[wasm_bindgen]
pub struct Timer {
    point: f64,
    max: f64,
    save_max: f64,
    is_pause: bool,
    multi: f64,
    save_point: f64,
}

#[wasm_bindgen]
impl Timer {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, multi: Option<f64>) -> Timer {
        let multi = multi.unwrap_or(1000.0);
        if multi <= 0.0 {
            panic!("Multiplier must be positive");
        }
        let max = x * multi;
        let now = get_time();
        Timer {
            point: now + max,
            max,
            save_max: x,
            is_pause: false,
            multi,
            save_point: 0.0,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> f64 {
        self.save_max
    }

    #[wasm_bindgen(setter)]
    pub fn set_max(&mut self, x: f64) {
        self.max = x * self.multi;
    }

    #[wasm_bindgen]
    pub fn check(&mut self, loop_mode: bool) -> bool {
        if self.is_pause {
            return false
        }
        let now = get_time();
        if (self.point - now) > 0.0 {
            return false;
        }
        if loop_mode {
            self.reset(None);
        }
        true
    }

    #[wasm_bindgen]
    pub fn delta(&self) -> f64 {
        if self.is_pause {
            return (self.save_point / self.max).min(1.0).max(0.0);
        }
        let now = get_time();
        let remaining = (self.point - now).max(0.0);
        (remaining / self.max).min(1.0).max(0.0)
    }

    #[wasm_bindgen]
    pub fn count(&self) -> u32 {
        let now = get_time();
        ((now - self.point).abs() / self.max) as u32
    }

    #[wasm_bindgen]
    pub fn fcount(&self) -> f64 {
        let now = get_time();
        (now - self.point).abs() / self.max
    }

    #[wasm_bindgen]
    pub fn reset(&mut self, x: Option<f64>) {
        let value = x.unwrap_or(self.save_max);
        let now = get_time();
        self.point = now + value * self.max;
        self.save_point = 0.0;
    }

    #[wasm_bindgen]
    pub fn pause(&mut self) {
        if !self.is_pause {
            let now = get_time();
            self.save_point = (self.point - now);
            self.is_pause = true;
        }
    }

    #[wasm_bindgen]
    pub fn resume(&mut self) {
        if self.is_pause {
            let now = get_time();
            self.point = now + self.save_point;
            self.is_pause = false;
            self.save_point = 0.0;
        }
    }
}