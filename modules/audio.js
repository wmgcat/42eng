/**
 * @file Модуль аудио
 * @author wmgcat
 * @version 1.1
*/

export const audio = {}

audio.stack = {};
audio.listener = [];
audio.volumes = {};


const MAX_LISTENER = 25;

export function echo(context, delayTime = 0.5, feedback = 0.5, wetLevel = 0.5) {
  const delayNode = context.createDelay();
  const gainNode = context.createGain();

  delayNode.delayTime.value = delayTime; // Время задержки (секунды)
  gainNode.gain.value = wetLevel; // Уровень смешивания

  delayNode.connect(gainNode);
  gainNode.connect(context.destination);

  // Создаем цикл обратной связи
  delayNode.connect(gainNode);
  gainNode.connect(delayNode);
  gainNode.gain.value = feedback;

  return delayNode; // Возвращаем узел эффекта
}
/**
 * Создает эффект реверберации
 * @param {AudioContext} context - Аудиоконтекст
 * @param {number} decayTime - Время затухания (секунды)
 * @param {number} density - Плотность реверберации (0..1)
 * @returns {ConvolverNode|BiquadFilterNode} - Узел реверберации
 */
export function reverb(context, decayTime = 5, density = 0.8) {
  if (!context.createConvolver) {
    // Если ConvolverNode недоступен, используем BiquadFilterNode для имитации
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = density * 10; // Настройка плотности через Q-фактор
    filter.frequency.value = 2000; // Ограничиваем высокие частоты
    return filter;
  }

  // Создаем реверберацию с использованием ConvolverNode
  const reverb = context.createConvolver();

  // Генерируем импульсный отклик для реверберации
  const impulseResponseLength = decayTime * context.sampleRate;
  const impulseResponse = context.createBuffer(2, impulseResponseLength, context.sampleRate);
  const dataL = impulseResponse.getChannelData(0);
  const dataR = impulseResponse.getChannelData(1);

  for (let i = 0; i < impulseResponseLength; i++) {
    const value = Math.pow(Math.random() * 2 - 1, 5) * Math.exp(-i / (decayTime * context.sampleRate));
    dataL[i] = value;
    dataR[i] = value * (Math.random() * 0.5 + 0.5); // Немного отличаем левый и правый каналы
  }

  reverb.buffer = impulseResponse;
  return reverb;
};


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
if (audio.context) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audio.context.state == 'suspended')
      audio.context.resume();
  });
  audio.context.onstatechange = () => {
    if (audio.context.state == 'interrupted' || audio.context.state == 'suspended')
      audio.context.resume();
  }
}

/**
 * Проигрывает звук/музыку
 * 
 * @param  {string} id Аудио
 * @param  {bool} [loop=false] Зацикливание
*/
audio.play = function(id, loop=false, track=false) {
  if (!this.context || !this.stack[id]) return;
  
  this.stack[id].play(loop, track);
}

audio.synth = function(frequency, duration, type = 'sine', volume = 0.5, effect = null) {
  if (!audio.context) return;

  const synth = new Synth(audio.context);
  synth.start(frequency, type, effect); // Передаем эффект
  synth.setVolume(volume);

  setTimeout(() => {
    synth.stop();
  }, duration * 1000); // Продолжительность в секундах
};

/**
 * Изменяет громкость дорожки, если ее нет - создает новую
 * 
 * @param  {string} id Название дорожки
 * @param  {number} [value=1] Громкость (0..1)
*/
audio.volume = function(id, value=1) {
  if (!this.context) return;

  if (!(id in this.volumes)) {
    this.volumes[id] = this.context.createGain();
    this.volumes[id].save = value;
  }
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
  play(loop, volume=false) {
    if (audio.listener.length > MAX_LISTENER) return;

    audio.listener.push(audio.context.createBufferSource());
    
    this.index = audio.listener[audio.listener.length - 1];
    this.index.buffer = this.buffer;
    this.index.connect(audio.volumes[volume || this.track]).connect(audio.context.destination);
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
    
    let index = audio.listener.indexOf(this.index);
    if (~index)
      audio.listener = audio.listener.splice(index, 1);
    this.index = -1;
  }
}

export class Synth {
  constructor(context) {
    this.context = context;
    this.oscillator = this.context.createOscillator();
    this.gainNode = this.context.createGain();
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
  }

  start(frequency, type = 'sine', effect = null) {
    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    this.oscillator.type = type;

    // Если указан эффект, подключаем его
    if (effect) {
      this.gainNode.disconnect(this.context.destination); // Отключаем прямое соединение
      effect.connect(this.context.destination); // Подключаем эффект к выходу
      this.gainNode.connect(effect); // Подключаем генератор к эффекту
    }

    this.oscillator.start();
  }

  stop() {
    this.oscillator.stop();
  }

  setVolume(volume) {
    this.gainNode.gain.value = volume;
  }
}

/**
 * Добавление звуков и установка их дорожки
 * 
 * @param  {Game} game Объект игры
 * @param {string} path Путь до файла
 * @param {string} [type=sounds] Тип аудиофайла
*/
export async function add(game, path, type='sounds') {
  

  const req = new XMLHttpRequest();
  req.open('GET', path, true);
  req.responseType = 'arraybuffer';
  return new Promise((res, rej) => {

    req.onload = () => {
      audio.context.decodeAudioData(req.response, buffer => {
        if (!audio.stack) return;

        let npath = path.split('/');
        if (npath[0] == '.') npath = npath.splice(1, npath.length - 1);
        if (npath[0] == 'data') npath = npath.splice(1, npath.length - 1);
        for (const ext of ['.wav', '.ogg', '.mp3'])
          npath[npath.length - 1] = npath[npath.length - 1].replace(ext, '');
        npath = npath.join('.');
        audio.stack[npath] = new Sound(buffer, type);
        res(true);
      });
    }
    req.onerror = err => { rej(err); }
    req.send();
  });
}

/**
 * Добавление звука с помощью require
 *
 * @param  {Game} game Объект игры
 * @param {string} path Путь до файла
 * @param {string} [type=sounds] Тип аудиофайла
 * @param {string} id ID звука
*/
export async function addPath(game, path, type, id) {
  const req = new XMLHttpRequest();
  req.open('GET', path, true);
  req.responseType = 'arraybuffer';
  return new Promise((res, rej) => {

    req.onload = () => {
      audio.context.decodeAudioData(req.response, buffer => {
        if (!audio.stack) return;

        audio.stack[id] = new Sound(buffer, type);
        res(true);
      });
    }
    req.onerror = err => { rej(err); }
    req.send();
  });
}