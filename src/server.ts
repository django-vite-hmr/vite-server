#!/usr/bin/env node
import { createServer as createHttpServer } from "http"
import { createServer as createViteServer, UserConfig } from "vite"
import Server, { WebSocketServer } from "ws"
import chokidar, { WatchOptions } from "chokidar"
import express from "express"
import path from "path"
import fs from "fs"

const __dirname = resolveRoot()

// Reading UserConfig Files: Need default export
const viteConfig = await getConfig<UserConfig>("./vite.config")
const chokidarConfig = await getConfig<
    WatchOptions & {
        paths: string | readonly string[]
    }
>("./chokidar.config")

const { paths, ...chokidarConf } = chokidarConfig
const watcher = chokidar.watch(paths ? paths : "./**/*.+(html)", {
    persistent: true,
    ...chokidarConf,
})

async function createServer() {
    const app = express()
    const server = createHttpServer(app)
    const vite = await createViteServer({
        server: { middlewareMode: true, port: 5173 },
        appType: "custom",
        ...viteConfig,
    })

    app.use(vite.middlewares)
    // app.use("/static", express.static(path.resolve(__dirname, "static")))

    app.get("", (_, res) => {
        res.sendFile(path.resolve(__dirname, "views", "index.html"))
    })

    // Setting Up WebSocket
    const wss = new WebSocketServer({ server })

    wss.on("connection", (ws) => {
        console.log(`[Connected] Client Connected`)
        ws.send("connected")

        const notifyClients = () => {
            wss.clients.forEach((client) => {
                if (client.readyState === Server.OPEN) {
                    client.send("reload")
                }
            })
        }

        watcher.on("change", (path) => {
            console.log(`File Changed -> ${path}`)
            notifyClients()
        })
    })

    server.listen(vite.config.server.port, () => {
        console.log(`Listening on http://localhost:${vite.config.server.port}/`)
    })
}

function resolveRoot() {
    const dirname_current = import.meta.dirname
    if (
        fs.existsSync(path.resolve(dirname_current, "..", "..", "package.json"))
    ) {
        // After Building
        return path.resolve(dirname_current, "..", "..")
    } else if (
        // Before Building
        fs.existsSync(path.resolve(dirname_current, "..", "package.json"))
    ) {
        return path.resolve(dirname_current, "..")
    } else {
        // None Case applied
        return dirname_current
    }
}

async function getConfig<T extends any>(config_path: string): Promise<T> {
    try {
        const { default: config } = await import(config_path)
        return config
    } catch (error) {
        console.warn(
            `Configuration File is not found. Using default configuration.\n\t${path.resolve(
                config_path
            )}.{ts,js}`
        )
        return {} as T
    }
}

createServer()
