import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    bold: '\x1b[1m'
};

function log(msg, color = COLORS.white) {
    console.log(`${color}${msg}${COLORS.reset}`);
}

function runCmd(cmd, cwd = process.cwd()) {
    try {
        execSync(cmd, { stdio: 'inherit', cwd });
        return true;
    } catch (e) {
        return false;
    }
}

async function setup() {
    log(`\n${COLORS.bold}${COLORS.cyan}🚀 AI DEV TEAM - ONE-CLICK AUTO SETUP${COLORS.reset}\n`);

    const engineDir = process.cwd();

    // 1. Build MCP Server
    log(`${COLORS.bold}1️⃣ Building MCP Server (mcp-server)...${COLORS.reset}`, COLORS.yellow);
    const mcpPath = path.join(engineDir, 'mcp-server');
    if (fs.existsSync(mcpPath)) {
        log(`Running npm install inside mcp-server...`, COLORS.cyan);
        runCmd('npm install', mcpPath);
        log(`Compiling MCP tools...`, COLORS.cyan);
        runCmd('npm run build', mcpPath);
        log(`✅ MCP Server built successfully.`, COLORS.green);
    } else {
        log(`❌ Error: mcp-server folder not found.`, COLORS.red);
    }

    console.log();

    // 2. Generate .env Template
    log(`${COLORS.bold}2️⃣ Generating .env file...${COLORS.reset}`, COLORS.yellow);
    const envPath = path.join(engineDir, '.env');
    if (!fs.existsSync(envPath)) {
        const envTemplate = `GEMINI_API_KEY=your_gemini_key_here
GITHUB_TOKEN=your_github_token_here
ANTHROPIC_API_KEY=your_claude_key_here
QWEN_API_KEY=your_qwen_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_APPROVE_ID=your_telegram_chat_id_here
`;
        fs.writeFileSync(envPath, envTemplate, 'utf-8');
        log(`✅ Template .env created. Please fill in your API keys!`, COLORS.green);
    } else {
        log(`✅ .env already exists.`, COLORS.green);
    }

    console.log();

    // 3. Initialize AI CLI Config Folders
    log(`${COLORS.bold}3️⃣ Initializing AI CLI Configuration Folders...${COLORS.reset}`, COLORS.yellow);

    // Default MCP settings
    const absoluteMcpPath = path.join(engineDir, 'mcp-server/dist/index.js').replace(/\\/g, '/');
    const stitchCmd = process.platform === 'win32' ? 'stitch-mcp.cmd' : 'stitch-mcp';

    const baseMcpConfig = {
        "mcpServers": {
            "dev-tools": {
                "command": "node",
                "args": [absoluteMcpPath]
            },
            "stitch-mcp": {
                "command": stitchCmd,
                "args": ["proxy"]
            }
        }
    };

    const agents = [
        { folder: '.gemini', file: 'settings.json' },
        { folder: '.claude', file: 'mcp.json' }
    ];

    agents.forEach(agent => {
        const dir = path.join(engineDir, agent.folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const configPath = path.join(dir, agent.file);
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(baseMcpConfig, null, 4), 'utf-8');
            log(`✅ Created ${agent.folder}/${agent.file}`, COLORS.green);
        } else {
            log(`✅ ${agent.folder}/${agent.file} already exists (will be auto-updated by Orchestrator later).`, COLORS.green);
        }
    });

    console.log();

    // 4. Install Global CLI Dependencies
    log(`${COLORS.bold}4️⃣ Verifying Global CLI Dependencies...${COLORS.reset}`, COLORS.yellow);
    log(`Checking for stitch-mcp, gemini, qwen, copilot...`, COLORS.cyan);

    const clis = [
        { name: 'stitch-mcp', pkg: '@_davideast/stitch-mcp' },
        { name: 'gemini', pkg: '@google/gemini-cli' },
        { name: 'claude', pkg: '@anthropic-ai/claude-code' }
    ];

    for (const cli of clis) {
        try {
            // Check if installed globally
            execSync(`npm ls -g --depth=0 | findstr ${cli.pkg}`, { stdio: 'ignore' });
            log(`✅ ${cli.name} is already installed globally.`, COLORS.green);
        } catch {
            log(`⚠️ ${cli.name} not found globally. Installing...`, COLORS.yellow);
            const success = runCmd(`npm install -g ${cli.pkg}`);
            if (success) {
                log(`✅ ${cli.name} installed successfully.`, COLORS.green);
            } else {
                log(`❌ Failed to install ${cli.name}. Please install manually using: npm i -g ${cli.pkg}`, COLORS.red);
            }
        }
    }

    console.log(`\n${COLORS.bold}${COLORS.green}🎉 SETUP COMPLETE!${COLORS.reset}`);
    console.log(`\n${COLORS.cyan}Next steps (Manual Authentication Required):${COLORS.reset}`);
    console.log(`1. Open the ${COLORS.bold}.env${COLORS.reset} file and add your API keys.`);
    console.log(`2. Login to all AI CLI tools so they can function correctly:`);
    console.log(`   - ${COLORS.yellow}stitch-mcp login${COLORS.reset} (For database tools)`);
    console.log(`   - ${COLORS.yellow}gemini login${COLORS.reset}     (For PO, Reviewer, Release Agents)`);
    console.log(`   - ${COLORS.yellow}claude login${COLORS.reset}     (For Frontend/Backend Agents)`);
    console.log(`3. Run a new project: ${COLORS.bold}node orchestrator.js --project my-app "Create a chat app"${COLORS.reset}\n`);
}

setup();
