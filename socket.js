import { promisify } from "util";
import { exec } from "child_process";
import { Server } from "socket.io";

import { TOKEN } from "./constants";

const execAsync = promisify(exec);

export const setupSocket = (server) => {
  const io = new Server(server);

  io.use((socket, next) => {
    let uuid = socket.handshake.auth.Authorization;
    if (uuid === TOKEN) {
      return next();
    }
    return next(new Error("Authentication error"));
  });

  let connections = {};
  io.on("connection", (socket) => {
    connections = {};

    socket.on("error", (err) => {
      console.error(err);
    });
    socket.on("execCommand", async (command) => {
      let response = {};
      try {
        const { stdout, stderr } = await execAsync(command);

        response = {
          command,
          output: stdout || stderr,
        };
      } catch (e) {
        console.error(e);
      } finally {
        socket.emit("outputCommand", response);
      }
    });
  });
};
