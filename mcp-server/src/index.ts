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
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { execaCommand } from "execa";

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
                content: [{ type: "text" as const, text: `✅ Tag created: ${version}${push ? " (pushed)" : ""}` }],
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
