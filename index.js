import consoleStamp from "console-stamp";
consoleStamp(console, {
  format: ":date(dd/mm/yyyy HH:MM:ss)",
});

import http from "http";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";

import { setupSocket } from "./socket";
import { PORT, TOKEN } from "./constants";

let server;
const serverFactory = (handler) => {
  server = http.createServer((req, res) => {
    handler(req, res);
  });

  return server;
};

const fastify = Fastify({ serverFactory }).register(fastifyCors, {
  origin: "*",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
});

setupSocket(server);

fastify.ready((err) => {
  if (err) {
    throw err;
  }

  server.listen({ port: PORT });
  console.log(`Your runner token ${TOKEN}`);
});
