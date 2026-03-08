# AI Dev Team — Multi-Agent CLI Orchestrator

**Hệ thống tự động hóa phát triển phần mềm đa agent, biến một câu yêu cầu thành sản phẩm hoàn chỉnh được deploy.**

---

## Kiến trúc pipeline

```
Yêu cầu của bạn
      │
      ▼
 ┌────────────┐
 │ Coordinator│  → Hỏi làm rõ yêu cầu (bỏ qua nếu --auto)
 └─────┬──────┘
       │
       ▼
 ┌────────────┐
 │  PO Agent  │  → Thiết kế specs, data model, API contract, folder structure
 └─────┬──────┘     Output: docs/po-output.md
       │
       ├──────────────────────┐
       ▼                      ▼
 ┌──────────┐          ┌──────────┐   (chạy song song)
 │ Frontend │          │ Backend  │
 │   Dev    │          │   Dev    │   + bất kỳ agent nào PO quyết định
 └────┬─────┘          └────┬─────┘
      └──────────┬──────────┘
                 │
                 ▼
          ┌────────────┐
          │  Reviewer  │  → Review code, security, performance, tests
          └─────┬──────┘     Output: docs/reviewer-report.md
                │
                ▼
          ┌────────────┐
          │  Release   │  → Build, deploy Vercel, tạo PR, git tag
          └─────┬──────┘     Output: docs/release-report.md
                │
                ▼
          ┌────────────┐
          │ Archivist  │  → Đúc kết bài học, lưu vào RAG Vector DB
          └────────────┘     Output: docs/rag-memory.json
```

---

## Yêu cầu hệ thống

| Thứ cần có | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | ≥ 18 | Runtime chính |
| Gemini CLI | mới nhất | Bắt buộc (PO, Reviewer, Release, RAG) |
| Claude Code | mới nhất | Khuyên dùng cho Dev agents |
| Git | bất kỳ | Cho release phase |
| Vercel CLI | tùy chọn | Nếu muốn auto-deploy |
| GitHub CLI (`gh`) | tùy chọn | Nếu muốn tạo PR tự động |

---

## Cài đặt

### Bước 1 — Clone & Setup tự động

```bash
git clone <repo-url>
cd ai-dev-team
npm run setup
```

Lệnh `setup` sẽ tự động:
- Cài `stitch-mcp`, `gemini`, `qwen`, `copilot` (nếu chưa có)
- Build MCP Server (`mcp-server/dist/index.js`)
- Tạo file `.env` mẫu

> **Lưu ý:** Mỗi lần chạy `node orchestrator.js`, hệ thống cũng tự check và setup nếu cần.

### Bước 2 — Điền API Keys vào `.env`

```env
# Bắt buộc
GEMINI_API_KEY=AIzaSy...

# Tuỳ chọn nhưng nên có
GITHUB_TOKEN=ghp_...

# Giới hạn chi phí API (0 = không giới hạn)
MAX_BUDGET_USD=5.00

# CLI mặc định cho từng role
FRONTEND_CLI=claude
BACKEND_CLI=claude
CODER_CLI=claude
PO_CLI=gemini
REVIEWER_CLI=gemini
RELEASE_CLI=gemini

# Daemon + Telegram Bot (nếu dùng --daemon)
TELEGRAM_BOT_TOKEN=123:abc...
TELEGRAM_APPROVE_ID=987654321
```

### Bước 3 — Đăng nhập các CLI

```bash
gemini login
claude login    # nếu dùng claude
gh auth login   # nếu muốn tạo PR tự động
```

---

## Chạy với Web Dashboard

Dashboard hiển thị **pipeline flow, CLI status, live logs, DevOps controls** qua trình duyệt tại `http://localhost:3000`.

```bash
# Dự án mới + mở dashboard
node orchestrator.js --project my-app --dashboard "Xây dựng ứng dụng quản lý task"

# Hoặc dùng npm script shortcut
npm run dev -- --project my-app "Xây dựng ứng dụng quản lý task"
```

Sau khi chạy, mở trình duyệt: **http://localhost:3000**

---

## Các lệnh cơ bản

### Dự án mới (chuẩn)

```bash
node orchestrator.js --project <tên-dự-án> "Mô tả yêu cầu"
```

```bash
# Ví dụ
node orchestrator.js --project chat-app \
  "Xây dựng ứng dụng chat realtime bằng ReactJS và Node.js WebSocket"
```

