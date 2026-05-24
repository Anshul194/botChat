/**
 * BotChat Smart Inbox — Real-time Socket.IO Server
 *
 * Replaces Laravel Reverb + Redis.
 * Laravel emits events via POST /emit (authenticated with SOCKET_SECRET).
 * Next.js clients connect via socket.io-client and join tenant/conversation rooms.
 *
 * Room naming (must match useRealtimeInbox.ts):
 *   Global inbox:    tenant.{tenantDomain}.inbox
 *   Conversation:    tenant.{tenantDomain}.conversation.{conversationId}
 *
 * Environment variables (.env):
 *   PORT=3001
 *   SOCKET_SECRET=your-secret-here
 *   ALLOWED_ORIGINS=https://pos.divyangtechlabs.com,http://localhost:3000
 */

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

// ── Error capture (for cPanel) ────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
    fs.writeFileSync(__dirname + '/startup-error.txt', 'Uncaught Exception: ' + (err.stack || err.toString()));
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

const SECRET  = process.env.SOCKET_SECRET || 'botchat_socket_secret_change_me';
const PORT    = process.env.PORT || 3010;
const ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'];

const app    = express();
const server = http.createServer(app);

app.use(express.json());

// ── Socket.IO server ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', connections: io.engine.clientsCount });
});

// ── Emit endpoint (called by Laravel PHP) ────────────────────────────────────
// POST /emit  { secret, room, event, data }
app.post('/emit', (req, res) => {
    const { secret, room, event, data } = req.body;

    if (!secret || secret !== SECRET) {
        console.warn('[emit] ❌ Unauthorized attempt from', req.ip);
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!room || !event) {
        console.warn('[emit] ❌ Missing room or event', { room, event });
        return res.status(400).json({ error: 'room and event are required' });
    }

    // Count how many clients are in the target room
    const roomSockets = io.sockets.adapter.rooms.get(room);
    const clientCount = roomSockets ? roomSockets.size : 0;

    io.to(room).emit(event, data || {});

    // Log direction for message events so we can verify inbound/outbound
    const direction = data?.message?.direction ?? data?.direction ?? '-';
    const msgPreview = data?.message?.message ?? data?.message ?? '-';

    console.log(`[emit] ✅ room="${room}" event="${event}" clients=${clientCount} direction=${direction}`);
    console.log(`       msg="${String(msgPreview).slice(0, 60)}" data=${JSON.stringify(data || {}).slice(0, 150)}`);

    if (clientCount === 0) {
        console.warn(`[emit] ⚠️  No clients in room "${room}" — message will NOT appear in real-time`);
    }

    return res.json({ ok: true, room, event, clients_in_room: clientCount });
});


// ── Client connection ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[connect] ${socket.id} from ${clientIp}`);

    /**
     * Join rooms.
     * Client sends: { tenantDomain: "pos.divyangtechlabs.com", conversationId?: 5 }
     */
    socket.on('join', ({ tenantDomain, conversationId }) => {
        if (!tenantDomain) return;

        const globalRoom = `tenant.${tenantDomain}.inbox`;
        socket.join(globalRoom);
        console.log(`[join] ${socket.id} → ${globalRoom}`);

        if (conversationId) {
            const convRoom = `tenant.${tenantDomain}.conversation.${conversationId}`;
            socket.join(convRoom);
            console.log(`[join] ${socket.id} → ${convRoom}`);
        }
    });

    /**
     * Leave a conversation room (when user switches conversations).
     */
    socket.on('leave', ({ tenantDomain, conversationId }) => {
        if (!tenantDomain || !conversationId) return;
        const convRoom = `tenant.${tenantDomain}.conversation.${conversationId}`;
        socket.leave(convRoom);
        console.log(`[leave] ${socket.id} ← ${convRoom}`);
    });

    socket.on('disconnect', (reason) => {
        console.log(`[disconnect] ${socket.id} reason=${reason}`);
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    const msg = `BotChat Socket Server running on port ${PORT}`;
    console.log(msg);
    fs.writeFileSync(__dirname + '/startup-success.txt', msg);
});
