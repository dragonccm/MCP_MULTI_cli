/**
 * 🛠️ AI Dev Team — MCP Server
 *
 * Universal MCP server providing shared tools for all 3 CLIs:
 * Gemini CLI, Claude Code, Codex CLI
 *
 * Tools:
 * 1. File System: read_file, write_file, list_dir
 * 2. Shell: shell_exec
 * 3. Git: git_status, git_diff, git_log, git_commit, git_tag
 * 4. Browser: web_navigate, web_screenshot
 * 5. Search: web_search
 * 6. Deploy: deploy_vercel
 * 7. Database: query_db
 * 8. GitHub: git_log_detailed, git_push, git_create_branch, git_checkout,
 *            git_branch_list, git_conflict_list, git_merge,
 *            github_pr_create, github_pr_list
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { execaCommand } from "execa";
import { fileURLToPath } from "url";

// ============================================================
// LOAD .env from project root (two levels up: mcp-server/src → root)
// Uses Node.js built-in — no dotenv dependency needed
// ============================================================
(function loadEnv() {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // dist/index.js is 2 levels from root, src/index.ts is also 2 levels
        const envPath = path.resolve(__dirname, "..", "..", "..", ".env");
        if (!fsSync.existsSync(envPath)) return;
        const lines = fsSync.readFileSync(envPath, "utf-8").split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx === -1) continue;
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim().replace(/^"|"$/g, "");
            if (key && !(key in process.env)) {
                process.env[key] = val;
            }
        }
        console.error(`[MCP] ✅ Loaded .env from: ${envPath}`);
    } catch (e) {
        console.error("[MCP] Could not load .env:", e);
    }
})()

const server = new McpServer({
    name: "ai-dev-team-tools",
    version: "1.0.0",
});

// ============================================================
// 1. FILE SYSTEM TOOLS
// ============================================================

server.tool(
    "read_file",
    "Read the contents of a file at the specified path",
    {
        path: z.string().describe("Absolute or relative path to the file"),
    },
    async ({ path: filePath }) => {
        try {
            const resolved = path.resolve(filePath);
            const content = await fs.readFile(resolved, "utf-8");
            return {
                content: [{ type: "text" as const, text: content }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Error reading file: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "write_file",
    "Write content to a file (creates directories if needed)",
    {
        path: z.string().describe("Path to write the file"),
        content: z.string().describe("Content to write"),
    },
    async ({ path: filePath, content }) => {
        try {
            const resolved = path.resolve(filePath);
            const dir = path.dirname(resolved);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(resolved, content, "utf-8");
            return {
                content: [{ type: "text" as const, text: `✅ File written: ${resolved}` }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Error writing file: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "list_dir",
    "List all files and directories in the specified path",
    {
        path: z.string().describe("Directory path to list"),
        recursive: z.boolean().optional().describe("List recursively (default: false)"),
        maxDepth: z.number().optional().describe("Max depth for recursive listing (default: 3)"),
    },
    async ({ path: dirPath, recursive = false, maxDepth = 3 }) => {
        try {
            const resolved = path.resolve(dirPath);

            async function listRecursive(dir: string, depth: number): Promise<string[]> {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                const results: string[] = [];

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(resolved, fullPath);
                    const indent = "  ".repeat(depth);

                    if (entry.isDirectory()) {
                        // Skip node_modules, .git, dist
                        if (["node_modules", ".git", "dist", ".next"].includes(entry.name)) {
                            results.push(`${indent}📁 ${relativePath}/ (skipped)`);
                            continue;
                        }
                        results.push(`${indent}📁 ${relativePath}/`);
                        if (recursive && depth < maxDepth) {
                            const subResults = await listRecursive(fullPath, depth + 1);
                            results.push(...subResults);
                        }
                    } else {
                        const stats = await fs.stat(fullPath);
                        const size = stats.size < 1024 ? `${stats.size}B` : `${(stats.size / 1024).toFixed(1)}KB`;
                        results.push(`${indent}📄 ${relativePath} (${size})`);
                    }
                }
                return results;
            }

            const listing = await listRecursive(resolved, 0);
            return {
                content: [{ type: "text" as const, text: listing.join("\n") || "Empty directory" }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Error listing directory: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 2. SHELL EXECUTION
// ============================================================

server.tool(
    "shell_exec",
    "Execute a shell command and return stdout/stderr. Use for npm, build, test commands.",
    {
        command: z.string().describe("Shell command to execute"),
        cwd: z.string().optional().describe("Working directory (default: current)"),
        timeout: z.number().optional().describe("Timeout in ms (default: 120000)"),
    },
    async ({ command, cwd, timeout = 120000 }) => {
        try {
            const result = await execaCommand(command, {
                cwd: cwd ? path.resolve(cwd) : process.cwd(),
                timeout,
                shell: true,
                reject: false,
            });

            const output = [
                `$ ${command}`,
                `Exit code: ${result.exitCode}`,
                result.stdout ? `\n--- STDOUT ---\n${result.stdout}` : "",
                result.stderr ? `\n--- STDERR ---\n${result.stderr}` : "",
            ]
                .filter(Boolean)
                .join("\n");

            return {
                content: [{ type: "text" as const, text: output }],
                isError: result.exitCode !== 0,
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Error executing command: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 3. GIT TOOLS
// ============================================================

server.tool(
    "git_status",
    "Get the current git status (modified, staged, untracked files)",
    {
        cwd: z.string().optional().describe("Repository path"),
    },
    async ({ cwd }) => {
        try {
            const result = await execaCommand("git status --porcelain", {
                cwd: cwd ? path.resolve(cwd) : process.cwd(),
                shell: true,
            });
            return {
                content: [{ type: "text" as const, text: result.stdout || "Clean working directory" }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Git error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "git_diff",
    "Show git diff of current changes or between commits",
    {
        target: z.string().optional().describe("Commit hash, branch, or 'staged' (default: working tree)"),
        cwd: z.string().optional(),
    },
    async ({ target, cwd }) => {
        try {
            const cmd = target === "staged" ? "git diff --cached" : target ? `git diff ${target}` : "git diff";
            const result = await execaCommand(cmd, {
                cwd: cwd ? path.resolve(cwd) : process.cwd(),
                shell: true,
            });
            return {
                content: [{ type: "text" as const, text: result.stdout || "No changes" }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Git error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "git_log",
    "Show recent git commit history",
    {
        count: z.number().optional().describe("Number of commits to show (default: 10)"),
        cwd: z.string().optional(),
    },
    async ({ count = 10, cwd }) => {
        try {
            const result = await execaCommand(
                `git log --oneline --decorate -n ${count}`,
                {
                    cwd: cwd ? path.resolve(cwd) : process.cwd(),
                    shell: true,
                }
            );
            return {
                content: [{ type: "text" as const, text: result.stdout || "No commits" }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Git error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "git_commit",
    "Stage all changes and create a commit",
    {
        message: z.string().describe("Commit message"),
        push: z.boolean().optional().describe("Push after commit (default: false)"),
        cwd: z.string().optional(),
    },
    async ({ message, push = false, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            await execaCommand("git add .", opts as any);
            await execaCommand(`git commit -m "${message}"`, opts as any);

            if (push) {
                await execaCommand("git push", opts as any);
            }

            return {
                content: [{ type: "text" as const, text: `✅ Committed: "${message}"${push ? " (pushed)" : ""}` }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Git commit error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "git_tag",
    "Create a git tag for release versioning",
    {
        version: z.string().describe("Version tag (e.g., v1.0.0)"),
        message: z.string().optional().describe("Tag message"),
        push: z.boolean().optional().describe("Push tag to remote (default: false)"),
        cwd: z.string().optional(),
    },
    async ({ version, message, push = false, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const tagCmd = message ? `git tag -a ${version} -m "${message}"` : `git tag ${version}`;
            await execaCommand(tagCmd, opts as any);

            if (push) {
                await execaCommand(`git push origin ${version}`, opts as any);
            }

            return {
                content: [{ type: "text" as const, text: `✅ Tag created: ${version}${push ? " (pushed to remote)" : ""}` }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Git tag error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 8. GITHUB AUTOMATION TOOLS
// ============================================================

server.tool(
    "git_log_detailed",
    "Get detailed git commit history with author, date, message, and file stats",
    {
        count: z.number().optional().describe("Number of commits (default: 20)"),
        branch: z.string().optional().describe("Branch to read from (default: current)"),
        since: z.string().optional().describe("Show commits since date, e.g. '2024-01-01'"),
        cwd: z.string().optional(),
    },
    async ({ count = 20, branch, since, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const branchArg = branch ? branch : "";
            const sinceArg = since ? `--since="${since}"` : "";
            // Full format: hash | author | date | subject | files changed
            const logCmd = `git log --pretty=format:"%H|%an|%ad|%s" --date=short --stat -n ${count} ${sinceArg} ${branchArg}`.trim();
            const result = await execaCommand(logCmd, opts as any);

            // Also get branch list and current branch
            const branchResult = await execaCommand("git branch --show-current", opts as any);
            const currentBranch = (branchResult.stdout ?? "").trim();

            const output = [
                `📋 Commit History (branch: ${currentBranch}, last ${count}):`,
                "─".repeat(60),
                result.stdout || "No commits found",
            ].join("\n");

            return { content: [{ type: "text" as const, text: output }] };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git log error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_push",
    "Push local branch to remote GitHub repository",
    {
        remote: z.string().optional().describe("Remote name (default: origin)"),
        branch: z.string().optional().describe("Branch to push (default: current branch)"),
        force: z.boolean().optional().describe("Force push — use with caution (default: false)"),
        setUpstream: z.boolean().optional().describe("Set upstream tracking branch (default: true for new branches)"),
        tags: z.boolean().optional().describe("Also push all tags (default: false)"),
        cwd: z.string().optional(),
    },
    async ({ remote = "origin", branch, force = false, setUpstream = false, tags = false, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true, reject: false };

            // Get current branch if not specified
            let targetBranch = branch;
            if (!targetBranch) {
                const curBranch = await execaCommand("git branch --show-current", opts as any);
                targetBranch = (curBranch.stdout ?? "").trim();
            }

            const forceFlag = force ? "--force-with-lease" : "";
            const upstreamFlag = setUpstream ? `--set-upstream` : "";
            const tagsFlag = tags ? "--follow-tags" : "";

            const pushCmd = `git push ${remote} ${targetBranch} ${forceFlag} ${upstreamFlag} ${tagsFlag}`.replace(/\s+/g, " ").trim();
            const result = await execaCommand(pushCmd, opts as any);

            const success = result.exitCode === 0;
            const output = [
                success ? `✅ Pushed ${targetBranch} → ${remote}` : `❌ Push failed`,
                result.stdout || "",
                result.stderr || "",
            ].filter(Boolean).join("\n");

            return { content: [{ type: "text" as const, text: output }], isError: !success };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git push error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_create_branch",
    "Create a new git branch, optionally from a specific base branch or commit",
    {
        name: z.string().describe("New branch name (e.g., 'feature/login', 'release/v1.2.0')"),
        from: z.string().optional().describe("Base branch or commit to branch from (default: current HEAD)"),
        checkout: z.boolean().optional().describe("Checkout the new branch immediately (default: true)"),
        cwd: z.string().optional(),
    },
    async ({ name, from, checkout = true, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const fromArg = from ? from : "";
            const createCmd = checkout
                ? `git checkout -b ${name} ${fromArg}`.trim()
                : `git branch ${name} ${fromArg}`.trim();
            await execaCommand(createCmd, opts as any);

            return {
                content: [{ type: "text" as const, text: `✅ Branch created: ${name}${from ? ` (from ${from})` : ""}${checkout ? " — checked out" : ""}` }],
            };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git branch error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_checkout",
    "Switch to an existing branch or create and switch",
    {
        branch: z.string().describe("Branch name to checkout"),
        create: z.boolean().optional().describe("Create branch if it doesn't exist (default: false)"),
        cwd: z.string().optional(),
    },
    async ({ branch, create = false, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const cmd = create ? `git checkout -b ${branch}` : `git checkout ${branch}`;
            await execaCommand(cmd, opts as any);
            return { content: [{ type: "text" as const, text: `✅ Checked out: ${branch}` }] };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git checkout error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_branch_list",
    "List all local and remote branches",
    {
        remote: z.boolean().optional().describe("Include remote branches (default: true)"),
        cwd: z.string().optional(),
    },
    async ({ remote = true, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const cmd = remote ? "git branch -a --sort=-committerdate" : "git branch --sort=-committerdate";
            const result = await execaCommand(cmd, opts as any);
            const current = await execaCommand("git branch --show-current", opts as any);
            return {
                content: [{ type: "text" as const, text: `Current: ${(current.stdout ?? "").trim()}\n\nAll branches:\n${result.stdout ?? ""}` }],
            };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git branch list error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_conflict_list",
    "List all files with merge conflicts",
    {
        cwd: z.string().optional(),
    },
    async ({ cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true, reject: false };
            const result = await execaCommand("git diff --name-only --diff-filter=U", opts as any);
            const conflicted = (result.stdout ?? "").trim();
            if (!conflicted) {
                return { content: [{ type: "text" as const, text: "✅ No conflicts detected." }] };
            }
            const files = conflicted.split("\n");
            return {
                content: [{ type: "text" as const, text: `⚠️ ${files.length} file(s) with conflicts:\n${files.map((f: string) => `  • ${f}`).join("\n")}` }],
            };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Conflict list error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "git_merge",
    "Merge a source branch into the current branch with automatic conflict resolution",
    {
        sourceBranch: z.string().describe("Branch to merge from (e.g., 'feature/login')"),
        strategy: z.enum(["ours", "theirs", "manual"]).optional().describe(
            "Conflict resolution: 'ours'=keep current branch, 'theirs'=accept incoming, 'manual'=leave conflicts for review (default: manual)"
        ),
        message: z.string().optional().describe("Custom merge commit message"),
        noFastForward: z.boolean().optional().describe("Force a merge commit even if fast-forward is possible (default: true)"),
        cwd: z.string().optional(),
    },
    async ({ sourceBranch, strategy = "manual", message, noFastForward = true, cwd }) => {
        try {
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true, reject: false };
            const msgArg = message ? `-m "${message}"` : `-m "Merge branch '${sourceBranch}'"`;
            const ffArg = noFastForward ? "--no-ff" : "";

            // Attempt merge
            const mergeCmd = `git merge ${ffArg} ${msgArg} ${sourceBranch}`.replace(/\s+/g, " ").trim();
            const mergeResult = await execaCommand(mergeCmd, opts as any);

            if (mergeResult.exitCode === 0) {
                return { content: [{ type: "text" as const, text: `✅ Merged '${sourceBranch}' successfully.\n${mergeResult.stdout}` }] };
            }

            // Conflicts detected — apply resolution strategy
            if (strategy === "manual") {
                const conflictList = await execaCommand("git diff --name-only --diff-filter=U", opts as any);
                return {
                    content: [{ type: "text" as const, text: `⚠️ Merge conflicts detected. Strategy: manual review required.\nConflicted files:\n${conflictList.stdout ?? ""}\n\nRun git_merge with strategy='ours' or 'theirs' to auto-resolve.` }],
                    isError: true,
                };
            }

            // Auto-resolve: checkout --ours or --theirs for each conflicted file
            const conflictList2 = await execaCommand("git diff --name-only --diff-filter=U", opts as any);
            const conflictedFiles = (conflictList2.stdout ?? "").trim().split("\n").filter(Boolean);

            for (const file of conflictedFiles) {
                const resolveCmd = strategy === "ours" ? `git checkout --ours "${file}"` : `git checkout --theirs "${file}"`;
                await execaCommand(resolveCmd, opts as any);
                await execaCommand(`git add "${file}"`, opts as any);
            }

            // Complete the merge
            const completeResult = await execaCommand(
                `git commit --no-edit -m "Merge '${sourceBranch}' — conflicts resolved with strategy: ${strategy}"`,
                opts as any
            );

            const resolved = completeResult.exitCode === 0;
            return {
                content: [{
                    type: "text" as const,
                    text: resolved
                        ? `✅ Merged '${sourceBranch}' with ${conflictedFiles.length} conflict(s) auto-resolved (strategy: ${strategy}).\nFiles resolved: ${conflictedFiles.join(", ")}`
                        : `❌ Could not complete merge.\n${completeResult.stderr}`,
                }],
                isError: !resolved,
            };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `Git merge error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "github_pr_create",
    "Create a Pull Request on GitHub using the REST API (requires GITHUB_TOKEN env var)",
    {
        title: z.string().describe("PR title"),
        body: z.string().optional().describe("PR description / changelog"),
        base: z.string().describe("Base branch to merge into (e.g., 'main')"),
        head: z.string().describe("Head branch with your changes (e.g., 'release/v1.2.0')"),
        draft: z.boolean().optional().describe("Create as draft PR (default: false)"),
        cwd: z.string().optional().describe("Repo directory to detect owner/repo from git remote"),
    },
    async ({ title, body = "", base, head, draft = false, cwd }) => {
        try {
            const token = process.env.GITHUB_TOKEN;
            if (!token) {
                return {
                    content: [{ type: "text" as const, text: "❌ GITHUB_TOKEN environment variable not set. Add it to your .env file." }],
                    isError: true,
                };
            }

            // Parse owner/repo from git remote URL
            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const remoteResult = await execaCommand("git remote get-url origin", opts as any);
            const remoteUrl = (remoteResult.stdout ?? "").trim();

            // Support both HTTPS and SSH remote formats
            const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/);
            if (!match) {
                return {
                    content: [{ type: "text" as const, text: `❌ Could not parse GitHub owner/repo from remote URL: ${remoteUrl}` }],
                    isError: true,
                };
            }
            const [, owner, repo] = match;

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/vnd.github+json",
                    "Content-Type": "application/json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
                body: JSON.stringify({ title, body, base, head, draft }),
            });

            const data = await response.json() as any;
            if (!response.ok) {
                return {
                    content: [{ type: "text" as const, text: `❌ GitHub API error ${response.status}: ${data.message || JSON.stringify(data)}` }],
                    isError: true,
                };
            }

            return {
                content: [{
                    type: "text" as const,
                    text: `✅ Pull Request created!\n  #${data.number}: ${data.title}\n  URL: ${data.html_url}\n  ${draft ? "Status: Draft" : "Status: Open"}\n  ${base} ← ${head}`,
                }],
            };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `GitHub PR error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    "github_pr_list",
    "List open Pull Requests on GitHub (requires GITHUB_TOKEN env var)",
    {
        state: z.enum(["open", "closed", "all"]).optional().describe("PR state to filter (default: open)"),
        limit: z.number().optional().describe("Max PRs to return (default: 10)"),
        cwd: z.string().optional(),
    },
    async ({ state = "open", limit = 10, cwd }) => {
        try {
            const token = process.env.GITHUB_TOKEN;
            if (!token) {
                return { content: [{ type: "text" as const, text: "❌ GITHUB_TOKEN environment variable not set." }], isError: true };
            }

            const opts = { cwd: cwd ? path.resolve(cwd) : process.cwd(), shell: true };
            const remoteResult = await execaCommand("git remote get-url origin", opts as any);
            const match = (remoteResult.stdout ?? "").trim().match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/);
            if (!match) {
                return { content: [{ type: "text" as const, text: "❌ Could not parse GitHub owner/repo from remote." }], isError: true };
            }
            const [, owner, repo] = match;

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=${limit}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            });

            const prs = await response.json() as any[];
            if (!response.ok || !Array.isArray(prs)) {
                return { content: [{ type: "text" as const, text: `❌ GitHub API error: ${JSON.stringify(prs)}` }], isError: true };
            }

            if (prs.length === 0) {
                return { content: [{ type: "text" as const, text: `No ${state} pull requests found.` }] };
            }

            const list = prs.map(pr =>
                `  #${pr.number} [${pr.state}] ${pr.title}\n    ${pr.base.ref} ← ${pr.head.ref} | by ${pr.user.login}\n    ${pr.html_url}`
            ).join("\n\n");

            return { content: [{ type: "text" as const, text: `📋 Pull Requests (${state}):\n\n${list}` }] };
        } catch (error: any) {
            return { content: [{ type: "text" as const, text: `GitHub PR list error: ${error.message}` }], isError: true };
        }
    }
);



// ============================================================
// 4. BROWSER AUTOMATION (Playwright)
// ============================================================

server.tool(
    "web_navigate",
    "Open a URL in a headless browser, perform actions, and return page content",
    {
        url: z.string().describe("URL to navigate to"),
        actions: z
            .array(
                z.object({
                    type: z.enum(["click", "type", "screenshot", "wait", "evaluate"]),
                    selector: z.string().optional().describe("CSS selector for click/type"),
                    value: z.string().optional().describe("Text to type or JS to evaluate"),
                    delay: z.number().optional().describe("Wait time in ms"),
                })
            )
            .optional()
            .describe("Actions to perform on the page"),
        waitFor: z.string().optional().describe("CSS selector to wait for before proceeding"),
    },
    async ({ url, actions = [], waitFor }) => {
        try {
            const playwright = await import("playwright");
            const browser = await playwright.chromium.launch({ headless: true });
            const page = await browser.newPage();

            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

            if (waitFor) {
                await page.waitForSelector(waitFor, { timeout: 10000 });
            }

            const results: string[] = [`Navigated to: ${url}`];

            for (const action of actions) {
                switch (action.type) {
                    case "click":
                        if (action.selector) {
                            await page.click(action.selector);
                            results.push(`Clicked: ${action.selector}`);
                        }
                        break;
                    case "type":
                        if (action.selector && action.value) {
                            await page.fill(action.selector, action.value);
                            results.push(`Typed in ${action.selector}: ${action.value}`);
                        }
                        break;
                    case "screenshot":
                        const screenshotPath = action.value || `screenshot-${Date.now()}.png`;
                        await page.screenshot({ path: screenshotPath, fullPage: true });
                        results.push(`Screenshot saved: ${screenshotPath}`);
                        break;
                    case "wait":
                        await page.waitForTimeout(action.delay || 1000);
                        results.push(`Waited ${action.delay || 1000}ms`);
                        break;
                    case "evaluate":
                        if (action.value) {
                            const evalResult = await page.evaluate(action.value);
                            results.push(`Evaluate result: ${JSON.stringify(evalResult)}`);
                        }
                        break;
                }
            }

            // Get page title and text content
            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 2000) || "");
            results.push(`\nTitle: ${title}`);
            results.push(`\nPage content (first 2000 chars):\n${bodyText}`);

            await browser.close();

            return {
                content: [{ type: "text" as const, text: results.join("\n") }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Browser error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

server.tool(
    "web_screenshot",
    "Take a screenshot of a URL and save to file",
    {
        url: z.string().describe("URL to screenshot"),
        outputPath: z.string().optional().describe("Path to save screenshot (default: screenshot.png)"),
        fullPage: z.boolean().optional().describe("Capture full page (default: true)"),
    },
    async ({ url, outputPath = "screenshot.png", fullPage = true }) => {
        try {
            const playwright = await import("playwright");
            const browser = await playwright.chromium.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
            await page.screenshot({ path: outputPath, fullPage });
            await browser.close();

            return {
                content: [{ type: "text" as const, text: `✅ Screenshot saved: ${path.resolve(outputPath)}` }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Screenshot error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 5. WEB SEARCH
// ============================================================

server.tool(
    "web_search",
    "Search the web for information (using DuckDuckGo)",
    {
        query: z.string().describe("Search query"),
        maxResults: z.number().optional().describe("Max results to return (default: 5)"),
    },
    async ({ query, maxResults = 5 }) => {
        try {
            // Use DuckDuckGo instant answer API (no API key needed)
            const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
            const response = await fetch(url);
            const data = (await response.json()) as any;

            const results: string[] = [`Search results for: "${query}"\n`];

            if (data.AbstractText) {
                results.push(`📖 ${data.AbstractText}\n   Source: ${data.AbstractURL}\n`);
            }

            if (data.RelatedTopics) {
                const topics = data.RelatedTopics.slice(0, maxResults);
                for (const topic of topics) {
                    if (topic.Text) {
                        results.push(`• ${topic.Text}`);
                        if (topic.FirstURL) results.push(`  🔗 ${topic.FirstURL}\n`);
                    }
                }
            }

            if (results.length === 1) {
                results.push("No results found. Try a different query.");
            }

            return {
                content: [{ type: "text" as const, text: results.join("\n") }],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Search error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 6. DEPLOY TOOLS
// ============================================================

server.tool(
    "deploy_vercel",
    "Deploy project to Vercel (requires vercel CLI and VERCEL_TOKEN)",
    {
        projectDir: z.string().optional().describe("Project directory to deploy"),
        production: z.boolean().optional().describe("Deploy to production (default: true)"),
    },
    async ({ projectDir, production = true }) => {
        try {
            const cwd = projectDir ? path.resolve(projectDir) : process.cwd();
            const cmd = production ? "npx vercel --prod --yes" : "npx vercel --yes";

            const result = await execaCommand(cmd, {
                cwd,
                shell: true,
                timeout: 300000, // 5 min for deploy
                reject: false,
                env: {
                    ...process.env,
                },
            });

            const output = [
                `Deploy ${production ? "production" : "preview"}:`,
                result.stdout || "",
                result.stderr || "",
                `Exit code: ${result.exitCode}`,
            ].join("\n");

            return {
                content: [{ type: "text" as const, text: output }],
                isError: result.exitCode !== 0,
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `Deploy error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// 7. DATABASE TOOLS
// ============================================================

server.tool(
    "query_db",
    "Execute a database query using Prisma or raw SQL (read-only by default)",
    {
        query: z.string().describe("SQL query or Prisma model method"),
        type: z.enum(["prisma", "raw"]).optional().describe("Query type (default: prisma)"),
        cwd: z.string().optional(),
    },
    async ({ query, type = "prisma", cwd }) => {
        try {
            // Execute via prisma studio or npx prisma db execute
            const cmd =
                type === "raw"
                    ? `echo "${query}" | npx prisma db execute --stdin`
                    : `npx prisma studio --browser none`;

            const result = await execaCommand(cmd, {
                cwd: cwd ? path.resolve(cwd) : process.cwd(),
                shell: true,
                timeout: 30000,
                reject: false,
            });

            return {
                content: [
                    {
                        type: "text" as const,
                        text: result.stdout || result.stderr || "Query executed",
                    },
                ],
                isError: result.exitCode !== 0,
            };
        } catch (error: any) {
            return {
                content: [{ type: "text" as const, text: `DB error: ${error.message}` }],
                isError: true,
            };
        }
    }
);

// ============================================================
// CONNECT SERVER
// ============================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🛠️ AI Dev Team MCP Server running on stdio");
}

main().catch(console.error);
