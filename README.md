# mcp-lichess

Lichess public API: players, ratings, eval, tablebase, opening explorer

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `user` | Player profile with ratings across all variants. |
| `users` | Bulk lookup of up to 300 users by username. |
| `user_status` | Online / playing status for the given usernames (up to 100). |
| `user_performance` | Single-variant performance + best rated game for a user. |
| `top_players` | Top-rated players for one variant. |
| `leaderboards` | Top-10 across all variants in one call. |
| `tv_channels` | Currently-featured TV games per variant. |
| `cloud_eval` | Stockfish cloud evaluation for a FEN position. |
| `tablebase` | Syzygy tablebase lookup (≤7 pieces). Variant: standard (default), atomic, antichess. |
| `opening_explorer` | Opening explorer. scope: "lichess" (community), "masters" (top 2200+ humans), "player" (single user). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "lichess": {
      "url": "https://gateway.pipeworx.io/lichess/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Lichess data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
