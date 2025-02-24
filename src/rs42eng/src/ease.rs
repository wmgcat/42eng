use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn in_sine(x: f64) -> f64 {
    1.0 - (x * std::f64::consts::PI * 0.5).cos()
}

#[wasm_bindgen]
pub fn out_sine(x: f64) -> f64 {
    (x * std::f64::consts::PI * 0.5).sin()
}

#[wasm_bindgen]
pub fn in_out_sine(x: f64) -> f64 {
    -(std::f64::consts::PI * x).cos() + 1.0 * 0.5
}

#[wasm_bindgen]
pub fn in_quad(x: f64) -> f64 {
    x * x
}

#[wasm_bindgen]
pub fn out_quad(x: f64) -> f64 {
    1.0 - (1.0 - x) * (1.0 - x)
}

#[wasm_bindgen]
pub fn in_out_quad(x: f64) -> f64 {
    if x < 0.5 {
        2.0 * x * x
    } else {
        1.0 - ((-2.0 * x + 2.0).powi(2)) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_cubic(x: f64) -> f64 {
    x * x * x
}

#[wasm_bindgen]
pub fn out_cubic(x: f64) -> f64 {
    1.0 - (1.0 - x).powi(3)
}

#[wasm_bindgen]
pub fn in_out_cubic(x: f64) -> f64 {
    if x < 0.5 {
        4.0 * x * x * x
    } else {
        1.0 - ((-2.0 * x + 2.0).powi(3)) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_quart(x: f64) -> f64 {
    x * x * x * x
}

#[wasm_bindgen]
pub fn out_quart(x: f64) -> f64 {
    1.0 - (1.0 - x).powi(4)
}

#[wasm_bindgen]
pub fn in_out_quart(x: f64) -> f64 {
    if x < 0.5 {
        8.0 * x * x * x * x
    } else {
        1.0 - ((-2.0 * x + 2.0).powi(4)) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_quint(x: f64) -> f64 {
    x * x * x * x * x
}

#[wasm_bindgen]
pub fn out_quint(x: f64) -> f64 {
    1.0 - (1.0 - x).powi(5)
}

#[wasm_bindgen]
pub fn in_out_quint(x: f64) -> f64 {
    if x < 0.5 {
        16.0 * x * x * x * x * x
    } else {
        1.0 - ((-2.0 * x + 2.0).powi(5)) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_expo(x: f64) -> f64 {
    if x == 0.0 {
        0.0
    } else {
        2_f64.powf(10.0 * x - 10.0)
    }
}

#[wasm_bindgen]
pub fn out_expo(x: f64) -> f64 {
    if x == 1.0 {
        1.0
    } else {
        1.0 - 2_f64.powf(-10.0 * x)
    }
}

#[wasm_bindgen]
pub fn in_out_expo(x: f64) -> f64 {
    if x == 0.0 {
        0.0
    } else if x == 1.0 {
        1.0
    } else if x < 0.5 {
        2_f64.powf(20.0 * x - 10.0) * 0.5
    } else {
        (2.0 - 2_f64.powf(-20.0 * x + 10.0)) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_circ(x: f64) -> f64 {
    1.0 - (1.0 - x * x).sqrt()
}

#[wasm_bindgen]
pub fn out_circ(x: f64) -> f64 {
    (1.0 - (x - 1.0).powi(2)).sqrt()
}

#[wasm_bindgen]
pub fn in_out_circ(x: f64) -> f64 {
    if x < 0.5 {
        (1.0 - (1.0 - (2.0 * x).powi(2)).sqrt()) * 0.5
    } else {
        ((1.0 - (-2.0 * x + 2.0).powi(2)).sqrt() + 1.0) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_back(x: f64) -> f64 {
    let c1 = 1.70158;
    let c2 = c1 + 1.0;
    c2 * x * x * x - c1 * x * x
}

#[wasm_bindgen]
pub fn out_back(x: f64) -> f64 {
    let c1 = 1.70158;
    let c2 = c1 + 1.0;
    1.0 + c2 * (x - 1.0).powi(3) + c1 * (x - 1.0).powi(2)
}

#[wasm_bindgen]
pub fn in_out_back(x: f64) -> f64 {
    let c1 = 1.70158;
    let c2 = 2.5949095;
    if x < 0.5 {
        (2.0 * x).powi(2) * ((c2 + 1.0) * 2.0 * x - c2) * 0.5
    } else {
        ((2.0 * x - 2.0).powi(2) * ((c2 + 1.0) * (2.0 * x - 2.0) + c2) + 2.0) * 0.5
    }
}

#[wasm_bindgen]
pub fn in_elastic(x: f64) -> f64 {
    if x == 0.0 {
        0.0
    } else if x == 1.0 {
        1.0
    } else {
        -(2_f64.powf(10.0 * x - 10.0)) * (x * 10.0 - 10.75).sin() * ((2.0 * std::f64::consts::PI) / 3.0)
    }
}

#[wasm_bindgen]
pub fn out_elastic(x: f64) -> f64 {
    if x == 0.0 {
        0.0
    } else if x == 1.0 {
        1.0
    } else {
        2_f64.powf(-10.0 * x) * (x * 10.0 - 0.75).sin() * ((2.0 * std::f64::consts::PI) / 3.0) + 1.0
    }
}

#[wasm_bindgen]
pub fn in_out_elastic(x: f64) -> f64 {
    if x == 0.0 {
        0.0
    } else if x == 1.0 {
        1.0
    } else {
        let c1 = (2.0 * std::f64::consts::PI) / 4.5;
        if x < 0.5 {
            -(2_f64.powf(20.0 * x - 10.0)) * (20.0 * x - 11.125).sin() * c1 * 0.5
        } else {
            (2_f64.powf(-20.0 * x + 10.0)) * (20.0 * x - 11.125).sin() * c1 * 0.5 + 1.0
        }
    }
}

#[wasm_bindgen]
pub fn in_bounce(x: f64) -> f64 {
    1.0 - out_bounce(1.0 - x)
}

#[wasm_bindgen]
pub fn out_bounce(x: f64) -> f64 {
    let n1 = 7.5625;
    let d1 = 2.75;

    if x < 1.0 / d1 {
        n1 * x * x
    } else if x < 2.0 / d1 {
        n1 * (x - 1.5 / d1).powi(2) + 0.75
    } else if x < 2.5 / d1 {
        n1 * (x - 2.25 / d1).powi(2) + 0.9375
    } else {
        n1 * (x - 2.625 / d1).powi(2) + 0.984375
    }
}

#[wasm_bindgen]
pub fn in_out_bounce(x: f64) -> f64 {
    if x < 0.5 {
        (1.0 - out_bounce(1.0 - 2.0 * x)) * 0.5
    } else {
        (1.0 + out_bounce(2.0 * x - 1.0)) * 0.5
    }
}