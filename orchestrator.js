import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import http from 'http';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { DevTeamTUI } from './tui.js';
import { DevTeamDashboard } from './dashboard.js';
dotenv.config();

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

// ============================================================
// PHASE GATE VALIDATORS (OCP-compliant: each phase owns its validation)
// ============================================================

/**
 * @typedef {{ passed: boolean, reason: string }} GateResult
 */

/** @param {string} output @returns {GateResult} */
function validatePO(output) {
    const checks = [
        { name: 'Business Objectives', test: /business\s*objectives?|mục\s*tiêu/i.test(output) },
        { name: 'Tech Stack', test: /tech\s*stack|frontend|backend|database/i.test(output) },
        { name: 'User Stories', test: /user\s*stor(y|ies)|câu\s*chuyện/i.test(output) },
        { name: 'Data Models', test: /data\s*model|entity|schema|ERD/i.test(output) },
        { name: 'API Specs', test: /api|endpoint|POST|GET|PUT|DELETE/i.test(output) },
    ];
    const failed = checks.filter(c => !c.test);
    return { passed: failed.length === 0, reason: failed.map(f => `Missing: ${f.name}`).join(', ') };
}

/** @param {string} output @returns {GateResult} */
function validateDev(output) {
    const checks = [
        { name: 'Substantial output', test: output.length > 500 },
        { name: 'Files Created', test: /files?\s*created|src\/|components\//i.test(output) },
        { name: 'Build Status', test: /build|compile|✅|pass/i.test(output) },
    ];
    const failed = checks.filter(c => !c.test);
    return { passed: failed.length === 0, reason: failed.map(f => `Missing: ${f.name}`).join(', ') };
}

/** @param {string} output @returns {GateResult} */
function validateReviewer(output) {
    const checks = [
        { name: 'Review content', test: /review|quality|code|security|performance|architecture/i.test(output) },
        { name: 'Issue report', test: /issue|warning|critical|suggestion/i.test(output) },
        { name: 'Test Results', test: /test|build|pass|fail/i.test(output) },
    ];
    const failed = checks.filter(c => !c.test);
    return { passed: failed.length === 0, reason: failed.map(f => `Missing: ${f.name}`).join(', ') };
}

/** @param {string} output @returns {GateResult} */
function validateRelease(output) {
    const checks = [
        { name: 'Deploy URL or build artifact', test: /https?:\/\/|docker|dist\/|build\/|deployed/i.test(output) },
        { name: 'Review check confirmed', test: /review.*pass|reviewer.*ok|pre.?deploy|smoke\s*test/i.test(output) },
        { name: 'Version / Tag', test: /v\d+\.\d+\.\d+|version|tag|changelog/i.test(output) },
        { name: 'Git operations', test: /git|commit|push|branch|pull.?request|PR/i.test(output) },
    ];
    const failed = checks.filter(c => !c.test);
    return { passed: failed.length === 0, reason: failed.map(f => `Missing: ${f.name}`).join(', ') };
}

// ============================================================
// PHASE DEFINITIONS
// ============================================================

const PHASES = [
    {
        id: 'po',
        name: 'Product Owner',
        emoji: '🧠',
        cli: 'gemini',
        color: COLORS.blue,
        promptFile: 'agents/po-prompt.md',
        gateFile: 'agents/gates/po-gate.md',
        outputFile: 'docs/po-output.md',
        dependsOn: [],
        validate: validatePO,
    },
    // Dynamic Sub-agents will be generated here during runtime
    {
        id: 'reviewer',
        name: 'Code Reviewer',
        emoji: '🔍',
        cli: 'gemini',
        color: COLORS.magenta,
        promptFile: 'agents/reviewer-prompt.md',
        gateFile: 'agents/gates/reviewer-gate.md',
        outputFile: 'docs/reviewer-report.md',
        dependsOn: ['po'], // dynamic depends
        validate: validateReviewer,
    },
    {
        id: 'release',
        name: 'Release Manager',
        emoji: '🚀',
        cli: 'gemini',
        color: COLORS.green,
        promptFile: 'agents/release-prompt.md',
        gateFile: 'agents/gates/release-gate.md',
        outputFile: 'docs/release-report.md',
        dependsOn: ['reviewer'],
        validate: validateRelease,
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
        this.updateMode = options.update || false;
        this.fixMode = options.fix || false;
        this.flashMode = options.flash || false;
        this.tuiEnabled = options.tui || false;
        this.dashboardEnabled = options.dashboard || false;
        this.maxBudgetUsd = options.maxBudgetUsd || 0;
        this.totalCostUsd = 0;
        this.cliOverrides = options.cliOverrides || {};

        this.tuiInstance = null;
        this.dashboardInstance = null;

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
    // RAG Memory System (Gemini Embeddings)
    // -------------------------------------------------------
    async embedText(text) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing for RAG memory.");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/embedding-001',
                content: { parts: [{ text }] }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Embedding failed: ${err}`);
        }

        const data = await response.json();
        return data.embedding.values;
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    async retrieveRagContext(requirement) {
        const ragPath = path.join(this.engineDir, 'docs/rag-memory.json');
        if (!fs.existsSync(ragPath)) return '';

        log('🧠', 'RAG', 'Retrieving relevant past project memories...', COLORS.cyan);
        let memories = [];
        try {
            memories = JSON.parse(fs.readFileSync(ragPath, 'utf-8'));
        } catch (e) { return ''; }

        if (memories.length === 0) return '';

        const reqEmbedding = await this.embedText(requirement);

        const scoredMemories = memories.map(mem => ({
            ...mem,
            score: this.cosineSimilarity(reqEmbedding, mem.embedding)
        }));

        scoredMemories.sort((a, b) => b.score - a.score);
        const topMemories = scoredMemories.slice(0, 3);

        let contextStr = '';
        topMemories.forEach((mem) => {
            if (mem.score > 0.5) {
                contextStr += `[Related Past Project: ${mem.project} (Similarity: ${(mem.score * 100).toFixed(1)}%)]\n${mem.lesson}\n---\n`;
            }
        });

        if (contextStr) {
            log('✅', 'RAG', `Found ${topMemories.filter(m => m.score > 0.5).length} relevant memories.`, COLORS.green);
        }
        return contextStr;
    }

    // -------------------------------------------------------
    // CLI Execution
    // -------------------------------------------------------
    async runCLI(cli, prompt, timeout, phaseId = null) {
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
                args: ['-p', `"${shortInstruction}"`, '--output-format', 'text', '--dangerously-skip-permissions'],
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
                env: { ...process.env, AGENT_ID: phaseId },
                shell: true, // REQUIRED on Windows to find executables in PATH
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                // Stream output in real-time
                if (this.tuiEnabled && this.tuiInstance && (cli === 'claude' || (phaseId && this.tuiInstance))) {
                    this.tuiInstance.logToAgent(phaseId, chunk);
                } else if (!this.tuiInstance) {
                    process.stdout.write(chunk);
                }

                if (this.dashboardInstance && phaseId) {
                    this.dashboardInstance.logToAgent(phaseId, chunk);
                }
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

                // ----------------------------------------------------
                // [PHASE 3: ENTERPRISE] API Budget Manager (Token Tracking)
                // ----------------------------------------------------
                const inputTokens = Math.ceil(prompt.length / 4);
                const outputTokens = Math.ceil(stdout.length / 4);
                // Heuristic calculation (e.g. Gemini 1.5 Flash: $0.15/1M input, $0.60/1M output)
                const costUsd = (inputTokens * 0.15 + outputTokens * 0.60) / 1000000;
                this.totalCostUsd += costUsd;

                if (this.dashboardInstance) {
                    this.dashboardInstance.updateBudget(this.totalCostUsd);
                }

                if (this.maxBudgetUsd > 0 && this.totalCostUsd > this.maxBudgetUsd) {
                    if (this.tuiInstance) {
                        this.tuiInstance.updateStatus(`[Alert] Budget Exceeded! Limit $${this.maxBudgetUsd}, Spent: $${this.totalCostUsd.toFixed(4)}`);
                    }
                    if (this.dashboardInstance) {
                        this.dashboardInstance.updateStatus(`🚨 [Alert] Budget Exceeded! Limit $${this.maxBudgetUsd}, Spent: $${this.totalCostUsd.toFixed(4)}`);
                    }
                    console.log(`\n${COLORS.bold}${COLORS.red}⛔ KẾ TOÁN AI KHÓA TÀI KHOẢN: Cảnh báo vỡ nợ ngân sách!${COLORS.reset}`);
                    console.log(`${COLORS.red}Bạn chỉ cấp tối đa $${this.maxBudgetUsd}, nhưng hệ thống đã tiêu thụ $${this.totalCostUsd.toFixed(4)}. Pipeline bị đình chỉ khẩn cấp.${COLORS.reset}\n`);
                    reject(new Error(`[BUDGET EXCEEDED] Halted. Spent $${this.totalCostUsd.toFixed(4)} > Limit $${this.maxBudgetUsd}`));
                    return;
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
    checkGate(phase, output) {
        // Check for explicit rejection first (always wins)
        const rejectSignals = ['REJECTED', 'FAIL', '\u274C'];
        const hasReject = rejectSignals.some((s) => output.toUpperCase().includes(s));
        if (hasReject) {
            return { passed: false, reason: 'Output contains explicit REJECT/FAIL signal' };
        }

        // Check APPROVED signal
        const approvalSignals = ['APPROVED', 'PASS', '\u2705'];
        const hasApproval = approvalSignals.some((s) => output.toUpperCase().includes(s));

        // Delegate to phase-owned validator (OCP: open to extension via PHASES config)
        const phaseResult = phase.validate ? phase.validate(output) : { passed: true, reason: '' };

        // Gate passes if: has explicit approval signal AND phase-specific validation passes
        // (both required — prevents sycophantic APPROVED without real content)
        const finalPassed = hasApproval && phaseResult.passed;

        return {
            passed: finalPassed,
            reason: finalPassed ? '' : (
                !hasApproval ? 'Missing APPROVED signal in output' :
                    phaseResult.reason || 'Phase validation failed'
            ),
        };
    }

    getGateFileName(phaseId) {
        const mapping = {
            po: 'po-gate.md',
            frontend: 'dev-gate.md',
            backend: 'dev-gate.md',
            reviewer: 'reviewer-gate.md',
            release: 'release-gate.md',
        };
        return mapping[phaseId] || `${phaseId}-gate.md`;
    }

    // -------------------------------------------------------
    // Smart context chunking: keep head + tail of long outputs
    // This preserves BOTH the overview (head) and API specs (tail)
    // -------------------------------------------------------
    smartChunk(text, maxChars = 6000) {
        if (text.length <= maxChars) return text;
        const half = Math.floor(maxChars / 2);
        const head = text.substring(0, half);
        const tail = text.substring(text.length - half);
        return `${head}\n\n[... ${text.length - maxChars} chars truncated for context limit ...]\n\n${tail}`;
    }

    // -------------------------------------------------------
    // Skills Injection (Inspired by Strix)
    // -------------------------------------------------------
    injectSkills(techStackContent) {
        const skillsDir = path.join(this.engineDir, 'agents/skills');
        if (!fs.existsSync(skillsDir)) return '';

        let injectedContent = '\n\n## 🥋 SPECIALIZED SKILLS INJECTED\nCác kỹ năng chuyên biệt sau đây đã được cài đặt vào hệ thống dựa trên Tech Stack của dự án:\n\n';
        const stackLower = techStackContent.toLowerCase();
        let skillsLoaded = false;

        const skillMapping = {
            'react': 'react-performance.md',
            'next': 'react-performance.md',
            'node': 'node-security.md',
            'express': 'node-security.md',
            'nest': 'node-security.md',
        };

        const addedFiles = new Set();

        for (const [keyword, file] of Object.entries(skillMapping)) {
            if (stackLower.includes(keyword) && !addedFiles.has(file)) {
                const skillFile = path.join(skillsDir, file);
                if (fs.existsSync(skillFile)) {
                    injectedContent += `### [Skill Group: ${file}]\n${fs.readFileSync(skillFile, 'utf-8')}\n\n`;
                    skillsLoaded = true;
                    addedFiles.add(file);
                }
            }
        }

        // Always inject clean-architecture if exists
        const cleanArchFile = path.join(skillsDir, 'clean-architecture.md');
        if (fs.existsSync(cleanArchFile) && !addedFiles.has('clean-architecture.md')) {
            injectedContent += `### [Skill Group: clean-architecture.md]\n${fs.readFileSync(cleanArchFile, 'utf-8')}\n\n`;
            skillsLoaded = true;
        }

        return skillsLoaded ? injectedContent : '';
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

        // Dynamic Sub-agent Injection
        if (phase.focus) {
            basePrompt = basePrompt.replace(/\{\{FOCUS\}\}/g, phase.focus);
            basePrompt = basePrompt.replace(/\{\{AGENT_NAME\}\}/g, phase.name);
            basePrompt = basePrompt.replace(/\{\{AGENT_ID\}\}/g, phase.id);
            if (phase.activeAgents) {
                basePrompt = basePrompt.replace(/\{\{ACTIVE_AGENTS\}\}/g, phase.activeAgents);
            }
        }

        // Apply Speed Override for Coder agents in --flash mode
        if (this.flashMode && (phase.id === 'frontend' || phase.id === 'backend')) {
            basePrompt += `\n\n> [!IMPORTANT]\n> CRITICAL OVERRIDE (--flash mode):\n> SPEED & CONCISENESS FIRST. Focus on the absolute Core MVP. Create minimal viable boilerplate. Group file creations together to minimize conversational turns. Do not over-engineer. Execute as fast as possible.\n\n`;
        }

        // Apply Update/Fix mode instructions
        if ((this.updateMode || this.fixMode) && (phase.id === 'frontend' || phase.id === 'backend')) {
            basePrompt += `\n\n> [!IMPORTANT]\n> CRITICAL OVERRIDE (UPDATE/FIX MODE):\n> You are modifying an EXISTING project. DO NOT generate the app from scratch. Use MCP tools to read the existing files in the workspace, apply precisely the changes requested, and do not break existing functionality.\n\n`;
        }

        // Gather context from dependencies
        let context = `\n\n## PROJECT CONTEXT\n`;
        context += `**Original Requirement**: ${this.state.requirement}\n\n`;

        // Inject Knowledge Base via RAG (if retrieved)
        if (this.state.ragContext) {
            context += `## 🧠 KNOWLEDGE BASE (RELATED PAST PROJECTS)\nRead and strictly apply these past lessons to the current project:\n${this.state.ragContext}\n\n`;
        } else {
            // Fallback to global knowledge-base.md
            const kbPath = path.join(this.engineDir, 'docs/knowledge-base.md');
            if (fs.existsSync(kbPath)) {
                context += `## 🧠 KNOWLEDGE BASE (LESSONS LEARNED)\nRead and strictly avoid repeating these past mistakes:\n${fs.readFileSync(kbPath, 'utf-8')}\n\n`;
            }
        }

        for (const dep of phase.dependsOn) {
            const depOutput = this.state.artifacts[dep];
            if (depOutput) {
                const depPhase = PHASES.find((p) => p.id === dep);
                // Smart chunking: keep head + tail so API specs at end are not lost
                context += `### ${depPhase.name} Output:\n${this.smartChunk(depOutput, 6000)}\n\n`;
            }
        }

        // Gate checklist
        const gatePath = path.join(this.engineDir, phase.gateFile);
        let gateInfo = '';
        if (fs.existsSync(gatePath)) {
            gateInfo = `\n\n## QUALITY GATE (Must meet ALL criteria):\n${fs.readFileSync(gatePath, 'utf-8')}\n`;
        }

        // Skills Injection (for Reviewer)
        let skillsSection = '';
        if (phase.id === 'reviewer' && this.state.artifacts['po']) {
            skillsSection = this.injectSkills(this.state.artifacts['po']);
        }

        let feedbackSection = '';
        if (userFeedback) {
            feedbackSection = `\n\n## YÊU CẦU ĐIỀU CHỈNH TỪ NGƯỜI DÙNG (USER FEEDBACK):\nNgười dùng đã xem xét kết quả trước đó của bạn và yêu cầu bạn sửa lại theo ý kiến sau:\n>>> "${userFeedback}" <<<\n\nVui lòng tiếp thu và cập nhật lại toàn bộ output của bạn.\n`;
        }

        return `${basePrompt}${context}${skillsSection}${gateInfo}${feedbackSection}\n\nIMPORTANT: End your output with "APPROVED" if all quality criteria are met.`;
    }

    // -------------------------------------------------------
    // Run a single agent with retry & interactive feedback
    // -------------------------------------------------------
    async runAgent(phase) {
        const targetCli = this.cliOverrides[phase.id]
            || process.env[`${phase.id.toUpperCase()}_CLI`]
            || phase.cli;

        if (!this.tuiInstance) {
            logSeparator(`${phase.emoji} ${phase.name} (${targetCli.toUpperCase()})`);
        }

        // Dashboard: mark phase as running
        if (this.dashboardInstance) {
            this.dashboardInstance.updatePhaseStatus(phase.id, 'running');
            this.dashboardInstance.updateStatus(`${phase.emoji} ${phase.name} — Running (${targetCli})...`);
        }

        const phaseStart = Date.now();
        let currentFeedback = '';
        let loopCount = 1;

        while (true) {
            const prompt = this.buildPrompt(phase, currentFeedback);
            let finalOutput = null;
            let gatePassed = false;

            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    if (!this.tuiInstance) {
                        log(phase.emoji, phase.name, `Run ${loopCount} - Attempt ${attempt}/${this.maxRetries}...`, phase.color);
                    } else if (phase.parallel === 'dev') {
                        this.tuiInstance.updateStatus(`PARALLEL DEV: Running ${phase.name} (Attempt ${attempt}/${this.maxRetries})`);
                    }

                    // Pass phase.id specifically for tui routing
                    const output = await this.runCLI(targetCli, prompt, undefined, phase.id);

                    // Save artifact
                    const outputPath = path.join(this.projectDir, phase.outputFile);
                    const outputDir = path.dirname(outputPath);
                    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
                    fs.writeFileSync(outputPath, output, 'utf-8');

                    log(phase.emoji, phase.name, `Output saved → ${phase.outputFile}`, phase.color);

                    // Quality Gate — pass full phase object for OCP delegate
                    const gateResult = this.checkGate(phase, output);
                    logGate(phase.id, gateResult.passed, gateResult.reason);

                    if (gateResult.passed) {
                        // Collect locally — merge to shared state at the end
                        // (prevents race condition in Promise.all parallel phases)
                        finalOutput = output;
                        gatePassed = true;
                        if (this.dashboardInstance) {
                            const elapsedSec = ((Date.now() - phaseStart) / 1000).toFixed(0) + 's';
                            this.dashboardInstance.updatePhaseStatus(phase.id, 'passed', elapsedSec);
                        }
                        break; // exit retry loop
                    }

                    // Gate failed → retry
                    log('🔄', phase.name, `Gate failed. ${gateResult.reason}. Retrying...`, COLORS.yellow);

                } catch (error) {
                    log('\u274c', phase.name, `Error: ${error.message}`, COLORS.red);
                    // Accumulate errors locally to avoid concurrent writes in parallel phases
                    const errEntry = { phase: phase.id, attempt, error: error.message };

                    // Watchdog: Check global fail count (guarded with lock for parallel safety)
                    this.globalRetries = (this.globalRetries || 0) + 1;
                    if (this.globalRetries > 5) {
                        console.log(`\n${COLORS.bold}${COLORS.red}\u26a0\ufe0f WATCHDOG ALERT: Pipeline is failing frequently!${COLORS.reset}`);
                        const action = await this.promptUser(`> Type 'kill' to abort, 'skip' to bypass this phase, or Enter to continue: `);
                        if (action.toLowerCase() === 'kill') throw new Error('Aborted by user watchdog.');
                        if (action.toLowerCase() === 'skip') {
                            this.globalRetries = 0;
                            log('\u23ed\ufe0f', phase.name, 'Skipped by user', COLORS.yellow);
                            // Merge error before returning
                            this.state.errors.push(errEntry);
                            return null;
                        }
                        this.globalRetries = 0;
                    }

                    if (attempt === this.maxRetries) {
                        // Merge error to shared state only on final failure
                        this.state.errors.push(errEntry);
                        this.state.phaseResults[phase.id] = { status: 'failed', attempts: attempt, error: error.message };
                        if (this.dashboardInstance) {
                            this.dashboardInstance.updatePhaseStatus(phase.id, 'failed');
                            this.dashboardInstance.updateStatus(`❌ ${phase.name} FAILED after ${this.maxRetries} attempts`);
                        }
                        throw new Error(`${phase.name} failed after ${this.maxRetries} attempts: ${error.message}`);
                    }

                    this.state.errors.push(errEntry);
                    log('\ud83d\udd04', phase.name, `Waiting 5s before retry...`, COLORS.yellow);
                    await new Promise((r) => setTimeout(r, 5000));
                }
            }

            // Interactive Feedback Loop
            if (gatePassed) {
                // Merge to shared state HERE — after retry loop, safe for both serial and parallel
                this.state.artifacts[phase.id] = finalOutput;
                this.state.phaseResults[phase.id] = {
                    status: 'passed',
                    attempts: loopCount,
                    outputFile: phase.outputFile,
                };

                if (this.auto) {
                    log('\ud83d\ude80', 'ORCHESTRATOR', `Phase ${phase.name} approved automatically (--auto). Proceeding...`, COLORS.green);
                    return finalOutput;
                }

                console.log(`\n${COLORS.bold}${COLORS.magenta}\ud83e\udd14 PHASE COMPLETE: ${phase.name}${COLORS.reset}`);
                console.log(`${COLORS.yellow}B\u1ea1n c\u00f3 mu\u1ed1n \u0111i\u1ec1u ch\u1ec9nh g\u00ec kh\u00f4ng?${COLORS.reset}`);
                console.log(`- Nh\u1eadp y\u00eau c\u1ea7u \u0111\u1ec3 b\u1eaft Agent s\u1eeda l\u1ea1i (VD: "Th\u00eam t\u00ednh n\u0103ng X v\u00e0o PRD").`);
                console.log(`- \u0110\u1ec3 tr\u1ed1ng ho\u1eb7c g\u00f5 "pass" r\u1ed3i nh\u1ea5n Enter \u0111\u1ec3 ch\u1ed1t v\u00e0 \u0110I TI\u1ebeP.`);

                const answer = await this.promptUser(`\n${COLORS.bold}Feedback:${COLORS.reset} `);

                if (!answer || answer.toLowerCase() === 'pass') {
                    log('\ud83d\ude80', 'ORCHESTRATOR', `Phase ${phase.name} approved by user. Proceeding...`, COLORS.green);
                    return finalOutput;
                } else {
                    log('\ud83d\udd04', 'ORCHESTRATOR', `Received feedback. Asking ${phase.name} to revise...`, COLORS.cyan);
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
        // Minimum exchange guard: Coordinator must ask at least 1 question and
        // receive 1 user reply before it may emit [ACTION: PROCEED_TO_PM].
        // This prevents sycophantic early "all clear" on the very first turn.
        let exchangeCount = 0;

        // Skip interactive coordinator in Auto mode
        if (this.auto) return initialRequirement;

        while (true) {
            const minExchangeNote = exchangeCount === 0
                ? '\n\n[SYSTEM NOTE: This is the FIRST turn. You MUST ask clarifying questions. Do NOT emit [ACTION: PROCEED_TO_PM] yet.]'
                : '';
            const fullPrompt = `${basePrompt}\n\n## CONVERSATION HISTORY\n${conversationHistory}${minExchangeNote}\n\nCoordinator (phản hồi ngắn gọn, NHỚ in ra [ACTION: PROCEED_TO_PM] khi đã chốt xong toàn bộ yêu cầu và đã có ít nhất 1 vòng hỏi-đáp):`;
            log('👑', 'COORDINATOR', `Thinking... (exchange #${exchangeCount + 1})`, COLORS.cyan);

            console.log(`\n${COLORS.bold}${COLORS.cyan}👑 COORDINATOR:${COLORS.reset}`);
            const output = await this.runCLI('gemini', fullPrompt);
            console.log('\n');

            // Only allow PROCEED after at least 1 real exchange
            if (exchangeCount >= 1 && output.includes('[ACTION: PROCEED_TO_PM]')) {
                fs.writeFileSync(path.join(this.projectDir, 'docs/final-requirement.md'), output, 'utf-8');
                log('✅', 'COORDINATOR', 'Requirement finalized → docs/final-requirement.md', COLORS.green);
                return "Read docs/final-requirement.md for the full finalized project specifications.";
            } else if (exchangeCount === 0 && output.includes('[ACTION: PROCEED_TO_PM]')) {
                log('⚠️', 'COORDINATOR', 'Ignored early PROCEED_TO_PM (min 1 exchange required). Asking user anyway...', COLORS.yellow);
            }

            const answer = await this.promptUser(`\n${COLORS.bold}Bạn:${COLORS.reset} `);
            conversationHistory += `Coordinator: ${output}\nUser: ${answer}\n`;
            exchangeCount++;
        }
    }

    // -------------------------------------------------------
    // Phase Final: Archivist
    // -------------------------------------------------------
    async runArchivist() {
        logSeparator('📚 ARCHIVIST (Phase Final & RAG)');
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

        const explicitPrompt = `${basePrompt}\n\nIMPORTANT INSTRUCTION: You MUST output ONLY the raw markdown text of the lessons learned and key technical decisions. Do NOT output anything else. Do not use write_file tools. Just output the summary directly to stdout. It should be concise and highly valuable for future projects.`;
        const summary = await this.runCLI('gemini', `${explicitPrompt}${context}`);
        console.log('\n');

        if (summary) {
            // Embed and save to RAG Local JSON DB
            try {
                log('🧠', 'RAG', 'Embedding project knowledge into vector memory...', COLORS.cyan);
                const embedding = await this.embedText(summary);

                const ragPath = path.join(this.engineDir, 'docs/rag-memory.json');
                let memories = [];
                if (fs.existsSync(ragPath)) {
                    try { memories = JSON.parse(fs.readFileSync(ragPath, 'utf-8')); } catch (e) { }
                }

                memories.push({
                    project: this.projectName,
                    timestamp: new Date().toISOString(),
                    requirement: this.state.requirement,
                    lesson: summary,
                    embedding: embedding
                });

                fs.writeFileSync(ragPath, JSON.stringify(memories), 'utf-8');
                log('✅', 'RAG', 'Project knowledge saved to vector database.', COLORS.green);

                // For backward compatibility, also append to knowledge-base.md
                const kbPath = path.join(this.engineDir, 'docs/knowledge-base.md');
                fs.appendFileSync(kbPath, `\n\n## Project: ${this.projectName}\n${summary}`, 'utf-8');
            } catch (e) {
                log('⚠️', 'RAG', `Failed to save RAG memory: ${e.message}`, COLORS.yellow);
            }
        }

        log('🗑️', 'CLEANUP', 'Removing temporary files...', COLORS.yellow);
        const tempDir = path.join(this.projectDir, '.tmp');
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            log('✅', 'CLEANUP', 'Temporary files removed.', COLORS.green);
        }
    }

    // -------------------------------------------------------
    // State Hydration for Update/Fix modes
    // -------------------------------------------------------
    hydrateState() {
        if (!this.updateMode && !this.fixMode) return;

        log('💧', 'ORCHESTRATOR', `Hydrating state from existing project for ${this.updateMode ? 'UPDATE' : 'FIX'} mode...`, COLORS.blue);

        const poPath = path.join(this.projectDir, 'docs/po-output.md');

        if (fs.existsSync(poPath)) {
            this.state.artifacts['po'] = fs.readFileSync(poPath, 'utf-8');
            log('✅', 'STATE', `Loaded PO Output`);
        }

        if (this.updateMode) {
            this.state.requirement = `UPDATE REQUIREMENT: ${this.state.requirement}`;
        } else if (this.fixMode) {
            this.state.requirement = `FIX REQUIREMENT: ${this.state.requirement}`;
        }
    }

    // -------------------------------------------------------
    // Main Pipeline
    // -------------------------------------------------------
    async pipeline(initialRequirement) {
        this.printHeader();

        // Auto-Setup Check
        const mcpDistPath = path.join(this.engineDir, 'mcp-server/dist/index.js').replace(/\\/g, '/');
        if (!fs.existsSync(mcpDistPath)) {
            log('⚠️', 'SYSTEM', 'MCP Server not built or missing dependencies. Running Auto-Setup...', COLORS.yellow);
            try {
                execSync('npm run setup', { stdio: 'inherit', cwd: this.engineDir });
            } catch (e) {
                log('❌', 'SYSTEM', 'Auto-Setup failed. Please run "npm run setup" manually.', COLORS.red);
            }
        }

        console.log(`\n${COLORS.bold}${COLORS.yellow}⚠️  REMINDER: Please ensure you are logged into your AI CLIs!${COLORS.reset}`);
        console.log(`   Run: ${COLORS.cyan}gemini login${COLORS.reset}, ${COLORS.cyan}qwen login${COLORS.reset}, ${COLORS.cyan}copilot login${COLORS.reset}, ${COLORS.cyan}stitch-mcp login${COLORS.reset}\n`);

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
        const requirement = (this.updateMode || this.fixMode) ? initialRequirement : await this.runCoordinator(initialRequirement);

        this.state.requirement = requirement;
        this.state.startTime = Date.now();

        log('📝', 'ORCHESTRATOR', `Requirement Confirmed: ${requirement}`, COLORS.bold);
        log('⚙️', 'ORCHESTRATOR', `Max retries: ${this.maxRetries} | Timeout: ${this.timeout / 1000}s`, COLORS.white);

        try {
            this.hydrateState();

            // Retrieve RAG Context
            try {
                this.state.ragContext = await this.retrieveRagContext(this.state.requirement);
            } catch (e) {
                log('⚠️', 'RAG', `Failed to retrieve RAG memories: ${e.message}`, COLORS.yellow);
                this.state.ragContext = '';
            }

            // ---- Init Dashboard (early) with known phases ----
            if (this.dashboardEnabled && !this.dashboardInstance) {
                const knownPhases = [
                    { id: 'po',       name: 'Product Owner',   emoji: '🧠', cli: 'gemini' },
                    { id: '_dev',     name: 'Dev Phase',        emoji: '⚡', cli: '...' },
                    { id: 'reviewer', name: 'Code Reviewer',   emoji: '🔍', cli: 'gemini' },
                    { id: 'release',  name: 'Release Manager', emoji: '🚀', cli: 'gemini' },
                    { id: 'archivist',name: 'Archivist',       emoji: '📚', cli: 'gemini' },
                ];
                this.dashboardInstance = new DevTeamDashboard(this.projectName, knownPhases, this.maxBudgetUsd);
            }

            if (this.fixMode) {
                log('⏩', 'ORCHESTRATOR', `FIX Mode: Bypassing PO phase.`, COLORS.cyan);
            } else {
                // ---- Phase 1: Product Owner (PO) ----
                await this.runAgent(PHASES.find((p) => p.id === 'po'));
            }

            // EXTRACT DYNAMIC SUB-AGENTS FROM PO OUTPUT
            let subAgents = [];
            try {
                const poOutput = this.state.artifacts['po'] || '';
                const jsonMatch = poOutput.match(/```json([\s\S]*?)```/);
                if (jsonMatch) {
                    subAgents = JSON.parse(jsonMatch[1]);
                }
            } catch (e) {
                console.warn(`${COLORS.yellow}Failed to parse delegation-plan.json. Falling back to default single agent.${COLORS.reset}`, e);
            }
            if (!subAgents || subAgents.length === 0) {
                subAgents = [{ id: 'fullstack_dev', name: 'Fullstack Developer', focus: 'Lập trình toàn bộ source code (Frontend và Backend)' }];
            }

            // ---- Phase 2: Dynamic Sub-agents (PARALLEL) ----
            if (this.tuiEnabled) {
                this.tuiInstance = new DevTeamTUI(this.projectName, subAgents);
                // Pause slightly so screen renders before logs flood
                await new Promise((r) => setTimeout(r, 500));
            } else {
                logSeparator(`⚡ PARALLEL DEV PHASE (${subAgents.length} Sub-agents)`);
            }

            if (this.dashboardEnabled) {
                if (!this.dashboardInstance) {
                    // Fallback: create dashboard now if not already created
                    this.dashboardInstance = new DevTeamDashboard(this.projectName, subAgents, this.maxBudgetUsd);
                } else {
                    // Update the agent list with real sub-agents now that we know them
                    const fullAgents = [
                        { id: 'po',        name: 'Product Owner',   emoji: '🧠', cli: 'gemini' },
                        ...subAgents.map((a) => {
                            const idL = a.id.toLowerCase();
                            let cli = process.env.CODER_CLI || 'claude';
                            if (idL.includes('front') || idL.includes('ui')) cli = process.env.FRONTEND_CLI || cli;
                            if (idL.includes('back') || idL.includes('api') || idL.includes('db')) cli = process.env.BACKEND_CLI || cli;
                            return { id: a.id, name: a.name, emoji: '👨‍💻', cli, parallel: 'dev' };
                        }),
                        { id: 'reviewer',  name: 'Code Reviewer',   emoji: '🔍', cli: 'gemini' },
                        { id: 'release',   name: 'Release Manager', emoji: '🚀', cli: 'gemini' },
                        { id: 'archivist', name: 'Archivist',       emoji: '📚', cli: 'gemini' },
                    ];
                    this.dashboardInstance.agents = fullAgents;
                    this.dashboardInstance.broadcast('agents_updated', { agents: fullAgents });
                }
                this.dashboardInstance.updateStatus('⚡ PARALLEL DEV PHASE Started...');
            }

            const activeAgentsStr = subAgents.map(a => a.id).join(', ');
            const dynamicPhases = subAgents.map((agent, index) => {
                const colorsArr = [COLORS.cyan, COLORS.yellow, COLORS.magenta, COLORS.green, COLORS.blue];

                let defaultCli = process.env.CODER_CLI || 'claude';
                const idLower = agent.id.toLowerCase();
                if (idLower.includes('front') || idLower.includes('ui')) defaultCli = process.env.FRONTEND_CLI || defaultCli;
                if (idLower.includes('back') || idLower.includes('api') || idLower.includes('db')) defaultCli = process.env.BACKEND_CLI || defaultCli;

                return {
                    id: agent.id,
                    name: agent.name,
                    emoji: '👨‍💻',
                    cli: defaultCli, // Smart fallback to Env vars
                    color: colorsArr[index % colorsArr.length],
                    promptFile: 'agents/coder-prompt.md',
                    gateFile: 'agents/gates/dev-gate.md',
                    outputFile: `docs/${agent.id}-output.md`,
                    dependsOn: ['po'],
                    parallel: 'dev',
                    focus: agent.focus,
                    activeAgents: activeAgentsStr,
                    validate: validateDev,
                };
            });

            // Run all sub-agents simultaneously
            await Promise.all(dynamicPhases.map(phase => this.runAgent(phase)));

            // Shutdown TUI when dev phase ends to return interactive terminal
            if (this.tuiInstance) {
                this.tuiInstance.updateStatus('✅ PARALLEL DEV COMPLETED. Shutting down UI...');
                await new Promise((r) => setTimeout(r, 1000));
                this.tuiInstance.destroy();
                this.tuiInstance = null;
                console.log(`\n${COLORS.bold}${COLORS.green}✅ PARALLEL DEV COMPLETED SUCCESSFULLY.${COLORS.reset}\n`);
            }
            if (this.dashboardInstance) {
                this.dashboardInstance.updateStatus('✅ PARALLEL DEV COMPLETED.');
                // We keep dashboard alive to view the final summary
            }

            // ---- Phase 3: Code Reviewer ----
            await this.runAgent(PHASES.find((p) => p.id === 'reviewer'));

            // ---- Phase 4: Release ----
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
  --budget <usd>   Max budget in USD (kills pipeline if API cost exceeds this limit)
  --auto           Auto-proceed without asking for feedback after each phase
  --tui            Enable Terminal Split UI during Parallel Dev Phase
  --dashboard      Enable Web Dashboard (localhost:3000) during Dev Phase
  --project <name> Execute isolated workspace inside projects/<name>/
  --update         Update existing project (runs PM → BA → Dev)
  --fix            Fix existing project (bypasses PM & BA, jumps to Dev)
  --flash          Speed override: forces Coder agents to build Core MVP fast
  --daemon         Run as a background HTTP server (port 8080) queuing projects

${COLORS.bold}Examples:${COLORS.reset}
  node orchestrator.js --project school-app "Build school app"
  node orchestrator.js --project wtf-dev --fix "Form login bị lỗi CORS"
  node orchestrator.js --project wtf-dev --update "Thêm báo cáo PDF"
  node orchestrator.js --daemon

${COLORS.bold}Pipeline:${COLORS.reset}
  PO → Frontend+Backend (parallel) → Reviewer → Release
`);
    process.exit(0);
}

const options = {};
const reqParts = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--retries' && args[i + 1]) {
        options.maxRetries = parseInt(args[++i]);
    } else if (args[i] === '--timeout' && args[i + 1]) {
        options.timeout = parseInt(args[++i]);
    } else if (args[i] === '--auto') {
        options.auto = true;
    } else if (args[i] === '--update') {
        options.update = true;
    } else if (args[i] === '--fix') {
        options.fix = true;
    } else if (args[i] === '--flash') {
        options.flash = true;
    } else if (args[i] === '--tui') {
        options.tui = true;
    } else if (args[i] === '--dashboard') {
        options.dashboard = true;
    } else if (args[i] === '--daemon') {
        options.daemon = true;
    } else if (args[i] === '--budget' && args[i + 1]) {
        options.maxBudgetUsd = parseFloat(args[++i]);
    } else if (args[i] === '--project' && args[i + 1]) {
        options.projectName = args[++i];
    } else if (args[i].endsWith('-cli') && args[i].startsWith('--') && args[i + 1]) {
        const phaseId = args[i].substring(2, args[i].length - 4);
        options.cliOverrides = options.cliOverrides || {};
        options.cliOverrides[phaseId] = args[++i];
    } else {
        reqParts.push(args[i]);
    }
}

const finalRequirement = reqParts.join(' ');

if (options.daemon) {
    // -------------------------------------------------------
    // HTTP SERVER DAEMON (Queue System)
    // -------------------------------------------------------
    const queue = [];
    let isProcessing = false;

    const processQueue = async () => {
        if (isProcessing || queue.length === 0) return;
        isProcessing = true;
        const task = queue.shift();

        console.log(`\n\n${COLORS.bold}${COLORS.magenta}🚀 DAEMON: Starting Project [${task.projectName}]${COLORS.reset}`);

        try {
            // Force auto mode for daemon
            const taskOpts = { ...task.options, auto: true };
            const team = new DevTeam(taskOpts);
            await team.pipeline(task.requirement);
            console.log(`\n${COLORS.bold}${COLORS.green}✅ DAEMON: Project [${task.projectName}] Completed.${COLORS.reset}\n`);
        } catch (err) {
            console.error(`\n${COLORS.bold}${COLORS.red}❌ DAEMON: Project [${task.projectName}] Failed: ${err.message}${COLORS.reset}\n`);
        } finally {
            isProcessing = false;
            // Process next tick
            setTimeout(processQueue, 1000);
        }
    };

    // -------------------------------------------------------
    // TELEGRAM LONG POLLING BOT
    // -------------------------------------------------------
    const runTelegramPolling = async () => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const approveId = process.env.TELEGRAM_APPROVE_ID;
        if (!token || !approveId) {
            console.log(`\n${COLORS.yellow}⚠️ TELEGRAM_BOT_TOKEN or TELEGRAM_APPROVE_ID missing. Telegram Bot disabled.${COLORS.reset}`);
            return;
        }

        console.log(`\n${COLORS.cyan}🤖 Telegram Bot polling started. Listening for commands...${COLORS.reset}`);

        let offset = 0;

        const sendTgMessage = async (text) => {
            try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: approveId, text })
                });
            } catch (e) {
                console.error("Failed to send TG message:", e.message);
            }
        };

        const downloadTgFile = async (fileId) => {
            try {
                const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
                const data = await res.json();
                if (!data.ok) return null;

                const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${data.result.file_path}`);
                return await fileRes.text();
            } catch (e) {
                return null;
            }
        };

        // Override DevTeam console.log to also send Telegram messages on start/finish
        const originalLog = console.log;

        const poll = async () => {
            try {
                const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`);
                if (!res.ok) throw new Error("Telegram API Error");
                const data = await res.json();

                if (data.ok && data.result.length > 0) {
                    for (const update of data.result) {
                        offset = update.update_id + 1;
                        if (!update.message || !update.message.text && !update.message.document) continue;

                        const chatId = update.message.chat.id.toString();
                        if (chatId !== approveId) {
                            console.log(`\n${COLORS.red}⛔ Blocked unauthorized Telegram message from Chat ID: ${chatId}${COLORS.reset}`);
                            continue;
                        }

                        let textMsg = update.message.text || update.message.caption || "";
                        let fileContent = "";

                        // Handle Document (TXT/MD)
                        if (update.message.document) {
                            const doc = update.message.document;
                            if (doc.file_name.endsWith('.txt') || doc.file_name.endsWith('.md')) {
                                sendTgMessage(`⬇️ Đang tải tệp đính kèm: ${doc.file_name}...`);
                                fileContent = await downloadTgFile(doc.file_id);
                                if (fileContent) {
                                    sendTgMessage(`✅ Đã đọc thành công tệp đính kèm (${fileContent.length} ký tự).`);
                                }
                            } else {
                                sendTgMessage(`⚠️ AI Dev Team chỉ hỗ trợ đọc file .txt và .md.`);
                            }
                        }

                        // Parse Commands
                        let cmd = "/build"; // Default
                        let project = `telegram-app-${Date.now()}`;
                        let req = textMsg;

                        const parts = textMsg.trim().split(/\s+/);
                        if (parts[0] && parts[0].startsWith('/')) {
                            cmd = parts[0];
                            if (parts.length > 1) project = parts[1];
                            req = parts.slice(2).join(' ');
                        }

                        if (fileContent) {
                            req = `${req}\n\n[FILE ATTACHMENT CONTENT]:\n${fileContent}`;
                        }

                        if (!req.trim()) {
                            sendTgMessage(`❌ Thiếu Requirement! Cú pháp: ${cmd} [tên-dự-án] [yêu-cầu-chi-tiết]`);
                            continue;
                        }

                        let qOptions = { projectName: project, update: false, fix: false, flash: false };
                        let actionName = "XÂY DỰNG MỚI";

                        if (cmd === '/flash') {
                            qOptions.flash = true;
                            actionName = "⚡ TỐC ĐỘ (FLASH)";
                        } else if (cmd === '/update') {
                            qOptions.update = true;
                            actionName = "🔄 CẬP NHẬT TÍNH NĂNG";
                        } else if (cmd === '/fix') {
                            qOptions.fix = true;
                            actionName = "🛠 FIX BUG";
                        }

                        sendTgMessage(`🚀 Đã nhận yêu cầu: ${actionName}\n📁 Dự án: ${project}\n⌛ Đang đẩy vào hàng đợi (Vị trí: ${queue.length + 1})`);

                        queue.push({
                            projectName: project,
                            requirement: req,
                            options: qOptions
                        });

                        processQueue();
                    }
                }
            } catch (e) {
                // Ignore timeout fetches
            } finally {
                setTimeout(poll, 1000);
            }
        };

        poll();
    };

    const server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/enqueue') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const payload = JSON.parse(body);
                    if (!payload.requirement) {
                        res.writeHead(400);
                        res.end('Missing requirement');
                        return;
                    }

                    const projectName = payload.project || `project-${Date.now()}`;
                    queue.push({
                        projectName,
                        requirement: payload.requirement,
                        options: {
                            projectName,
                            update: payload.update || false,
                            fix: payload.fix || false,
                            flash: payload.flash || false,
                        }
                    });

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'queued', queueLength: queue.length, project: projectName }));

                    // Trigger queue processor
                    processQueue();
                } catch (e) {
                    res.writeHead(400);
                    res.end('Invalid JSON');
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not found. Use POST /enqueue');
        }
    });

    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`\n${COLORS.bold}${COLORS.cyan}🤖 AI Dev Team DAEMON is listening on port ${PORT}...${COLORS.reset}`);
        console.log(`Send POST /enqueue with JSON: {"project": "my-app", "requirement": "build a chat app", "flash": true}`);

        // Start Telegram Polling alongside the HTTP Server
        runTelegramPolling();
    });

} else {
    // Standard execution
    if (!finalRequirement && !options.auto) {
        // It should have failed earlier unless requirement was originally omitted
    }
    new DevTeam(options).pipeline(finalRequirement).catch(console.error);
}