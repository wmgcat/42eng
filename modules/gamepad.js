const memory = {};
let gamepads = [];

export function update(controller, custom={}, ucontroller=false) {
  
  if (navigator.getGamepads) gamepads = navigator.getGamepads();
  else if (navigator.webkitGetGamepads) gamepads = navigator.webkitGetGamepads();

  if (!gamepads) return;
  const current = gamepads[0];

  if (!current) return;
  for (const index of Object.keys(custom)) {
    if (!current.buttons[index].pressed) {
      if (ucontroller && memory[custom[index]] && memory[custom[index]][0] && memory[custom[index]][1] == index) {
        controller.key.clear(custom[index]);
        ucontroller.key.add(custom[index]);
        memory[custom[index]] = false;
      }
      continue;
    }
    controller.key.add(custom[index]);
    memory[custom[index]] = [true, index];
  }
}

export function check(controller, button, event) {
  if (!gamepads) return;
  const current = gamepads[0];

  if (!current) return;


  
  if (!current.buttons[button].pressed && memory[event] && memory[event][0] && memory[event][1] == button) {
    controller.key.clear(event);
    memory[event] = false
    return true;
  }
  if (current.buttons[button].pressed && !memory[event]) {
    memory[event] = [true, button];
    controller.key.add(event);
    return true;
  }
}