Hệ thống sẽ:
1. Coordinator hỏi làm rõ yêu cầu (hỏi-đáp tương tác)
2. PO thiết kế specs, data model, folder structure
3. Frontend + Backend chạy song song
4. Reviewer kiểm tra toàn bộ code
5. Release deploy và tạo git tag

---

## Các chế độ nâng cao

### `--auto` — Bỏ qua xác nhận thủ công

```bash
node orchestrator.js --project my-app --auto \
  "Tạo landing page giới thiệu sản phẩm SaaS"
```

Không dừng hỏi người dùng ở mỗi phase. Phù hợp cho CI/CD hoặc chạy không giám sát.

---

### `--flash` — MVP cực nhanh

```bash
node orchestrator.js --project landing-page --flash \
  "Trang giới thiệu bản thân, dark mode, responsive"
```

Bỏ qua planning chi tiết, tập trung viết code Core MVP nhanh nhất. Phù hợp cho prototyping.

---

### `--update` — Thêm tính năng vào dự án cũ

```bash
node orchestrator.js --project chat-app --update \
  "Thêm tính năng gửi ảnh và voice note"
```

Đọc lại PRD + codebase hiện tại, chỉ thêm/sửa đúng những gì cần, không xóa code cũ.

---

### `--fix` — Vá lỗi trực tiếp

```bash
node orchestrator.js --project chat-app --fix \
  "Sửa lỗi WebSocket bị ngắt kết nối sau 30 giây trên Safari"
```

Nhảy thẳng vào Dev phase, đọc code hiện hành và fix mà không qua PO planning.

---

### `--dashboard` — Mở Web Dashboard

```bash
node orchestrator.js --project my-app --dashboard \
  "Mô tả yêu cầu..."
```

Mở `http://localhost:3000` để xem:
- **Pipeline Flow** — Trạng thái từng phase (running / passed / failed)
- **CLI Status** — Claude, Gemini, Copilot, Qwen có available không
- **MCP Status** — dev-tools MCP, Stitch MCP
- **Live Logs** — Output real-time từng agent
- **Role Assignment** — Đổi CLI cho từng role ngay trên UI
- **DevOps Controls** — Build, Test, Deploy, Create PR
- **Agent Graph** — Sơ đồ liên kết agent
- **Message Bus** — Tin nhắn inter-agent

---

### `--daemon` — Server + Telegram Bot

```bash
node orchestrator.js --daemon --dashboard
# Hoặc: npm run daemon
```

Chạy HTTP server (port 8080) + Telegram bot. Nhận lệnh từ xa không bao giờ tắt.

**HTTP API (port 8080):**

```bash
# Tạo dự án mới
curl -X POST http://localhost:8080/enqueue \
  -H "Content-Type: application/json" \
  -d '{"project": "my-app", "requirement": "Làm web bán hàng"}'

# Flash mode
curl -X POST http://localhost:8080/enqueue \
  -d '{"project": "quick", "requirement": "Landing page", "flash": true}'

# Update mode
curl -X POST http://localhost:8080/enqueue \
  -d '{"project": "my-app", "requirement": "Thêm trang About", "update": true}'

# Fix mode
curl -X POST http://localhost:8080/enqueue \
  -d '{"project": "my-app", "requirement": "Fix login bug", "fix": true}'
```

**Telegram Bot commands:**
```
/build chat-app Xây dựng ứng dụng chat realtime
/flash landing Tạo landing page nhanh
/update chat-app Thêm tính năng video call
/fix chat-app Sửa lỗi không hiển thị avatar
```

---

## Kết hợp các flags

```bash
# Dự án mới, tự động, có dashboard, giới hạn $3
node orchestrator.js \
  --project shop \
  --auto \
  --dashboard \
  --max-budget-usd 3 \
  "Tạo website bán hàng với giỏ hàng và thanh toán"

# Flash + tự động (không hỏi gì)
node orchestrator.js --project mvp --flash --auto \
  "Prototype ứng dụng ghi chú markdown"

# Update với PO dùng claude, FE/BE dùng gemini
node orchestrator.js --project my-app \
  --update \
  --po-cli claude \
  --frontend-cli gemini \
  --backend-cli gemini \
  "Thêm dark mode"
```

---

## Phân bổ CLI động

### Cách 1 — Biến môi trường (lâu dài)

