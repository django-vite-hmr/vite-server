import { createServer as createViteServer } from "vite"
import express from "express"
import path from "path"
import Server, { WebSocketServer } from "ws"
import chokidar from "chokidar"
import { UserConfig } from "vite"
import { WatchOptions } from "chokidar"

const __dirname = path.dirname(".")

async function getConfig(config_path: string) {
    try {
        const { default: config } = await import(config_path)
        return config
    } catch (error) {
        console.error("Vite Configuration is Missing. Using default Config.")
        return {}
    }
}

const viteConfig: Promise<UserConfig> = getConfig("./vite.config")
const chokidarConfig: WatchOptions & {
    paths: string | readonly string[]
} = await getConfig("./chokidar.config")
const { paths, ...chokiConfig } = chokidarConfig

const watcher = chokidar.watch(paths ?? [path.resolve(__dirname, "views")], {
    persistent: true,
    ...chokiConfig,
})

async function createServer() {
    const app = express()

    const vite = await createViteServer({
        server: { middlewareMode: true, port: 5173 },
        appType: "custom",
        ...viteConfig,
    })

    app.use(vite.middlewares)
    app.set("view engine", "ejs")

    app.use("/static", express.static(path.resolve(__dirname, "static")))

    app.get("", (req, res) => {
        res.render("index")
    })

    // Setting Up WebSocket
    const wss = new WebSocketServer({ port: 3000 })

    wss.on("connection", (ws) => {
        console.log("Client connected")
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

    app.listen(vite.config.server.port, () => {
        console.log(`Listening on http://localhost:${vite.config.server.port}/`)
    })
}

createServer()
