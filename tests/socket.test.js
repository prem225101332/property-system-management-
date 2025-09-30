import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import Client from "socket.io-client";
import { expect } from "chai";

describe("Socket.IO chat", function() {
  let io, serverSocket, httpServer, clientSocket;

  before((done) => {
    httpServer = createServer();
    io = new IOServer(httpServer, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      serverSocket = socket;

      socket.on("sendMessage", (data) => {
        socket.emit("receiveMessage", data);
      });
    });

    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on("connect", done);
    });
  });

  after(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  it("should send and receive messages", (done) => {
    const testMessage = { senderId: "admin", message: "Hello Tenant" };

    clientSocket.on("receiveMessage", (msg) => {
      expect(msg).to.deep.equal(testMessage);
      done();
    });

    clientSocket.emit("sendMessage", testMessage);
  });
});
