import Danmu from '../Danmu';

interface INewMessagePayload {
  id: string;
  roomId: string;
  username: string;
  userAddress: string;
  message: string;
  profile_image?: string;
  timestamp: string;
  messageType: string;
}

export default class PumpLive {
  ws?: WebSocket;
  sid?: string;
  pingIntervalMs = 25000;
  pingTimer?: any;

  constructor(public roomId: string) {
    this.connect();
  }

  private connect() {
    const url = 'wss://livechat.pump.fun/socket.io/?EIO=4&transport=websocket';
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      // Engine.IO open happens server first with a 0{json}; we wait and then send 40 probe
    };
    this.ws.onmessage = (ev) => this.onMessage(ev.data as string);
    this.ws.onclose = () => this.cleanup();
    this.ws.onerror = () => {};
  }

  private onMessage(data: string) {
    // Basic Engine.IO / Socket.IO v4 framing handler minimal
    if (data.startsWith('0')) {
      // open packet with JSON { sid, pingInterval, ... }
      try {
        const open = JSON.parse(data.slice(1));
        this.sid = open.sid;
        this.pingIntervalMs = open.pingInterval ?? 25000;
      } catch {}
      // send Socket.IO connect for default namespace
      this.send(
        '40' +
          JSON.stringify({
            origin: 'https://pump.fun',
            timestamp: Date.now(),
            token: null,
          })
      );
      this.startPing();
      return;
    }

    if (data === '2') {
      // ping from server -> send pong
      this.send('3');
      return;
    }

    if (data.startsWith('40')) {
      // connected to namespace, now join room
      this.emit('joinRoom', { roomId: this.roomId, username: '' });
      return;
    }

    if (data.startsWith('42[')) {
      try {
        const payload = JSON.parse(data.slice(2));
        const event = payload[0];
        const body = payload[1];
        if (event === 'newMessage') {
          const m = body as INewMessagePayload;
          Danmu.Apply({
            id: 0,
            name: m.username || m.userAddress,
            text: m.message,
            face: m.profile_image,
          });
        }
      } catch {}
      return;
    }
  }

  private emit(event: string, body: any) {
    const msg = '42' + JSON.stringify([event, body]);
    this.send(msg);
  }

  private send(msg: string) {
    try {
      this.ws?.send(msg);
    } catch {}
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.send('2');
    }, this.pingIntervalMs);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  private cleanup() {
    this.stopPing();
    this.ws = undefined;
  }
}
