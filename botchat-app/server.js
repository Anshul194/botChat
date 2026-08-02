const fs = require('fs');
const path = require('path');

// This is the production server (next({ dev: false })). Must be set before
// requiring `next`/`react` so the production builds load.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Catch any fatal errors and write them to a file so we can see them in cPanel File Manager
process.on('uncaughtException', (err) => {
    fs.writeFileSync(__dirname + '/startup-error.txt', 'Uncaught Exception: ' + (err.stack || err.toString()));
    process.exit(1);
});

try {
    const { createServer } = require('http')
    const next = require('next')

    const dev = false
    const app = next({ dev })
    const handle = app.getRequestHandler()

    const port = process.env.PORT || 3000

    const PUBLIC_DIR = path.join(__dirname, 'public');

    // Serve static files from /public directly with long browser cache
    // (bypasses Next handler for media so browsers can cache & revalidate)
    function servePublic(req, res) {
        const urlPath = decodeURIComponent((req.url || '').split('?')[0]);
        if (urlPath.startsWith('/_next/')) return false; // let Next handle build assets (has own caching)

        const safePath = urlPath === '/' ? '/index.html' : urlPath;
        const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
        if (!filePath.startsWith(PUBLIC_DIR)) return false;

        try {
            const stat = fs.statSync(filePath);
            if (!stat.isFile()) return false;
        } catch {
            return false;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mime = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
            '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
            '.mp4': 'video/mp4', '.webm': 'video/webm',
            '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
            '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8',
        };
        res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Accept-Ranges', 'bytes');

        // Support HTTP Range requests (needed for video scrubbing on mobile)
        const range = req.headers.range;
        const stat = fs.statSync(filePath);
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
            const chunkSize = end - start + 1;
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mime[ext] || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
            });
            fs.createReadStream(filePath, { start, end }).pipe(res);
            return true;
        }

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return true;
    }

    app.prepare().then(() => {
      createServer((req, res) => {
        // Intercept + cache static public files
        if (servePublic(req, res)) return;

        // Forward everything else to Next.js
        handle(req, res);
      }).listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`)
        // Write a success file if it makes it this far
        fs.writeFileSync(__dirname + '/startup-success.txt', 'Server started successfully on port ' + port);
      })
    }).catch((err) => {
        fs.writeFileSync(__dirname + '/startup-error.txt', 'App Prepare Error: ' + (err.stack || err.toString()));
        process.exit(1);
    });

} catch (err) {
    fs.writeFileSync(__dirname + '/startup-error.txt', 'Initialization Error: ' + (err.stack || err.toString()));
    process.exit(1);
}
