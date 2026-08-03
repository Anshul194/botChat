// Production server for Next.js standalone output
// Compatible with cPanel Node.js App (LiteSpeed/lsnode)

const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('uncaughtException', (err) => {
    fs.writeFileSync(
        path.join(__dirname, 'startup-error.txt'),
        'Uncaught Exception: ' + (err.stack || err.toString())
    );
    process.exit(1);
});

try {
    // Standalone mode: Next.js server is pre-built inside .next/standalone/
    // We delegate to it directly — no need for require('next') at startup
    const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

    if (fs.existsSync(standaloneServer)) {
        // --- Standalone mode (recommended, smaller deploy) ---
        // Override port so cPanel's PORT env var is respected
        process.env.PORT = process.env.PORT || '3000';
        process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

        // The standalone server.js needs __dirname to be its own folder
        // so we load it with require() which respects its own __dirname
        require(standaloneServer);

        // Write success marker
        setTimeout(() => {
            fs.writeFileSync(
                path.join(__dirname, 'startup-success.txt'),
                'Standalone server started on port ' + process.env.PORT + ' at ' + new Date().toISOString()
            );
        }, 2000);

    } else {
        // --- Fallback: classic mode (requires full node_modules) ---
        const { createServer } = require('http');
        const next = require('next');

        const app = next({ dev: false });
        const handle = app.getRequestHandler();
        const port = process.env.PORT || 3000;

        app.prepare().then(() => {
            createServer((req, res) => handle(req, res))
                .listen(port, () => {
                    console.log(`> Ready on http://localhost:${port}`);
                    fs.writeFileSync(
                        path.join(__dirname, 'startup-success.txt'),
                        'Classic server started on port ' + port + ' at ' + new Date().toISOString()
                    );
                });
        }).catch((err) => {
            fs.writeFileSync(
                path.join(__dirname, 'startup-error.txt'),
                'App Prepare Error: ' + (err.stack || err.toString())
            );
            process.exit(1);
        });
    }

} catch (err) {
    fs.writeFileSync(
        path.join(__dirname, 'startup-error.txt'),
        'Initialization Error: ' + (err.stack || err.toString())
    );
    process.exit(1);
}
