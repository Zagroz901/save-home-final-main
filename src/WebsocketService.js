// WebSocketService.js
export default class WebSocketService {
  constructor(url, reconnectInterval = 5000) {
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.websocket = null;
    this.handleReconnect = this.handleReconnect.bind(this);
  }

  connect(onMessage, onOpen, onError, onClose) {
    this.websocket = new WebSocket(this.url);
    this.websocket.binaryType = 'arraybuffer';

    this.websocket.onopen = () => {
      console.log('WebSocket connection opened.');
      if (onOpen) onOpen();
    };

    this.websocket.onmessage = (event) => {
      if (onMessage) onMessage(event.data);
    };

    this.websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (onClose) onClose();
      if (event.code !== 1000 && this.websocket) {
        this.handleReconnect();
      }
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (onError) onError(error);
      if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
        this.websocket.close();
      }
    };
  }

  send(data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(data);
    } else {
      console.error('WebSocket is not open. Cannot send data.');
    }
  }

  close() {
    if (this.websocket) {
      this.websocket.close(1000, 'Closed by client');
      this.websocket = null;
    }
  }

  handleReconnect() {
    if (this.websocket !== null) {
      console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000} seconds...`);
      setTimeout(() => {
        console.log("Reconnecting...");
        this.connect();
      }, this.reconnectInterval);
    }
  }
}
