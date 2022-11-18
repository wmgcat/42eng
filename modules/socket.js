modules.socket = {
  title: 'socket', v: '1.0',
  init: (ip='localhost', port=8080, update) => {
    this.ip = ip, this.port = port, this.is_open = true;
    this.socket = new WebSocket(`ws://${ip}:${port}`);
    this.socket.onerror = e => { Add.debug(e.message); }
    this.socket.onopen = e => { Add.debug('server is connected!'); }
    this.socket.onmessage = e => { update(JSON.parse(e.data)); }
    this.socket.onclose = e => {
      if (e.wasClean) Add.debug('clear disconnect!');
      else Add.debug('not clear disconnect!');
      this.is_open = false;
    }
  },
  send: (type, data) => {
    if (this.is_open) {
      data.TYPE = type;
      this.socket.send(JSON.stringify(data));
    } else Add.debug('not connection to server!');
  }
}
