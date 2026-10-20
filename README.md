# leetcode-stats-mcp

An MCP server that fetches a LeetCode user's stats so an AI client (like Claude Desktop) can summarize them and suggest what to practice next.

Given a LeetCode username, the tool returns:

- Global ranking
- Solved counts by difficulty (Easy / Medium / Hard)
- Solved counts per topic tag (Array, DP, Graph, etc.)

The client's model then writes a verbose summary with strengths, weak areas, and suggestions.

## Requirements

- Node.js 18 or newer
- An MCP client such as Claude Desktop or Claude Code

## Installation

### Option 1: Run with npx (recommended)

No install needed. Add this to your client config (see below):

```json
{
  "mcpServers": {
    "leetcode-stats": {
      "command": "npx",
      "args": ["-y", "leetcode-stats-mcp"]
    }
  }
}
```

### Option 2: Run from source

```bash
git clone https://github.com/yash312312/leetcode-stats-mcp.git
cd leetcode-stats-mcp
npm install
```

Then point your client at the local file:

```json
{
  "mcpServers": {
    "leetcode-stats": {
      "command": "node",
      "args": ["/absolute/path/to/server.js"]
    }
  }
}
```

## Setting up Claude Desktop

1. Open Claude Desktop and go to **Settings → Developer → Edit Config**.
2. Add the server entry from above to `claude_desktop_config.json`.
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
3. Fully quit and reopen Claude Desktop (closing the window is not enough).
4. Check **Settings → Developer** to confirm `leetcode-stats` is running.

On Windows, if `npx` fails to launch, use:

```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "leetcode-stats-mcp"]
}
```

## Setting up Claude Code

```bash
claude mcp add leetcode-stats -- npx -y leetcode-stats-mcp
```

## Usage

Ask your client something like:

- `What are my LeetCode stats? My username is yash312312`
- `Get LeetCode stats for yash312312 and tell me what to practice next`

If you don't give a username, the client should ask for one. Approve the tool permission prompt on the first call.

## Tool reference

### `get_leetcode_stats`

| Parameter  | Type   | Required | Description         |
| ---------- | ------ | -------- | ------------------- |
| `username` | string | Yes      | LeetCode username   |

Returns JSON with `username`, `profile.ranking`, `submitStatsGlobal.acSubmissionNum` (counts by difficulty), and `tagProblemCounts` (counts per topic tag, grouped as fundamental, intermediate and advanced).

## Troubleshooting

- **`ERR_MODULE_NOT_FOUND`**: run `npm install` inside the project folder.
- **`Cannot use import statement outside a module`**: make sure `package.json` has `"type": "module"`.
- **Server doesn't appear in the client**: check the config path is absolute, fully restart the client, and read the MCP logs (Claude Desktop: `%APPDATA%\Claude\logs\`).
- **`node` not found**: use the full path to your Node executable as the `command`.

## License

MIT
