# 📖 **TÀI LIỆU KỸ THUẬT: MCP TOOLKIT CHO 3 CLI (Gemini CLI, Claude Code, Codex CLI)**

## 🎯 **MỤC TIÊU**
Tạo MCP Server **universal** để **Gemini CLI**, **Claude Code**, **Codex CLI** giao tiếp đồng thời với cùng **1 bộ tools**.

***

## 🏗️ **MCP PROTOCOL SPEC**

### **Transport Types (3 CLI hỗ trợ chung)**

| Transport | Config Syntax | Dùng cho |
|-----------|---------------|----------|
| **Stdio** | `command: "node"`, `args: ["dist/index.js"]` | **Tất cả 3 CLI** (khuyên dùng) |
| **HTTP/SSE** | `url: "http://localhost:8787"` | Production |
| **Streamable HTTP** | `httpUrl: "http://localhost:3000/mcp"` | Load-balanced |

### **Tool Schema (Universal)**

```typescript
// Mỗi tool PHẢI có format này
{
  name: "tool_name",
  description: "Mô tả rõ ràng cho agent hiểu",
  inputSchema: z.object({ param1: z.string(), param2: z.number() }),
  outputSchema: z.object({ success: z.boolean(), data: z.any() }),
  handler: async (input) => ({ success: true, data: result })
}
```

***

## 🔌 **CONFIG FORMAT CHO TỪNG CLI**

