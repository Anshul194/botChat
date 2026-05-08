const fs = require('fs');

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

    app.prepare().then(() => {
      createServer((req, res) => {
        handle(req, res)
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