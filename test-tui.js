import { DevTeamTUI } from './tui.js';

const activeAgents = [
    { id: 'ui', name: 'React UI Dev' },
    { id: 'api', name: 'Express API Server' },
    { id: 'db', name: 'MySQL DBA' },
    { id: 'deploy', name: 'DevOps Docker' }
];

const ui = new DevTeamTUI('Mock Test Project', activeAgents);

let count = 0;
const interval = setInterval(() => {
    count++;
    if (count === 1) {
        ui.logToAgent('ui', `<think>`);
        ui.logToAgent('api', `[${count}] Starting Express server config...`);
    }

    if (count > 1 && count <= 3) {
        ui.logToAgent('ui', `  I should create a new component here...`);
        ui.logToAgent('deploy', `[${count}] Writing Dockerfile`);
    }

    if (count === 4) {
        ui.logToAgent('ui', `</think>`);
        ui.logToAgent('ui', "```javascript\nfunction Button() { return <button>Click</button> }\n```");
    }

    setTimeout(() => {
        ui.logToAgent('api', `[${count}] Creating API endpoint...`);
        ui.logToAgent('db', `[${count}] Connecting to Database...`);
    }, 100);

    if (count > 5) {
        clearInterval(interval);
        ui.updateStatus('✅ PARALLEL DEV COMPLETED. Shutting down UI...');
        setTimeout(() => {
            ui.destroy();
            console.log('Test completed successfully.\n');
            process.exit(0);
        }, 1000);
    }
}, 500);
