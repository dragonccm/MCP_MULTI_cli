const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let targetAgent = process.env.AGENT_ID;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--for') targetAgent = args[++i];
}

if (!targetAgent) {
    console.error('Usage: node scripts/read_messages.js --for <agent_id>');
    process.exit(1);
}

const messageLogPath = path.join(process.cwd(), 'docs', 'graph-messages.log');
if (!fs.existsSync(messageLogPath)) {
    console.log('No messages found (graph-messages.log is empty).');
    process.exit(0);
}

const content = fs.readFileSync(messageLogPath, 'utf-8');
const lines = content.split('\n').filter(l => l.trim().length > 0);

const messages = [];
for (const line of lines) {
    try {
        const obj = JSON.parse(line);
        if (obj.to === targetAgent) {
            messages.push(obj);
        }
    } catch (e) { }
}

if (messages.length === 0) {
    console.log(`No new messages for ${targetAgent}.`);
} else {
    console.log(`--- YOU HAVE ${messages.length} MESSAGES ---`);
    for (const msg of messages) {
        console.log(`[${msg.time}] From ${msg.from}: ${msg.message}`);
    }
}
