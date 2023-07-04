/**
 * @file Модуль аудио
 * @author wmgcat
 * @version 1.1
*/

const audio = new Module('audio', '1.1');

audio.stack = {};
audio.listener = [];
audio.volumes = {};

if (!cfg) cfg = {}; 

cfg.setting = { // настройки звуков и музыки:
  mute: false, // отключение всех звуков и музыки в игре
  focus: false, // фокус окна (музыка играет только при фокусе)
  listener: 10 // максимальное кол-во
}



const windowAudioContext = window.AudioContext || window.webkitAudioContext || false;
audio.context = windowAudioContext ? (new windowAudioContext) : false;

// отключение методов навигатора:
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => { });
  navigator.mediaSession.setActionHandler('pause', () => { });
  navigator.mediaSession.setActionHandler('seekbackward', () => { });
  navigator.mediaSession.setActionHandler('seekforward', () => { });
  navigator.mediaSession.setActionHandler('previoustrack', () => { });
  navigator.mediaSession.setActionHandler('nexttrack', () => { });
}

// перезагрузка аудио при переключении вкладок:
if (audio.context)
  audio.context.onstatechange = () => {
    if (audio.context.state != 'interrupted') return;
    audio.context.resume();
  }

/**
 * Проигрывает звук/музыку
 * 
 * @param  {string} id Аудио
 * @param  {bool} [loop=false] Зацикливание
*/
audio.play = function(id, loop=false) {
  if (!this.context || cfg.setting.mute || !cfg.setting.focus || !this.stack[id]) return;

  this.stack[id].play(loop);
}

/**
 * Изменяет громкость дорожки, если ее нет - создает новую
 * 
 * @param  {string} id Название дорожки
 * @param  {number} [value=1] Громкость (0..1)
*/
audio.volume = function(id, value=1) {
  if (!this.context) return;

  if (!(id in this.volumes)) this.volumes[id] = this.context.createGain();
  this.volumes[id].gain.value = value;
}

/**
 * Останавливает проигрывание звука/музыки
 * 
 * @param  {string} id Аудио
*/
audio.stop = function(id) {
  if (!this.stack[id] || !this.context) return;

  this.stack[id].stop();
}

/**
 * Класс звука
 * @constructor
*/
class Sound {
  /**
   * @param  {object} buffer Аудио буффер
   * @param  {string} track Звуковая дорожка
  */
  constructor(buffer, track) {
    this.buffer = buffer;
    this.track = track;
    this.index = -1;
  }

  /**
   * Проигрывание звука/музыки
   * 
   * @param  {bool} loop Зацикливание
  */
  play(loop) {
    if (audio.listener.length > cfg.setting.listener) return;

    audio.listener.push(audio.context.createBufferSource());
    
    this.index = audio.listener[audio.listener.length - 1];
    this.index.buffer = this.buffer;
    this.index.connect(audio.volumes[this.track]).connect(audio.context.destination);
    if (this.index.start) this.index.start(audio.context.currentTime);

    this.index.onended = () => this.stop();
    this.index.loop = loop;
  }

  /**
   * Останавливает звук
  */
  stop() {
    if (this.index == -1) return;

    if (this.index.stop) this.index.stop();
    const index = audio.listener.indexOf(this.index);
    if (~index)
      audio.listener = audio.listener.splice(index, 1);
    this.index = -1;
  }
}

/**
 * Добавление звуков и установка их дорожки
 * 
 * @param  {object} obj Объект с путями к файлам, тип-дорожки: путь к файлу
*/
Add.audio = function(obj) {
  for (const [path, type] of Object.entries(obj)) {
    mloaded++;
    const req = new XMLHttpRequest();
    req.open('GET', path, true);
    req.responseType = 'arraybuffer';
    req.onload = () => {
      audio.context.decodeAudioData(req.response, buffer => {
        loaded++;
        if (!audio.stack) return;

        let npath = path.split('/');
        if (npath[0] == '.') npath = npath.splice(1, npath.length - 1);
        if (npath[0] == cfg.datapath) npath = npath.splice(1, npath.length - 1);
        for (const ext of ['.wav', '.ogg', '.mp3'])
          npath[npath.length - 1] = npath[npath.length - 1].replace(ext, '');

        npath = npath.join('.');
        audio.stack[npath] = new Sound(buffer, type);
      });
    }
    req.onerror = () => { loaded++; }
    req.send();
  }
}

/**
 * Фокусирование и изменение громкости при фокусе
 * 
 * @param  {bool} value Значение фокуса
*/
Eng.focus = value => {
  cfg.setting.focus = value;

  for (const volume of Object.keys(audio.volumes)) {
    if (!value) audio.volumes[volume].save = audio.volumes[volume].gain.value;
    audio.volume(volume, value ? (audio.volumes[volume].save || 1) : 0);
  }
  window[value ? 'focus' : 'blur']();
}

// событие фокуса и блюра:
window.onblur = Eng.focus(false);
window.onfocus = () => audio.context.suspend().then(() => Eng.focus(true));