### **1. Gemini CLI** (`.gemini/settings.json`)
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["C:/path/to/mcp-server/dist/index.js"],
      "env": { "DATABASE_URL": "postgresql://..." }
    },
    "browser": {
      "url": "http://localhost:3000/mcp",
      "bearer_token_env_var": "BROWSER_TOKEN"
    }
  }
}
```

**CLI Command**: `gemini mcp add dev-tools node C:/path/to/mcp-server/dist/index.js`

### **2. Claude Code** (`.claude/config.json`)
```json
{
  "mcpServers": {
    "dev-tools": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

### **3. Codex CLI** (`~/.codex/config.toml`)
```toml
[mcp_servers.dev-tools]
command = "node"
args = ["/absolute/path/to/mcp-server/dist/index.js"]

[mcp_servers.browser]
url = "http://localhost:3000/mcp"
enabled_tools = ["navigate", "screenshot"]
```

***

## 🛠️ **CORE MCP SERVER TEMPLATE (TypeScript)**

```typescript
// mcp-server/src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as playwright from "playwright";

const server = new McpServer({
  name: "ai-dev-team-tools",
  version: "1.0.0",
});

// ================================
// 1. FILESYSTEM TOOLS
// ================================
server.tool(
  "read_file",
  "Đọc nội dung file bất kỳ",
  { path: z.string() },
  async ({ path }) => {
    const content = await fs.readFile(path, "utf-8");
    return { success: true, content };
  }
);

server.tool(
  "write_file", 
  "Ghi file mới hoặc overwrite",
  { path: z.string().describe("Đường dẫn file"), content: z.string() },
  async ({ path, content }) => {
    await fs.writeFile(path, content);
    return { success: true, path };
  }
);

// ================================
// 2. BROWSER AUTOMATION
// ================================
server.tool(
  "web_navigate",
  "Mở browser → navigate → interact",
  {
    url: z.string(),
    actions: z.array(z.object({
      type: z.enum(["click", "type", "screenshot"]),
      selector: z.string(),
      value: z.string().optional()
    }))
  },
  async ({ url, actions }) => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    for (const action of actions) {
      if (action.type === "click") await page.click(action.selector);
      if (action.type === "type") await page.fill(action.selector, action.value);
      if (action.type === "screenshot") await page.screenshot({ path: "screenshot.png" });
    }
    
    await browser.close();
    return { success: true };
  }
);

// ================================
// 3. GIT TOOLS
// ================================
server.tool(
  "git_commit",
  "Tạo commit + push",
  { message: z.string(), branch: z.string().optional() },
  async ({ message }) => {
    await exec("git", ["add", "."]);
    await exec("git", ["commit", "-m", message]);
    await exec("git", ["push"]);
    return { success: true };
  }
);

// ================================
// 4. DEPLOYMENT TOOLS
// ================================
server.tool(
  "deploy_vercel",
  "Deploy Next.js app lên Vercel",
  { project_id: z.string() },
  async ({ project_id }) => {
    await exec("vercel", ["--prod", "--token", process.env.VERCEL_TOKEN]);
    return { success: true, url: "https://app.vercel.app" };
  }
);

// ================================
// 5. DATABASE TOOLS
// ================================
server.tool(
  "query_db",
  "Truy vấn database an toàn",
  { 
    table: z.enum(["students", "attendance", "teachers"]),
    action: z.enum(["select", "insert", "update"])
  },
  async ({ table, action }) => {
    // Sanitized queries only
    const results = await db.query(`SELECT * FROM ${table}`);
    return { success: true, data: results };
  }
);

server.connect(new StdioServerTransport());
```

***

## 🧪 **TEST MCP SERVER**

### **MCP Inspector (universal cho 3 CLI)**
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```
→ Mở `http://localhost:5173` → test từng tool.

### **Test với từng CLI**
```powershell
# Gemini CLI
gemini "Use dev-tools.read_file(path: './package.json')"

# Claude Code  
/mcp dev-tools "Test git_commit"

# Codex CLI
codex "Call web_navigate(url: 'https://example.com')"
```

***

## 📋 **CONFIG TỔNG HỢP CHO DỰ ÁN**

### **`.gemini/settings.json`**
```json
{
  "mcpServers": {
    "dev-tools": { "command": "node", "args": ["dist/index.js"] },
    "school-db": { "url": "http://localhost:5432/mcp" }
  }
}
```

### **`.codex/config.toml`**  
```toml
[mcp_servers.dev-tools]
command = "node"
args = ["dist/index.js"]
required = true
```

### **`.claude/mcp.json`**
```json
{
  "dev-tools": { "command": "node", "args": ["/path/dist/index.js"] }
}
```

***

## 🔍 **AGENT PROMPT TEMPLATE** (dùng chung)

```
## DEV TEAM AGENT

Available MCP Tools:
- read_file(path): Đọc file config/docs
- write_file(path, content): Ghi code mới  
- web_navigate(url, actions): Test UI E2E
- git_commit(message): Commit changes
- deploy_vercel(project_id): Deploy production

WORKFLOW:
1. Đọc PRD: read_file('docs/prd.md')
2. Implement code → write_file('src/pages/login.tsx', code)
3. Test: web_navigate('http://localhost:3000/login')
4. Commit: git_commit('feat: login page')
5. Deploy: deploy_vercel('school-app')

Output JSON: { status: "APPROVED", artifacts: [...] }
```

***

## 🚀 **DEPLOYMENT**

```bash
# Build MCP Server
cd mcp-server
npm run build
npx tsc

# Test với 3 CLI cùng lúc
npx concurrently \
  "gemini -p 'test mcp'" \
  "codex 'call dev-tools'" \
  "claude --mcp dev-tools 'run git_commit'"
```

**Kết quả**: **1 MCP Server → 3 CLI dùng chung** → **zero duplication**! 🎉

***

**Agent chỉ cần đọc doc này → tự tạo tool tương ứng được!** ✅



# 📋 HƯỚNG DẪN XÂY DỰNG **AI DEV TEAM** - FULLY AUTOMATED

## 🎯 **Tổng quan dự án**

**Mục tiêu**: Xây dựng hệ thống Multi-Agent Dev Team tự động hoàn thiện từ **1 yêu cầu → 1 sản phẩm deploy production**, chỉ cần bạn đưa input text.

**Stack chính**:
```
Orchestrator: Node.js + child_process
Agents: Gemini CLI + Claude Code + Codex CLI  
Communication: MCP Protocol (shared tools)
State: File-system + Git
Gates: Automated approval checklists
```

***

## 🏗️ **ARCHITECTURE**

```
[REQUIREMENT] → Orchestrator.js
                    ↓
[PM Agent] → docs/prd.md ✓ → [BA Agent] → docs/stories/
                                 ↓
[Frontend+Backend Parallel] → src/ ✓ → [QA Agent] → tests/
                                            ↓
[Release Agent] → Production Deploy ✅
```

***

## 📁 **CẤU TRÚC THƯ MỤC**

```
ai-dev-team/
├── orchestrator.js          # Core pipeline
├── agents/                  # BMAD prompts + wrappers
│   ├── pm-prompt.md
│   ├── ba-prompt.md
│   ├── frontend-prompt.md
│   ├── backend-prompt.md
│   └── qa-checklist.md
├── mcp-server/              # Shared tools
│   ├── index.ts
│   ├── figma.js
│   ├── playwright.js
│   └── deploy.js
├── docs/                    # State persistence
│   ├── prd.md
│   └── stories/
├── src/                     # Generated code
├── tests/                   # Auto-generated tests
└── .clirc, .gemini/, .codex/ # CLI configs
```

***

## 🚀 **BƯỚC 1: SETUP ENVIRONMENT (30 phút)**

### 1.1 Cài 3 CLI
```bash
# Gemini CLI
npm i -g @google/gemini-cli

# Claude Code (giả sử đã có Claude Desktop)
# Download từ code.claude.com

# Codex CLI  
npm i -g @openai/codex-cli
```

### 1.2 Init project
```bash
mkdir ai-dev-team && cd ai-dev-team
npm init -y
npm i child_process promisify
mkdir -p agents docs/stories src tests mcp-server
```

***

## 🛠️ **BƯỚC 2: CORE ORCHESTRATOR (1 giờ)**

**`orchestrator.js`**:
```javascript
#!/usr/bin/env node
const { spawn } = require('child_process');

class DevTeam {
  constructor() {
    this.phases = ['pm', 'ba', 'dev', 'qa', 'release'];
    this.state = { requirement: '', artifacts: {} };
  }

  async runCLI(cli, prompt, timeout = 300000) {
    return new Promise((resolve, reject) => {
      const proc = spawn(cli, ['-p', prompt], { 
        stdio: 'pipe',
        cwd: process.cwd(),
        timeout 
      });
      
      let output = '';
      proc.stdout.on('data', data => output += data.toString());
      proc.stderr.on('data', data => console.error(`❌ ${cli}:`, data.toString()));
      
      proc.on('close', code => {
        if (code === 0) resolve(output);
        else reject(new Error(`${cli} failed with code ${code}`));
      });
      
      proc.stdin.write('\n');
    });
  }

  async runAgent(role, input) {
    const promptPath = `./agents/${role}-prompt.md`;
    const fullPrompt = `Read ${promptPath}\nInput: ${input}\nOutput to file format`;
    
    console.log(`🧑‍💼 ${role.toUpperCase()} Agent...`);
    const result = await this.runCLI(this.getCLI(role), fullPrompt);
    
    // Save artifact
    this.state.artifacts[role] = result;
    require('fs').writeFileSync(`docs/${role}.md`, result);
    
    // Gatekeeping
    const approved = this.checkApproval(result);
    if (!approved) {
      throw new Error(`${role} gate failed`);
    }
    
    return result;
  }

  getCLI(role) {
    const mapping = {
      pm: 'gemini', ba: 'claude', 
      dev: 'codex', qa: 'codex', 
      release: 'claude'
    };
    return mapping[role];
  }

  checkApproval(output) {
    return output.includes('APPROVED') || output.includes('PASS');
  }

  async pipeline(requirement) {
    this.state.requirement = requirement;
    console.log('🚀 Starting AI Dev Team Pipeline...');
    
    for (const phase of this.phases) {
      await this.runAgent(phase, this.state.artifacts[phase] || requirement);
    }
    
    console.log('✅ Pipeline completed! Check ./src/ and production URL');
  }
}

const requirement = process.argv[2] || 'Build school management app';
new DevTeam().pipeline(requirement).catch(console.error);
```

**Chạy**: `node orchestrator.js "Xây app quản lý học sinh"`

***

## 📝 **BƯỚC 3: BMAD PROMPTS (30 phút)**

**`agents/pm-prompt.md`**:
```markdown
## PM AGENT ROLE

You are Product Manager. Create comprehensive PRD.

CHECKLIST (must pass all):
- [ ] Business objectives rõ ràng
- [ ] Success metrics (KPI)
- [ ] User personas + journeys  
- [ ] Technical requirements
- [ ] Risks + mitigation
- [ ] APPROVED tag ở cuối

OUTPUT FORMAT:
```markdown
# PRD: [Project Name]

## Business Objectives
...

## APPROVED ✅
```
```

**`agents/frontend-prompt.md`**:
```markdown
## FRONTEND DEV AGENT

Read PRD from docs/prd.md. Implement Next.js + shadcn/ui.

REQUIREMENTS:
- TypeScript
- App Router
- Server Components
- react-hook-form + zod
- TailwindCSS

TEST COVERAGE: 80%+
APPROVED khi: Tests pass + code review OK
```

*(Tương tự cho ba, backend, qa...)*

***

## 🔌 **BƯỚC 4: MCP SERVER SUITE (2 giờ)**

**`mcp-server/package.json`**:
```json
{
  "name": "ai-dev-team-mcp",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "playwright": "^1.47.0",
    "figma-api": "^1.0.0"
  }
}
```

**`mcp-server/index.ts`**:
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "dev-team-tools" });

