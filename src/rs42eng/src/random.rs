use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Random {
    seed: f64,
}

#[wasm_bindgen]
impl Random {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: Option<f64>) -> Random {
        let initial_seed = seed.unwrap_or_else(|| js_sys::Date::now());
        Random { seed: initial_seed }
    }

    #[wasm_bindgen(js_name = setSeed)]
    pub fn set_seed(&mut self, seed: JsValue) {
        let new_seed = if seed.is_string() {
            let seed_str = seed.as_string().unwrap();
            let mut numeric_seed: f64 = 0.0;
            for c in seed_str.chars() {
                numeric_seed += c as u32 as f64;
            }
            numeric_seed % 32000.0
        } else {
            seed.as_f64().unwrap_or(0.0)
        };
        self.seed = new_seed;
    }

    #[wasm_bindgen(js_name = rand)]
    pub fn rand(&mut self) -> f64 {
        let sin_value = (self.seed.sin() * 1000.0).fract();
        self.seed += 1.0;
        sin_value.abs()
    }
}