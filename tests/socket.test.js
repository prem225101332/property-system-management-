// tests/socket.test.js (Jest + ESM)
import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { io as Client } from 'socket.io-client';

jest.setTimeout(15000);

describe('Socket.IO', () => {
  let io, httpServer, port;
  let client;

  beforeAll(async () => {
    httpServer = createServer();
    io = new IOServer(httpServer, { cors: { origin: '*' } });

    // very small demo server: echoes "ping" -> "pong"
    io.on('connection', (socket) => {
      socket.on('ping', (payload) => {
        socket.emit('pong', payload);
      });
    });

    await new Promise((resolve) => httpServer.listen(0, resolve));
    port = httpServer.address().port;
  });

  afterAll(async () => {
    if (client && client.connected) client.disconnect();
    // Close server first, then httpServer
    await new Promise((resolve) => io.close(resolve));
    await new Promise((resolve) => httpServer.close(resolve));
  });

  test('connects and exchanges a message', async () => {
    client = new Client(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    // wait for connection
    await new Promise((resolve, reject) => {
      client.on('connect', resolve);
      client.on('connect_error', reject);
    });
    expect(client.connected).toBe(true);

    // send ping, await pong
    const payload = { hello: 'world' };
    const pong = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('No pong received')), 5000);
      client.once('pong', (data) => {
        clearTimeout(timer);
        resolve(data);
      });
      client.emit('ping', payload);
    });

    expect(pong).toEqual(payload);
  });
});