```env
# .env
PO_CLI=gemini
FRONTEND_CLI=claude
BACKEND_CLI=claude
REVIEWER_CLI=gemini
RELEASE_CLI=gemini
CODER_CLI=claude       # fallback cho sub-agents không match
```

### Cách 2 — Flag dòng lệnh (một lần)

```bash
node orchestrator.js --project app \
  --po-cli gemini \
  --frontend-cli claude \
  --backend-cli claude \
  --reviewer-cli gemini \
  "Mô tả dự án"
```

### Cách 3 — Dashboard UI

Mở `http://localhost:3000` → **Role Assignment** → chọn CLI → **Save Config**.
Config lưu vào `cli-config.json`, tự động áp dụng cho lần chạy tiếp theo.

---

## Web Dashboard — Hướng dẫn chi tiết

```
http://localhost:3000
```

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Logo | Project | Pipeline strip | Budget | Clock            │
├─────────────────────────────────────────────────────────────────────┤
│ Status bar: Trạng thái pipeline hiện tại                           │
├──────────────────┬──────────────────────────────┬───────────────────┤
│ SIDEBAR TRÁI     │ LOG TERMINALS (tabs)          │ PANEL PHẢI        │
│                  │                               │                   │
│ ● CLI Status     │ [🧠 PO] [👨 FE] [👨 BE] [🔍]  │ DevOps Controls   │
│   Claude ●       │ ┌─────────────────────────┐  │ [Build] [Test]    │
│   Gemini ●       │ │ >> Writing components... │  │ [Deploy] [PR]     │
│   Copilot ○      │ │ >> npm install done      │  │ [Git Status]      │
│   Qwen ○         │ │ >> Tests: 12/12 pass ✅  │  │                   │
│                  │ └─────────────────────────┘  │ Agent Graph       │
│ ● MCP Status     │                               │ (vis-network)     │
│   dev-tools ●    │                               │                   │
│   Stitch ○       │                               │ Message Bus       │
│                  │                               │ (inter-agent)     │
│ ● Role Assignment│                               │                   │
│   PO:  [gemini ▼]│                               │                   │
│   FE:  [claude ▼]│                               │                   │
│   BE:  [claude ▼]│                               │                   │
│   [Save Config]  │                               │                   │
│                  │                               │                   │
│ ● Launch Project │                               │                   │
│   Name: [______] │                               │                   │
│   Mode: [      ] │                               │                   │
│   [🚀 Launch]    │                               │                   │
│                  │                               │                   │
│ ● Recent Projects│                               │                   │
└──────────────────┴──────────────────────────────┴───────────────────┘
```

### Pipeline Flow Strip

Hiển thị trạng thái màu sắc từng phase:
- ⬜ Xám — chưa chạy
- 🔵 Xanh nhấp nháy — đang chạy
- 🟢 Xanh — passed
- 🔴 Đỏ — failed

### DevOps Controls

| Nút | Hành động |
|---|---|
| **Build** | Chạy `npm run build` trong thư mục project |
| **Tests** | Chạy `npm test` |
| **Deploy** | Chạy `vercel --yes` |
| **Create PR** | Chạy `gh pr create --fill` |
| **Git Status** | Hiển thị `git status` + `git log -5` |

> Chọn project trong dropdown trước khi bấm để target đúng thư mục.

---

## Dashboard API Reference

Dashboard expose REST API tại port 3000:

```bash
# Kiểm tra trạng thái các CLI
GET http://localhost:3000/api/cli-status

# Kiểm tra MCP servers
GET http://localhost:3000/api/mcp-status

# Xem/lưu cấu hình CLI roles
GET  http://localhost:3000/api/cli-config
POST http://localhost:3000/api/cli-config
     Body: {"po":"gemini","frontend":"claude","backend":"claude","reviewer":"gemini","release":"gemini"}

# Danh sách projects
GET http://localhost:3000/api/projects

# Chạy DevOps action
POST http://localhost:3000/api/devops
     Body: {"action":"build|test|deploy|pr|git-status","projectName":"my-app"}

# Gửi project cho daemon (cần --daemon đang chạy ở port 8080)
POST http://localhost:3000/api/launch
     Body: {"project":"my-app","requirement":"...","flash":true}

