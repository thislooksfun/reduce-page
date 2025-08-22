import type { Express } from "express";
import type { Server } from "node:http";

import express from "express";
import livereload from "livereload";

const liveReloadPort = 35_729;
const webPort = 3000;

function startApp(app: Express, port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function startServer(pageBuilder: () => string) {
  const liveReloadServer = livereload.createServer({ port: liveReloadPort });

  const app = express();
  app.get("/", (_request, response) => {
    const body = pageBuilder().replace(
      "<head>",
      `<head><script src="//localhost:${liveReloadPort}/livereload.js?snipver=1"></script>`,
    );

    response.set("content-type", "text/html");
    response.send(body);
  });

  const server = await startApp(app, webPort);

  return {
    refresh: () => {
      liveReloadServer.refresh("/");
    },
    stopServer: async () => {
      await stopServer(server);
      liveReloadServer.close();
    },
  };
}
