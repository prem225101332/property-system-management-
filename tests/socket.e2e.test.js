import { expect } from "chai";
import io from "socket.io-client";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const SERVER_URL = "http://localhost:3000";

describe("Socket.IO multi-admin & tenant chat behavior", function () {
  this.timeout(30000);

  let admin1, admin2, tenant1, tenant2;
  let admin1Id, admin2Id, tenant1Id, tenant2Id;

  before(async () => {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);

    // Create temporary users
    const users = await User.insertMany([
      { name: "Admin1", email: "admin1@test.com", password: "pass", role: "Admin" },
      { name: "Admin2", email: "admin2@test.com", password: "pass", role: "Admin" },
      { name: "Tenant1", email: "tenant1@test.com", password: "pass", role: "Tenant" },
      { name: "Tenant2", email: "tenant2@test.com", password: "pass", role: "Tenant" },
    ]);

    [admin1Id, admin2Id, tenant1Id, tenant2Id] = users.map(u => u._id.toString());

    // Connect sockets
    let connectedCount = 0;
    const checkAllConnected = () => {
      connectedCount++;
      if (connectedCount === 4) console.log("All sockets connected");
    };

    admin1 = io(SERVER_URL);
    admin2 = io(SERVER_URL);
    tenant1 = io(SERVER_URL);
    tenant2 = io(SERVER_URL);

    admin1.on("connect", checkAllConnected);
    admin2.on("connect", checkAllConnected);
    tenant1.on("connect", checkAllConnected);
    tenant2.on("connect", checkAllConnected);

    // Register users with server
    admin1.emit("registerUser", admin1Id);
    admin2.emit("registerUser", admin2Id);
    tenant1.emit("registerUser", tenant1Id);
    tenant2.emit("registerUser", tenant2Id);
  });

  after(async () => {
    admin1.disconnect();
    admin2.disconnect();
    tenant1.disconnect();
    tenant2.disconnect();

    await User.deleteMany({ email: /test.com$/ }); // cleanup temporary users
    await mongoose.disconnect();
  });

  it("Admin1 sends message to Tenant1 only", (done) => {
    const message = "Hello Tenant1";

    tenant1.once("receiveMessage", (msg) => {
      try {
        expect(msg.message).to.equal(message);
        done();
      } catch (err) {
        done(err);
      }
    });

    tenant2.once("receiveMessage", () => {
      done(new Error("Tenant2 should NOT receive Admin1's message"));
    });

    admin1.emit("sendMessage", {
      senderId: admin1Id,
      senderType: "admin",
      receiverId: tenant1Id,
      receiverType: "tenant",
      message
    });
  });

  // ... similarly for Tenant1 reply, Admin2->Tenant2, Tenant2 reply
});
