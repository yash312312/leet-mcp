#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const QUERY = `
  query UserStats($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking }
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      tagProblemCounts {
        fundamental { tagName tagSlug problemsSolved }
        intermediate { tagName tagSlug problemsSolved }
        advanced { tagName tagSlug problemsSolved }
      }
    }
  }
`;

const server = new McpServer({ name: "leetcode-stats", version: "1.0.0" });

server.tool(
  "get_leetcode_stats",
  `Fetch a LeetCode user's ranking, solved counts by difficulty, and solved counts per topic tag. Requires a LeetCode username; if the user has not given one, ask for it before calling.
After getting the data, write a verbose summary: total solved with the easy/medium/hard split, global ranking, the strongest topics (most solved), the weakest or missing topics, and concrete suggestions on what to practice next. Note that counts show practice volume, not accuracy or time spent.`,
  { username: z.string().optional().describe("LeetCode username") },
  async ({ username }) => {
    if (!username || !username.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "No username provided. Please ask the user for their LeetCode username.",
          },
        ],
      };
    }

    try {
      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
        },
        body: JSON.stringify({ query: QUERY, variables: { username } }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.errors) throw new Error(JSON.stringify(json.errors));

      const user = json.data.matchedUser;
      if (!user) {
        return {
          content: [
            {
              type: "text",
              text: `No LeetCode user found with username "${username}".`,
            },
          ],
        };
      }

      const keep = (list) => list.filter((t) => t.problemsSolved > 0);
      user.tagProblemCounts = {
        fundamental: keep(user.tagProblemCounts.fundamental),
        intermediate: keep(user.tagProblemCounts.intermediate),
        advanced: keep(user.tagProblemCounts.advanced),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(json.data, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }],
      };
    }
  },
);

await server.connect(new StdioServerTransport());