# SSE stream (real-time events)
GET http://localhost:3000/events
```

---

## Hệ thống ký ức RAG

Sau mỗi dự án, **Archivist agent** tự động:
1. Đúc kết bài học và quyết định kỹ thuật
2. Dùng Gemini Embeddings tạo vector
3. Lưu vào `docs/rag-memory.json` (local vector DB)
4. Append vào `docs/knowledge-base.md`

Lần sau, khi bắt đầu dự án mới, system tự động tìm 3 dự án tương tự nhất (Cosine Similarity) và inject kinh nghiệm vào prompt của tất cả agents.

```bash
# Migrate kiến thức cũ từ knowledge-base.md sang vector DB
npm run migrate-rag
```

---

## Message Bus (Inter-Agent Communication)

Các agent song song có thể giao tiếp với nhau để tránh conflict:

```bash
# Agent A gửi message cho Agent B
node scripts/send_message.js --from frontend_dev --to backend_api \
  "Tôi cần API endpoint GET /api/users trả về {id, name, avatar}"

# Agent B đọc messages gửi cho mình
node scripts/read_messages.js --for backend_api
```

Messages hiển thị trong **Message Bus** panel ở dashboard và trong **Agent Graph** (flash edge animation).

---

## Cấu trúc thư mục output

Mỗi project được tạo trong `projects/<tên-dự-án>/`:

```
projects/my-app/
├── docs/
│   ├── po-output.md          # Specs, data model, API contract
│   ├── frontend_dev-output.md # Source code frontend
│   ├── backend_api-output.md  # Source code backend
│   ├── reviewer-report.md     # Code review + issues
│   ├── release-report.md      # Deploy URL, git tag
│   ├── pipeline-report.json   # Tổng kết thời gian, kết quả
│   ├── final-requirement.md   # Yêu cầu đã làm rõ
│   ├── graph-messages.log     # Inter-agent messages
│   └── rag-memory.json        # Vector memories (global)
├── src/                       # Source code được generate
├── .tmp/                      # Prompt tạm (tự xoá sau khi xong)
├── .claude/                   # Claude config (copy từ root)
└── .gemini/                   # Gemini config (copy từ root)
```

---

## Tham số dòng lệnh đầy đủ

```
node orchestrator.js [options] "Yêu cầu"

Bắt buộc:
  --project <tên>         Tên thư mục dự án (không có dấu cách)

Chế độ:
  --flash                 MVP nhanh, bỏ qua planning chi tiết
  --update                Thêm tính năng vào dự án có sẵn
  --fix                   Vá lỗi trực tiếp, bỏ qua PO phase
  --daemon                Chạy HTTP server port 8080 + Telegram bot
  --auto                  Tự động xác nhận tất cả, không hỏi người dùng

Giao diện:
  --dashboard             Mở web dashboard tại http://localhost:3000
  --tui                   Mở terminal UI (blessed-contrib)

CLI Override (áp dụng cho 1 lần chạy):
  --po-cli <cli>          CLI cho Product Owner agent
  --frontend-cli <cli>    CLI cho Frontend dev agent
  --backend-cli <cli>     CLI cho Backend dev agent
  --reviewer-cli <cli>    CLI cho Reviewer agent
  --release-cli <cli>     CLI cho Release agent

Giới hạn:
  --max-budget-usd <số>   Giới hạn chi phí API ($). Dừng nếu vượt quá.
  --max-retries <số>      Số lần retry mỗi phase (mặc định: 3)
  --timeout <ms>          Timeout mỗi agent (mặc định: 600000ms = 10 phút)

Giá trị hợp lệ cho <cli>: claude, gemini, copilot, qwen
```

---

## npm Scripts

```bash
npm run setup          # Cài đặt toàn bộ dependencies + build MCP server
npm run dev            # Chạy orchestrator với dashboard (thêm --project sau)
npm run daemon         # Chạy daemon mode + dashboard
npm run migrate-rag    # Migrate knowledge-base.md sang vector DB
npm run build:mcp      # Build lại MCP server
npm test               # Chạy unit tests (Vitest)
npm run test:coverage  # Tests + coverage report
```

---

## Ví dụ lệnh mẫu

```bash
# 1. Ứng dụng chat đơn giản, tự động, có dashboard
node orchestrator.js --project chat --auto --dashboard \
  "Chat app realtime, React + Node.js WebSocket, dark theme"

# 2. E-commerce MVP nhanh
node orchestrator.js --project shop --flash --auto \
  "Website bán hàng: danh mục sản phẩm, giỏ hàng, thanh toán Stripe"

# 3. Thêm auth vào project cũ
node orchestrator.js --project shop --update --dashboard \
  "Thêm đăng nhập Google OAuth và trang profile người dùng"

