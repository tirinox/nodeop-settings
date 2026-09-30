// Minimal in-memory stand-in for the bot backend, for local UI development.
// Usage: npm run mock   (listens on :8088, the default Vite proxy target)
// then open http://localhost:5173/?token=demo
import {createServer} from 'node:http'

const PORT = Number(process.env.PORT) || 8088
const VALID_TOKEN = 'demo'

const STATUSES = ['Active', 'Active', 'Active', 'Standby', 'Disabled', 'Whitelisted']

const nodes = Array.from({length: 60}, (_, i) => ({
    node_address: `thor1mock${i.toString().padStart(3, '0')}q9x8c7v6b5n4m3k2j1h${((i + 1) * 7919 * 104729).toString(36).padStart(8, '0')}`,
    status: STATUSES[i % STATUSES.length],
    version: i % 5 === 0 ? '3.9.0' : '3.10.1',
    total_bond: String(Math.round((3e5 + ((i * 104729) % 9e5)) * 1e8)),
}))

let settings = {
    _messenger: {platform: 'telegram', name: 'demo_channel', username: 'demo_user'},
    'nop:slash:threshold': 250,
}
let watchlist = [nodes[0].node_address, nodes[3].node_address]
let revoked = false

function send(res, status, body) {
    res.writeHead(status, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(body))
}

async function readBody(req) {
    const chunks = []
    for await (const chunk of req) {
        chunks.push(chunk)
    }
    return JSON.parse(Buffer.concat(chunks).toString() || '{}')
}

createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    console.log(req.method, url.pathname)

    if (url.pathname === '/api/nodes') {
        return send(res, 200, nodes)
    }

    const match = url.pathname.match(/^\/api\/settings\/(.*)$/)
    if (match) {
        if (match[1] !== VALID_TOKEN || revoked) {
            return send(res, 200, {error: 'invalid token'})
        }
        if (req.method === 'GET') {
            return send(res, 200, {settings, nodes: watchlist})
        }
        if (req.method === 'POST') {
            const body = await readBody(req)
            settings = body.settings
            watchlist = body.nodes
            return send(res, 200, {ok: true})
        }
        if (req.method === 'DELETE') {
            revoked = true
            return send(res, 200, {ok: true})
        }
    }

    send(res, 404, {error: 'not found'})
}).listen(PORT, () => {
    console.log(`Mock API on http://127.0.0.1:${PORT} (token: ${VALID_TOKEN})`)
})
