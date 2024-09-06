import { defineConfig } from "vite"
import { WatchOptions } from "chokidar"
import path from "path"

import { watch } from "chokidar"
const __dirname = path.dirname(".")

export const watchOptions: WatchOptions & {
    paths?: string | ReadonlyArray<string>
} = {
    paths: [path.resolve(__dirname, "views")],
    persistent: true,
}

export default defineConfig({
    server: {
        port: 5173,
    },
    build: {},
})
