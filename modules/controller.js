import { Byte } from './byte.js';

export class Controller {
  constructor(game, rule) {
    this.rule = rule;
    const arr = [];
    for (const code in this.rule)
      arr.push(this.rule[code]);
    this.key = new Byte(...arr);
    game.addEvent(this);
  }

  event() {
    window.onkeyup = window.onkeydown = e => {
      if (!this.key) return false;

      const code = e.code.toLowerCase().replace('key', '');
      if (code in this.rule)
        this.key[e.type == 'keydown' ? 'add' : 'clear'](this.rule[code]);

      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
}