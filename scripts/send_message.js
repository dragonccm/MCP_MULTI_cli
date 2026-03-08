const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let to = '';
let msg = '';
let from = process.env.AGENT_ID || 'unknown';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to') to = args[++i];
    if (args[i] === '--msg') msg = args[++i];
    if (args[i] === '--from') from = args[++i]; // optional override
}

if (!to || !msg) {
    console.error('Usage: node scripts/send_message.js --to <agent_id> --msg "<message>"');
    process.exit(1);
}

const messageLogPath = path.join(process.cwd(), 'docs', 'graph-messages.log');
const logDir = path.dirname(messageLogPath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const entry = {
    time: new Date().toISOString(),
    from,
    to,
    message: msg
};

// Append to log (using JSON lines format)
fs.appendFileSync(messageLogPath, JSON.stringify(entry) + '\n', 'utf-8');

console.log(`[MESSAGE SENT] From: ${from} -> To: ${to}. Content: ${msg}`);
