import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// ============================================================
// 🚀 AI DEV TEAM ORCHESTRATOR
// Pipeline: PM → BA → Frontend+Backend → QA → QC → Release
// ============================================================

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
};

function log(emoji, role, message, color = COLORS.white) {
    const time = new Date().toLocaleTimeString('vi-VN');
    console.log(`${COLORS.bold}[${time}]${COLORS.reset} ${emoji} ${color}${role}${COLORS.reset}: ${message}`);
}

function logGate(phase, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const color = passed ? COLORS.green : COLORS.red;
    log(icon, 'GATE', `${color}${phase.toUpperCase()} → ${passed ? 'PASSED' : 'FAILED'}${details ? ' | ' + details : ''}${COLORS.reset}`);
}

function logSeparator(title) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${COLORS.bold}${COLORS.cyan}${title}${COLORS.reset}`);
    console.log(`${'═'.repeat(60)}\n`);
}

// ============================================================
// PHASE DEFINITIONS
// ============================================================

const PHASES = [
    {
        id: 'pm',
        name: 'Product Manager',
        emoji: '🧠',
        cli: 'gemini',
        color: COLORS.blue,
        promptFile: 'agents/pm-prompt.md',
        gateFile: 'agents/gates/pm-gate.md',
        outputFile: 'docs/prd.md',
        dependsOn: [],
    },
    {
        id: 'ba',
        name: 'Business Analyst',
        emoji: '📋',
        cli: 'qwen',
        color: COLORS.magenta,
        promptFile: 'agents/ba-prompt.md',
        gateFile: 'agents/gates/ba-gate.md',
        outputFile: 'docs/ba-output.md',
        dependsOn: ['pm'],
    },
    {
        id: 'frontend',
        name: 'Frontend Developer',
        emoji: '🎨',
        cli: 'copilot',
        color: COLORS.cyan,
        promptFile: 'agents/frontend-prompt.md',
        gateFile: 'agents/gates/dev-gate.md',
        outputFile: 'docs/frontend-output.md',
        dependsOn: ['ba'],
        parallel: 'dev', // group for parallel execution
    },
    {
        id: 'backend',
        name: 'Backend Developer',
        emoji: '🔧',
        cli: 'copilot',
        color: COLORS.yellow,
        promptFile: 'agents/backend-prompt.md',
        gateFile: 'agents/gates/dev-gate.md',
        outputFile: 'docs/backend-output.md',
        dependsOn: ['ba'],
        parallel: 'dev', // same group → runs parallel with frontend
    },
    {
        id: 'qa',
        name: 'QA Engineer',
        emoji: '🧪',
        cli: 'qwen',
        color: COLORS.green,
        promptFile: 'agents/qa-prompt.md',
        gateFile: 'agents/gates/qa-gate.md',
        outputFile: 'docs/qa-report.md',
        dependsOn: ['frontend', 'backend'],
    },
    {
        id: 'qc',
        name: 'QC / Code Reviewer',
        emoji: '🔍',
        cli: 'qwen',
        color: COLORS.magenta,
        promptFile: 'agents/qc-prompt.md',
        gateFile: 'agents/gates/qc-gate.md',
        outputFile: 'docs/qc-report.md',
        dependsOn: ['qa'],
    },
    {
        id: 'release',
        name: 'Release Manager',
        emoji: '🚀',
        cli: 'qwen',
        color: COLORS.green,
        promptFile: 'agents/release-prompt.md',
        gateFile: 'agents/gates/release-gate.md',
        outputFile: 'docs/release-report.md',
        dependsOn: ['qc'],
    },
];

// ============================================================
// DEVTEAM CLASS
// ============================================================

class DevTeam {
    constructor(options = {}) {
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 600000; // 10 minutes per agent
        this.auto = options.auto || false;
        this.engineDir = process.cwd();
        this.projectName = options.projectName || `project-${Date.now()}`;
        this.projectDir = path.join(this.engineDir, 'projects', this.projectName);
        this.state = {
            requirement: '',
            startTime: null,
            artifacts: {},
            phaseResults: {},
            errors: [],
        };
    }

    // -------------------------------------------------------
    // Helper: Prompt User
    // -------------------------------------------------------
    async promptUser(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    // -------------------------------------------------------
    // CLI Execution
    // -------------------------------------------------------
    async runCLI(cli, prompt, timeout) {
        const effectiveTimeout = timeout || this.timeout;

        // Write prompt to a temp file to avoid shell arg length/splitting issues
        const tempDir = path.join(this.projectDir, '.tmp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempFile = path.join(tempDir, `prompt-${cli}-${Date.now()}.md`);
        fs.writeFileSync(tempFile, prompt, 'utf-8');

        // Short instruction that references the temp file
        // This keeps the CLI arg short and safe for shell parsing
        const shortInstruction = `Read and execute ALL instructions from the file: ${tempFile}`;

        // Map CLI names to actual executable commands
        // shell: true is REQUIRED on Windows to find executables in PATH
        // All prompts are kept SHORT (just a file reference) to avoid word-splitting
        const cliCommands = {
            gemini: {
                cmd: 'gemini',
                args: ['--yolo', '--output-format', 'text', '-p', `"${shortInstruction}"`],
            },
            claude: {
                cmd: 'claude',
                args: ['-p', `"${shortInstruction}"`, '--output-format', 'text'],
            },
            qwen: {
                cmd: 'qwen',
                args: ['--yolo', '--output-format', 'text', '-p', `"${shortInstruction}"`],
            },
            copilot: {
                cmd: 'copilot',
                args: ['--yolo', '--output-format', 'text', '-p', `"${shortInstruction}"`],
            },
        };

        const config = cliCommands[cli];
        if (!config) throw new Error(`Unknown CLI: ${cli}`);

        log('📄', cli.toUpperCase(), `Prompt saved → ${path.basename(tempFile)} (${(prompt.length / 1024).toFixed(1)}KB)`, COLORS.white);

        return new Promise((resolve, reject) => {
            const proc = spawn(config.cmd, config.args, {
                stdio: 'pipe',
                cwd: this.projectDir,
                timeout: effectiveTimeout,
                env: { ...process.env },
                shell: true, // REQUIRED on Windows to find executables in PATH
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                // Stream output in real-time
                process.stdout.write(chunk);
            });

            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('error', (err) => {
                try { fs.unlinkSync(tempFile); } catch (_) { }
                reject(new Error(`Failed to start ${cli}: ${err.message}`));
            });

            proc.on('close', (code) => {
                // Keep temp file on error for debugging, clean on success
                if (code === 0) {
                    try { fs.unlinkSync(tempFile); } catch (_) { }
                }

                if (code === 0) {
                    resolve(stdout.trim());
                } else {
                    reject(new Error(`${cli} exited with code ${code}\nStderr: ${stderr.substring(0, 500)}`));
                }
            });
        });
    }

    // -------------------------------------------------------
    // Quality Gate Check
    // -------------------------------------------------------
    checkGate(phaseId, output) {
        const gatePath = path.join(this.engineDir, `agents/gates/${this.getGateFileName(phaseId)}`);

        // Core approval signals
        const approvalSignals = ['APPROVED', 'PASS', '✅'];
        const rejectSignals = ['REJECTED', 'FAIL', '❌'];

        // Check for explicit rejection first
        const hasReject = rejectSignals.some((s) => output.toUpperCase().includes(s));
        if (hasReject) {
            return { passed: false, reason: 'Output contains explicit REJECT/FAIL signal' };
        }

        // Check for approval signals
        const hasApproval = approvalSignals.some((s) => output.toUpperCase().includes(s));

        // Phase-specific validation
        const validations = {
            pm: () => {
                const checks = [
                    { name: 'Business Objectives', test: /business\s*objectives?|mục\s*tiêu/i.test(output) },
                    { name: 'User Personas', test: /personas?|đối\s*tượng/i.test(output) },
                    { name: 'Requirements', test: /requirements?|yêu\s*cầu/i.test(output) },
                ];
                const failed = checks.filter((c) => !c.test);
                return { passed: failed.length === 0, reason: failed.map((f) => `Missing: ${f.name}`).join(', ') };
            },
            ba: () => {
                const checks = [
                    { name: 'User Stories', test: /user\s*stor(y|ies)|câu\s*chuyện/i.test(output) },
                    { name: 'Acceptance Criteria', test: /acceptance\s*criteria|tiêu\s*chí/i.test(output) },
                ];
                const failed = checks.filter((c) => !c.test);
                return { passed: failed.length === 0, reason: failed.map((f) => `Missing: ${f.name}`).join(', ') };
            },
            frontend: () => ({
                passed: output.length > 100, // Must have substantial output
                reason: output.length <= 100 ? 'Output too short - likely failed' : '',
            }),
            backend: () => ({
                passed: output.length > 100,
                reason: output.length <= 100 ? 'Output too short - likely failed' : '',
            }),
            qa: () => {
                const hasTestResults = /test|spec|pass|fail|coverage/i.test(output);
                return { passed: hasTestResults, reason: hasTestResults ? '' : 'No test results found' };
            },
            qc: () => {
                const hasReview = /review|quality|code|security|performance/i.test(output);
                return { passed: hasReview, reason: hasReview ? '' : 'No review content found' };
            },
            release: () => ({
                passed: true, // Release agent output is always valid if CLI succeeded
                reason: '',
            }),
        };

        const phaseValidation = validations[phaseId] ? validations[phaseId]() : { passed: true, reason: '' };

        // Combine: need either approval signal OR passing phase validation
        const finalPassed = hasApproval || phaseValidation.passed;

        return {
            passed: finalPassed,
            reason: finalPassed ? '' : phaseValidation.reason || 'No APPROVED/PASS signal found',
        };
    }

    getGateFileName(phaseId) {
        const mapping = {
            pm: 'pm-gate.md',
            ba: 'ba-gate.md',
            frontend: 'dev-gate.md',
            backend: 'dev-gate.md',
            qa: 'qa-gate.md',
            qc: 'qc-gate.md',
            release: 'release-gate.md',
        };
        return mapping[phaseId] || `${phaseId}-gate.md`;
    }

    // -------------------------------------------------------
    // Build prompt for an agent
    // -------------------------------------------------------
    buildPrompt(phase, userFeedback = '') {
        const promptPath = path.join(this.engineDir, phase.promptFile);
        let basePrompt = '';

        if (fs.existsSync(promptPath)) {
            basePrompt = fs.readFileSync(promptPath, 'utf-8');
        }

        // Gather context from dependencies
        let context = `\n\n## PROJECT CONTEXT\n`;
        context += `**Original Requirement**: ${this.state.requirement}\n\n`;

        // Inject Knowledge Base if it exists (Global KB)
        const kbPath = path.join(this.engineDir, 'docs/knowledge-base.md');
        if (fs.existsSync(kbPath)) {
            context += `## 🧠 KNOWLEDGE BASE (LESSONS LEARNED)\nRead and strictly avoid repeating these past mistakes:\n${fs.readFileSync(kbPath, 'utf-8')}\n\n`;
        }

        for (const dep of phase.dependsOn) {
            const depOutput = this.state.artifacts[dep];
            if (depOutput) {
                const depPhase = PHASES.find((p) => p.id === dep);
                context += `### ${depPhase.name} Output:\n${depOutput.substring(0, 5000)}\n\n`;
            }
        }

        // Gate checklist
        const gatePath = path.join(this.engineDir, phase.gateFile);
        let gateInfo = '';
        if (fs.existsSync(gatePath)) {
            gateInfo = `\n\n## QUALITY GATE (Must meet ALL criteria):\n${fs.readFileSync(gatePath, 'utf-8')}\n`;
        }

        let feedbackSection = '';
        if (userFeedback) {
            feedbackSection = `\n\n## YÊU CẦU ĐIỀU CHỈNH TỪ NGƯỜI DÙNG (USER FEEDBACK):\nNgười dùng đã xem xét kết quả trước đó của bạn và yêu cầu bạn sửa lại theo ý kiến sau:\n>>> "${userFeedback}" <<<\n\nVui lòng tiếp thu và cập nhật lại toàn bộ output của bạn.\n`;
        }

        return `${basePrompt}${context}${gateInfo}${feedbackSection}\n\nIMPORTANT: End your output with "APPROVED" if all quality criteria are met.`;
    }

    // -------------------------------------------------------
    // Run a single agent with retry & interactive feedback
    // -------------------------------------------------------
    async runAgent(phase) {
        logSeparator(`${phase.emoji} ${phase.name} (${phase.cli.toUpperCase()})`);

        let currentFeedback = '';
        let loopCount = 1;

        while (true) {
            const prompt = this.buildPrompt(phase, currentFeedback);
            let finalOutput = null;
            let gatePassed = false;

            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    log(phase.emoji, phase.name, `Run ${loopCount} - Attempt ${attempt}/${this.maxRetries}...`, phase.color);

                    const output = await this.runCLI(phase.cli, prompt);

                    // Save artifact
                    const outputPath = path.join(this.projectDir, phase.outputFile);
                    const outputDir = path.dirname(outputPath);
                    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
                    fs.writeFileSync(outputPath, output, 'utf-8');

                    log(phase.emoji, phase.name, `Output saved → ${phase.outputFile}`, phase.color);

                    // Quality Gate
                    const gateResult = this.checkGate(phase.id, output);
                    logGate(phase.id, gateResult.passed, gateResult.reason);

                    if (gateResult.passed) {
                        this.state.artifacts[phase.id] = output;
                        this.state.phaseResults[phase.id] = {
                            status: 'passed',
                            attempts: attempt,
                            outputFile: phase.outputFile,
                        };
                        finalOutput = output;
                        gatePassed = true;
                        break; // exit retry loop
                    }

                    // Gate failed → retry
                    log('🔄', phase.name, `Gate failed. ${gateResult.reason}. Retrying...`, COLORS.yellow);

                } catch (error) {
                    log('❌', phase.name, `Error: ${error.message}`, COLORS.red);
                    this.state.errors.push({ phase: phase.id, attempt, error: error.message });

                    // Watchdog: Check global fail count
                    this.globalRetries = (this.globalRetries || 0) + 1;
                    if (this.globalRetries > 5) {
                        console.log(`\n${COLORS.bold}${COLORS.red}⚠️ WATCHDOG ALERT: Pipeline is failing frequently!${COLORS.reset}`);
                        const action = await this.promptUser(`> Type 'kill' to abort, 'skip' to bypass this phase, or Enter to continue: `);
                        if (action.toLowerCase() === 'kill') throw new Error('Aborted by user watchdog.');
                        if (action.toLowerCase() === 'skip') {
                            this.globalRetries = 0;
                            log('⏭️', phase.name, 'Skipped by user', COLORS.yellow);
                            return null;
                        }
                        this.globalRetries = 0; // Reset after user confirms to continue
                    }

                    if (attempt === this.maxRetries) {
                        this.state.phaseResults[phase.id] = { status: 'failed', attempts: attempt, error: error.message };
                        throw new Error(`${phase.name} failed after ${this.maxRetries} attempts: ${error.message}`);
                    }

                    log('🔄', phase.name, `Waiting 5s before retry...`, COLORS.yellow);
                    await new Promise((r) => setTimeout(r, 5000));
                }
            }

            // Interactive Feedback Loop
            if (gatePassed) {
                if (this.auto) {
                    log('🚀', 'ORCHESTRATOR', `Phase ${phase.name} approved automatically (--auto). Proceeding...`, COLORS.green);
                    return finalOutput;
                }

                console.log(`\n${COLORS.bold}${COLORS.magenta}🤔 PHASE COMPLETE: ${phase.name}${COLORS.reset}`);
                console.log(`${COLORS.yellow}Bạn có muốn điều chỉnh gì không?${COLORS.reset}`);
                console.log(`- Nhập yêu cầu để bắt Agent sửa lại (VD: "Thêm tính năng X vào PRD").`);
                console.log(`- Để trống hoặc gõ "pass" rồi nhấn Enter để chốt và ĐI TIẾP.`);

                const answer = await this.promptUser(`\n${COLORS.bold}Feedback:${COLORS.reset} `);

                if (!answer || answer.toLowerCase() === 'pass') {
                    log('🚀', 'ORCHESTRATOR', `Phase ${phase.name} approved by user. Proceeding...`, COLORS.green);
                    return finalOutput;
                } else {
                    log('🔄', 'ORCHESTRATOR', `Received feedback. Asking ${phase.name} to revise...`, COLORS.cyan);
                    currentFeedback = answer;
                    loopCount++;
                    // Continue while loop to re-run agent
                }
            }
        }
    }

    // -------------------------------------------------------
    // ASCII Header
    // -------------------------------------------------------
    printHeader() {
        console.clear();
        const wtf = `${COLORS.white}
█     █  ████████  ████████ 
█  █  █     ██     █        
█  █  █     ██     ██████   
█  █  █     ██     █        
 █████      ██     █        ${COLORS.reset}`;

        const dev = `${COLORS.red}
      ██████   ███████  █     █
      █     █  █        █     █
      █     █  █████    █  █  █
      █     █  █         █ █ █ 
      ██████   ███████    ███  ${COLORS.reset}`;

        // Print line by line combined
        const wtfLines = wtf.split('\n');
        const devLines = dev.split('\n');

        console.log('\n');
        for (let i = 1; i < wtfLines.length; i++) {
            console.log(wtfLines[i] + devLines[i]);
        }
        console.log('\n');

        console.log(`${COLORS.bold}${COLORS.cyan}🚀 AI DEV TEAM PIPELINE STARTED${COLORS.reset}`);
        console.log(`${'═'.repeat(60)}\n`);
    }

    // -------------------------------------------------------
    // Phase 0: Chief Coordinator
    // -------------------------------------------------------
    async runCoordinator(initialRequirement) {
        logSeparator(`👑 CHIEF COORDINATOR (Phase 0) - Project: ${this.projectName}`);
        const promptFile = path.join(this.engineDir, 'agents/coordinator-prompt.md');
        if (!fs.existsSync(promptFile)) return initialRequirement; // fallback if missing

        const basePrompt = fs.readFileSync(promptFile, 'utf-8');
        let conversationHistory = `User: ${initialRequirement}\n`;

        while (true) {
            const fullPrompt = `${basePrompt}\n\n## CONVERSATION HISTORY\n${conversationHistory}\n\nCoordinator (phản hồi ngắn gọn, NHỚ in ra [ACTION: PROCEED_TO_PM] khi đã chốt xong toàn bộ yêu cầu):`;
            log('👑', 'COORDINATOR', 'Thinking...', COLORS.cyan);

            console.log(`\n${COLORS.bold}${COLORS.cyan}👑 COORDINATOR:${COLORS.reset}`);
            const output = await this.runCLI('gemini', fullPrompt);
            console.log('\n'); // newline after stream

            if (output.includes('[ACTION: PROCEED_TO_PM]')) {
                fs.writeFileSync(path.join(this.projectDir, 'docs/final-requirement.md'), output, 'utf-8');
                log('✅', 'COORDINATOR', 'Requirement finalized → docs/final-requirement.md', COLORS.green);
                return "Read docs/final-requirement.md for the full finalized project specifications.";
            }

            const answer = await this.promptUser(`\n${COLORS.bold}Bạn:${COLORS.reset} `);
            conversationHistory += `Coordinator: ${output}\nUser: ${answer}\n`;
        }
    }

    // -------------------------------------------------------
    // Phase Final: Archivist
    // -------------------------------------------------------
    async runArchivist() {
        logSeparator('📚 ARCHIVIST (Phase Final)');
        const promptFile = path.join(this.engineDir, 'agents/archivist-prompt.md');
        if (!fs.existsSync(promptFile)) return;

        const basePrompt = fs.readFileSync(promptFile, 'utf-8');
        let context = `\n\n## PROJECT REPORTS\n`;
        const filesToRead = ['docs/pipeline-report.json', 'docs/frontend-output.md', 'docs/backend-output.md', 'docs/qa-report.md'];
        for (const f of filesToRead) {
            const p = path.join(this.projectDir, f);
            if (fs.existsSync(p)) context += `\n### ${f}\n${fs.readFileSync(p, 'utf-8').substring(0, 5000)}\n`;
        }

        log('📚', 'ARCHIVIST', 'Analyzing project for lessons learned...', COLORS.cyan);
        console.log(`\n${COLORS.bold}${COLORS.cyan}📚 ARCHIVIST:${COLORS.reset}`);

        // Pass the explicit KB file path dynamically so it updates the global KB rather than a local one
        const explicitPrompt = `${basePrompt}\n\nIMPORTANT INSTRUCTION: You MUST use the write_file tool to append or create the Knowledge Base at EXACTLY this ABSOLUTE PATH: ${path.join(this.engineDir, 'docs/knowledge-base.md')} . Do NOT write it to any other location.`;
        await this.runCLI('gemini', `${explicitPrompt}${context}`);
        console.log('\n');

        log('🗑️', 'CLEANUP', 'Removing temporary files...', COLORS.yellow);
        const tempDir = path.join(this.projectDir, '.tmp');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            log('✅', 'CLEANUP', 'Temporary files removed.', COLORS.green);
        }
    }

    // -------------------------------------------------------
    // Main Pipeline
    // -------------------------------------------------------
    async pipeline(initialRequirement) {
        this.printHeader();

        // Ensure directories exist early for Coordinator
        const dirs = ['docs', 'docs/stories', 'src', 'tests'];
        for (const dir of dirs) {
            const fullPath = path.join(this.projectDir, dir);
            if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
        }

        // Make sure the global engine 'docs' exists for KB
        if (!fs.existsSync(path.join(this.engineDir, 'docs'))) {
            fs.mkdirSync(path.join(this.engineDir, 'docs'), { recursive: true });
        }

        // Copy CLI config folders (.gemini, etc) into the new project dir so CLI tools work gracefully within project
        ['.gemini', '.claude', '.qwen', '.copilot', '.env'].forEach(item => {
            const src = path.join(this.engineDir, item);
            const dest = path.join(this.projectDir, item);
            if (fs.existsSync(src) && !fs.existsSync(dest)) {
                if (fs.statSync(src).isDirectory()) {
                    fs.cpSync(src, dest, { recursive: true });
                } else {
                    fs.copyFileSync(src, dest);
                }
            }
        });

        // Fix MCP server paths to be absolute, so the server can be found from project dir
        const absoluteMcpPath = path.join(this.engineDir, 'mcp-server/dist/index.js').replace(/\\/g, '/');
        const absoluteStitchPath = path.join(this.engineDir, 'mcp-server/node_modules/@_davideast/stitch-mcp/dist/index.js').replace(/\\/g, '/');
        try {
            const fixConfig = (configPath) => {
                const fullPath = path.join(this.projectDir, configPath);
                if (fs.existsSync(fullPath)) {
                    try {
                        const config = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

                        if (config.mcpServers) {
                            // Point dev-tools to the absolute path
                            if (config.mcpServers['dev-tools']) {
                                config.mcpServers['dev-tools'].command = 'node';
                                config.mcpServers['dev-tools'].args = [absoluteMcpPath];
                            }

                            // Point stitch-mcp to global executable + proxy mode
                            if (config.mcpServers['stitch-mcp']) {
                                config.mcpServers['stitch-mcp'].command = process.platform === 'win32' ? 'stitch-mcp.cmd' : 'stitch-mcp';
                                config.mcpServers['stitch-mcp'].args = ['proxy'];
                            }
                        }

                        fs.writeFileSync(fullPath, JSON.stringify(config, null, 4), 'utf-8');
                    } catch (err) {
                        console.error(`Error fixing MCP config ${configPath}:`, err);
                    }
                }
            };

            fixConfig('.gemini/settings.json');
            fixConfig('.claude/mcp.json');
            fixConfig('.qwen/mcp.json');
            fixConfig('.copilot/mcp.json');
        } catch (e) { console.error('Error rewriting MCP paths:', e); }

        // ---- Phase 0: Coordinator ----
        const requirement = await this.runCoordinator(initialRequirement);

        this.state.requirement = requirement;
        this.state.startTime = Date.now();

        log('📝', 'ORCHESTRATOR', `Requirement Confirmed`, COLORS.bold);
        log('⚙️', 'ORCHESTRATOR', `Max retries: ${this.maxRetries} | Timeout: ${this.timeout / 1000}s`, COLORS.white);

        try {
            // ---- Phase 1: PM ----
            await this.runAgent(PHASES.find((p) => p.id === 'pm'));

            // ---- Phase 2: BA ----
            await this.runAgent(PHASES.find((p) => p.id === 'ba'));

            // ---- Phase 3: Frontend + Backend (PARALLEL) ----
            logSeparator('⚡ PARALLEL DEV PHASE (Frontend + Backend)');
            const [frontendResult, backendResult] = await Promise.all([
                this.runAgent(PHASES.find((p) => p.id === 'frontend')),
                this.runAgent(PHASES.find((p) => p.id === 'backend')),
            ]);

            // ---- Phase 4: QA ----
            await this.runAgent(PHASES.find((p) => p.id === 'qa'));

            // ---- Phase 5: QC ----
            await this.runAgent(PHASES.find((p) => p.id === 'qc'));

            // ---- Phase 6: Release ----
            await this.runAgent(PHASES.find((p) => p.id === 'release'));

            // ---- Phase Final: Archivist ----
            await this.runArchivist();

            // ---- Summary ----
            this.printSummary(true);

        } catch (error) {
            log('💥', 'ORCHESTRATOR', `Pipeline FAILED: ${error.message}`, COLORS.red);
            this.printSummary(false);
            process.exit(1);
        }
    }

    // -------------------------------------------------------
    // Print Final Summary
    // -------------------------------------------------------
    printSummary(success) {
        const elapsed = ((Date.now() - this.state.startTime) / 1000).toFixed(1);

        logSeparator(success ? '✅ PIPELINE COMPLETED SUCCESSFULLY' : '❌ PIPELINE FAILED');

        console.log(`${COLORS.bold}📊 Results:${COLORS.reset}`);
        console.log(`   ⏱️  Total time: ${elapsed}s`);
        console.log('');

        for (const phase of PHASES) {
            const result = this.state.phaseResults[phase.id];
            if (result) {
                const statusIcon = result.status === 'passed' ? '✅' : '❌';
                console.log(`   ${statusIcon} ${phase.emoji} ${phase.name}: ${result.status} (${result.attempts} attempt${result.attempts > 1 ? 's' : ''})`);
                if (result.outputFile) console.log(`      📄 ${result.outputFile}`);
            } else {
                console.log(`   ⏭️  ${phase.emoji} ${phase.name}: skipped`);
            }
        }

        if (this.state.errors.length > 0) {
            console.log(`\n${COLORS.yellow}⚠️  Errors encountered: ${this.state.errors.length}${COLORS.reset}`);
            for (const err of this.state.errors) {
                console.log(`   - ${err.phase} (attempt ${err.attempt}): ${err.error.substring(0, 100)}`);
            }
        }

        console.log('');

        // Save state report
        const reportPath = path.join(this.projectDir, 'docs/pipeline-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            requirement: this.state.requirement,
            success,
            elapsed: `${elapsed}s`,
            phases: this.state.phaseResults,
            errors: this.state.errors,
            timestamp: new Date().toISOString(),
        }, null, 2), 'utf-8');
        log('📄', 'ORCHESTRATOR', `Report saved → docs/pipeline-report.json`, COLORS.white);
    }
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