# 4. Fix bug khẩn
node orchestrator.js --project shop --fix --auto \
  "Fix lỗi giỏ hàng không cập nhật số lượng khi bấm + -"

# 5. Dùng Claude cho tất cả agents
node orchestrator.js --project app \
  --po-cli claude --frontend-cli claude --backend-cli claude \
  --reviewer-cli claude --dashboard \
  "Dashboard quản lý nhân sự với biểu đồ"

# 6. Giới hạn ngân sách $2
node orchestrator.js --project budget-test --max-budget-usd 2 --auto \
  "Todo app đơn giản Next.js"

# 7. Daemon + dashboard (chạy server 24/7)
node orchestrator.js --daemon --dashboard

# 8. Gửi job cho daemon đang chạy
curl -X POST http://localhost:8080/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "project": "new-feature",
    "requirement": "Thêm tính năng export PDF báo cáo",
    "update": true
  }'
```

---

## Troubleshooting

### `gemini: command not found`
```bash
npm install -g @google/gemini-cli
gemini login
```

### `claude: command not found`
```bash
npm install -g @anthropic-ai/claude-code
claude login
```

### Dashboard không load (port 3000 bị dùng)
Đổi port bằng biến môi trường:
```bash
DASHBOARD_PORT=3001 node orchestrator.js --project app --dashboard "..."
```
*(Cần sửa thêm `this.port` trong `dashboard.js` để đọc từ env)*

### MCP Server chưa build
```bash
npm run build:mcp
# Hoặc
cd mcp-server && npm install && npm run build
```

### Gate FAILED liên tục (agent không output đúng format)
```bash
# Tăng số retry
node orchestrator.js --project app --max-retries 5 "..."

# Hoặc chạy --auto để bỏ qua interactive feedback
node orchestrator.js --project app --auto "..."
```

### Lỗi `Budget Exceeded`
Tăng giới hạn trong `.env`:
```env
MAX_BUDGET_USD=10
```
Hoặc bỏ giới hạn (set về 0):
```env
MAX_BUDGET_USD=0
```

### Agent graph không hiển thị trong dashboard
Cần internet để load `vis-network` từ CDN. Nếu offline, cần tải về local.

---

## Đề xuất nâng cấp

| Tính năng | Độ ưu tiên | Mô tả |
|---|---|---|
| WebSocket | Cao | Thay SSE để hỗ trợ 2 chiều (client → control) |
| Auth dashboard | Cao | Basic auth / token bảo vệ port 3000 |
| Log export | Trung bình | Download logs dưới dạng `.md` hoặc `.txt` |
| Metrics chart | Trung bình | Biểu đồ token/cost per phase |
| Project diff | Trung bình | So sánh trước/sau update |
| Notification webhook | Thấp | Push notify khi phase pass/fail |
| Multi-project view | Thấp | Dashboard theo dõi nhiều pipeline cùng lúc |

---

## Cấu trúc thư mục gốc

```
ai-dev-team/
├── orchestrator.js      # 🧠 Core engine — pipeline orchestrator
├── dashboard.js         # 🌐 Web dashboard server (port 3000)
├── tui.js               # 💻 Terminal UI (blessed)
├── setup.js             # ⚙️  Auto-setup script
├── convert-rag.js       # 🔄 RAG migration tool
├── agents/              # 📝 Prompt files cho từng agent
│   ├── coordinator-prompt.md
│   ├── po-prompt.md
│   ├── coder-prompt.md
│   ├── frontend-prompt.md
│   ├── backend-prompt.md
│   ├── reviewer-prompt.md
│   ├── release-prompt.md
│   ├── archivist-prompt.md
│   └── gates/           # Quality gate checklists
├── mcp-server/          # 🔧 MCP Server (tools: file, git, shell, deploy)
│   └── src/index.ts
├── scripts/             # 🛠️  Utilities
│   ├── send_message.js  # Gửi message giữa agents
│   └── read_messages.js # Đọc messages từ agent khác
├── projects/            # 📦 Output của các dự án (tự tạo)
├── docs/                # 📚 Global docs (RAG memory, knowledge base)
│   ├── rag-memory.json
│   └── knowledge-base.md
├── .env                 # 🔑 API keys & config (không commit)
├── cli-config.json      # 🎛️  CLI role assignments (tạo bởi dashboard)
└── package.json
```

---

## License

MIT — Tự do sử dụng, sửa đổi và phân phối.