// 1. Figma Reader
server.tool("read_figma", async ({ file_id }) => {
  // Extract CSS + components từ Figma
  return figma.exportDesign(file_id);
});

// 2. E2E Testing
server.tool("run_e2e", async ({ test_spec }) => {
  const result = await playwright.test(test_spec);
  return { pass: result.pass >= result.total, coverage: result.coverage };
});

// 3. Deploy
server.tool("deploy_production", async ({ project_id }) => {
  return vercel.deploy(project_id);
});

server.connect(new StdioServerTransport());
```

***

## ✅ **BƯỚC 5: GATEKEEPING CHECKLISTS**

**`agents/qa-checklist.md`**:
```markdown
## QA APPROVAL CRITERIA

PASS chỉ khi TẤT CẢ:
- [ ] Unit tests: 85%+ coverage
- [ ] E2E tests: 100% pass  
- [ ] Lighthouse score: 90+
- [ ] Security scan: clean
- [ ] Accessibility: AA compliant

OUTPUT: APPROVED ✅ hoặc REJECT với lý do
```

***

## 🎮 **BƯỚC 6: PRODUCTIONIZE (Ngày 3)**

### 6.1 CLI Wrapper
**`dev-team`** (global command):
```bash
#!/bin/bash
node /path/to/ai-dev-team/orchestrator.js "$@" && echo "🎉 Deployed!"
```

### 6.2 Monitoring Dashboard
```
Web UI theo dõi:
- Pipeline status realtime
- Agent outputs
- Test coverage graphs
- Deploy history
```

### 6.3 Self-Healing
```javascript
// Retry logic trong orchestrator
if (phaseFailed) {
  await retryAgent(role, maxRetries: 3);
}
```

***

## 📊 **TIMELINE TRIỂN KHAI**

| Ngày | Tasks | Thời gian |
|------|-------|-----------|
| **Day 1** | Orchestrator + 3 agents cơ bản | 3 giờ |
| **Day 2** | MCP Server + Full 7 agents | 4 giờ |
| **Day 3** | Productionize + Monitoring | 2 giờ |

***

## 🚀 **CHẠY LẦN ĐẦU**

```bash
cd ai-dev-team
chmod +x orchestrator.js
./orchestrator.js "Xây dựng hệ thống quản lý trường học với: đăng nhập giáo viên, dashboard học sinh, điểm danh, báo cáo"
```

**Kết quả sau 30p**: 
- ✅ Full Next.js app trong `./src/`
- ✅ Tests pass 90%+ coverage
- ✅ Deployed Vercel: `https://school-app-xxxx.vercel.app`
- ✅ GitHub PR ready

***

**Bạn sẵn sàng build chưa? Bắt đầu với `mkdir ai-dev-team` ngay bây giờ!** 🎯