const args = process.argv.slice(2);
const requirement = args.join(' ');

if (!requirement) {
    console.log(`
${COLORS.bold}${COLORS.cyan}🚀 AI Dev Team Orchestrator${COLORS.reset}

${COLORS.bold}Usage:${COLORS.reset}
  node orchestrator.js "<requirement>"

${COLORS.bold}Options:${COLORS.reset}
  --retries <n>    Max retries per phase (default: 3)
  --timeout <ms>   Timeout per agent in ms (default: 600000)
  --auto           Auto-proceed without asking for feedback after each phase
  --project <name> Execute isolated workspace inside projects/<name>/

${COLORS.bold}Examples:${COLORS.reset}
  node orchestrator.js --project school-app "Build school management app with login, dashboard, attendance"
  node orchestrator.js --auto --project wtf-dev "Xây dựng hệ thống quản lý trường học"

${COLORS.bold}Pipeline:${COLORS.reset}
  PM → BA → Frontend+Backend (parallel) → QA → QC → Release
`);
    process.exit(0);
}

// Parse options
const options = {};
const reqParts = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--retries' && args[i + 1]) {
        options.maxRetries = parseInt(args[++i]);
    } else if (args[i] === '--timeout' && args[i + 1]) {
        options.timeout = parseInt(args[++i]);
    } else if (args[i] === '--auto') {
        options.auto = true;
    } else if (args[i] === '--project' && args[i + 1]) {
        options.projectName = args[++i];
    } else {
        reqParts.push(args[i]);
    }
}

new DevTeam(options).pipeline(reqParts.join(' ')).catch(console.error);