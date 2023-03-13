cfg.setting = {
  music: 1, sounds: 1,
  mute: false, user: false,
  focus: true, listener: 10
};

let audiocontext = window.AudioContext || window.webkitAudioContext || false;
modules.audio = {
  title: 'audio', v: '1.0', stack: {}, listener: [],
  context: audiocontext ? new audiocontext : false,
  play: (id, loop) => {
    if (!cfg.setting.mute && modules.audio.context && modules.audio.stack && modules.audio.stack[id]) modules.audio.stack[id].play(loop);
  },
  volume: (type, value) => {
    if (modules.audio.context) {
      if (!modules.audio[type + '_volume']) modules.audio[type + '_volume'] = modules.audio.context.createGain();
      modules.audio[type + '_volume'].gain.value = value;
    }
  },
  stop: id => {
    if (modules.audio.stack && modules.audio.stack[id]) modules.audio.stack[id].stop();
  }
}
if (modules.audio.context) modules.audio.context.onstatechange = () => {
  if (modules.audio.context.state === "interrupted") modules.audio.context.resume();
}

Add.audio = function(type='sounds', source) {
  if (Object.keys(arguments).length > 1) {
    mloaded++;
    let path = source.split('/');
    if (path[0] == '.') path = path.splice(1, path.length - 1);
    ['.wav', '.ogg', '.mp3'].forEach(assoc => { path[path.length - 1] = path[path.length - 1].replace(assoc, ''); });
    let req = new XMLHttpRequest();
    req.open('GET', source, true);
    req.responseType = 'arraybuffer';
    req.onload = () => {
      let sa = req.response;
      modules.audio.context.decodeAudioData(req.response, buff => {
        loaded++;
        if (modules.audio.stack) modules.audio.stack[path.join('.')] = new Sound(buff, type);
      });
    }
    req.onerror = () => { loaded++; }
    req.send();
  } else {
    if (typeof(type) == 'object') {
      Object.keys(type).forEach(key => Add.audio(type[key], key));
    } else Add.error('type audio not find!');
  }
}
Eng.focus = value => {
  switch(value) {
    case true:
      cfg.setting.focus = true;
      if (!cfg.setting.mute) {
        audio.volume('music', cfg.setting.music);
        audio.volume('sounds', cfg.setting.sounds);
      }
      window.focus();
    break;
    case false:
      cfg.setting.focus = false;
      audio.volume('music', 0);
      audio.volume('sounds', 0);
      window.blur();
    break;
  }
}

window.onblur = () => {
  cfg.setting.focus = false;
  modules.audio.volume('music', 0);
  modules.audio.volume('sounds', 0);
}
window.onfocus = () => { modules.audio.context.suspend().then(() => {
  cfg.setting.focus = true;
  if (!cfg.setting.mute) {
    audio.volume('music', cfg.setting.music);
    audio.volume('sounds', cfg.setting.sounds);
  }
}); }

class Sound {
	constructor(sa, type) {
		this.audio = sa, this.type = type, this.index = -1;
	}
	play(loop) {
		if (modules.audio.context && cfg.setting.user) {
			if (!cfg.setting.mute) {
        if (modules.audio.listener.length <= cfg.setting.listener) {
          modules.audio.listener.push(modules.audio.context.createBufferSource());
          this.index = modules.audio.listener[modules.audio.listener.length - 1];
          this.index.buffer = this.audio;
          this.index.connect(modules.audio[this.type + '_volume']).connect(modules.audio.context.destination);
          if (this.index.start) this.index.start(modules.audio.context.currentTime);
          this.index.onended = () => { this.stop(); }
          this.index.loop = loop;
        }
      } else {
        //if (this.index.loop) this.stop();
      }
		}
	}
	stop() { 
		if (modules.audio.context && this.index != -1) {
			if (this.index.stop) this.index.stop();
			let ind = modules.audio.listener.findIndex(e => { return e == this.index; });
			if (ind != -1) modules.audio.listener = modules.audio.listener.splice(ind, 1);
			this.index = -1;
		}
	}
}
