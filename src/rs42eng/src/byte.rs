use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Default)]
pub struct Byte {
    keys: HashMap<String, u64>,
    key: u64,
}

#[wasm_bindgen]
impl Byte {
    #[wasm_bindgen(constructor)]
    pub fn new(keys: JsValue) -> Result<Byte, JsValue> {
        let keys_array: Vec<String> = serde_wasm_bindgen::from_value(keys)?;

        let mut byte = Byte {
            keys: HashMap::new(),
            key: 0,
        };

        for (offset, key) in keys_array.iter().enumerate() {
            byte.keys.insert(key.clone(), 1 << offset);
        }

        Ok(byte)
    }

    #[wasm_bindgen(js_name = add)]
    pub fn add(&mut self, keys: JsValue) -> Result<(), JsValue> {
        let keys_array: Vec<String> = serde_wasm_bindgen::from_value(keys)?;

        for key in keys_array {
            if let Some(value) = self.keys.get(&key) {
                self.key |= value;
            } else {
                return Err(JsValue::from(format!("Key '{}' not found", key)));
            }
        }

        Ok(())
    }

    #[wasm_bindgen(js_name = clear)]
    pub fn clear(&mut self, keys: JsValue) -> Result<(), JsValue> {
        let keys_array: Vec<String> = serde_wasm_bindgen::from_value(keys)?;

        if keys_array.is_empty() {
            self.key = 0; // Сбросить всё значение
            return Ok(());
        }

        for key in keys_array {
            if let Some(value) = self.keys.get(&key) {
                self.key &= !value;
            } else {
                return Err(JsValue::from(format!("Key '{}' not found", key)));
            }
        }

        Ok(())
    }

    #[wasm_bindgen(js_name = check)]
    pub fn check(&self, keys: JsValue) -> Result<bool, JsValue> {
        let keys_array: Vec<String> = serde_wasm_bindgen::from_value(keys)?;

        for key in keys_array {
            if let Some(value) = self.keys.get(&key) {
                if (self.key & value) == 0 {
                    return Ok(false);
                }
            } else {
                return Err(JsValue::from(format!("Key '{}' not found", key)));
            }
        }

        Ok(true)
    }

    #[wasm_bindgen(js_name = addKey)]
    pub fn add_key(&mut self, keys: JsValue) -> Result<(), JsValue> {
        let keys_array: Vec<String> = serde_wasm_bindgen::from_value(keys)?;

        let offset = self.keys.len();
        for (i, key) in keys_array.iter().enumerate() {
            self.keys.insert(key.clone(), 1 << (offset + i));
        }

        Ok(())
    }

    #[wasm_bindgen(getter)]
    pub fn key(&self) -> u64 {
        self.key
    }
}