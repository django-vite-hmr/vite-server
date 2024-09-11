# Vite Server

Start `Express Server` with `Vite` middleware. This server offers hot-reloading for static files and reloading for HTML (or similar) files. It uses `Chokidar` to detect changes to webpage files and `WebSocket` to send event notifications to the frontend.

## Installation

Install this package as a global dependency.

```bash
yarn global add @django-vite/vite-server
```

and you can use this using Command Line Interface

```bash
django-vite-hmr # Start the Server
```

## Reloading HTML

Inject Following JavaScript Code

```js
const socket = new WebSocket("ws://localhost:5173/") // ws://server-host:server-port
socket.onmessage = (event) => {
    console.log(event)
    if (event.data === "reload") {
        window.location.reload()
    }
}

socket.onerror = (error) => {
    console.error("WebSocket error:", error)
}

// Event handler for when the WebSocket connection is closed
socket.onclose = () => {
    console.log("WebSocket connection closed")
}
```

## Configuration

-   **`vite.config.ts`**

    You can override **Vite Config** using `vite.config.js` or `vite.config.ts`

    ```ts
    // vite.config.ts
    import { defineConfig } from "vite"
    import path from "path"

    export default defineConfig({
        ...yourConfig,
    })
    ```

-   **`chokidar.config.ts`**

    You can override **Chokidar Config** using `chokidar.config.ts` or `chokidar.config.js`

    **TypeScript**

    ```ts
    // chokidar.config.ts
    import { WatchOptions } from "chokidar"

    const options: WatchOptions = {}
    export default options
    ```

    **JavaScript**

    ```js
    // chokidar.config.js
    import { WatchOptions } from "chokidar"

    /**
     * Override Chokidar Configuration
     *
     * @type {WatchOptions}
     */
    const options = {}
    export default options
    ```

    > Using docstring to provide typing.


### Integration with Django
[Documentation](https://github.com/django-vite-hmr#vite-server)