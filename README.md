# @pipeworx/lichess

[Lichess.org](https://lichess.org) public API MCP — player profiles, games, broadcasts, opening explorer, tablebase. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `user(username)` — player profile + ratings across variants
- `users(usernames[])` — bulk lookup (up to 300)
- `user_status(usernames[])` — online / playing status
- `user_performance(username, perf)` — single-variant performance + best rated game
- `top_players(perf, limit?)` — top players for a variant (bullet/blitz/rapid/classical/etc.)
- `leaderboards()` — top 10 across all variants
- `tv_channels()` — currently-featured TV games per variant
- `cloud_eval(fen, multi_pv?)` — engine cloud eval for a FEN position
- `tablebase(fen, variant?)` — Syzygy tablebase result (≤7 pieces)
- `opening_explorer(scope, fen|play, ...)` — Lichess / masters / player opening DB

## Data source

`https://lichess.org/api`, `https://explorer.lichess.ovh`, `https://tablebase.lichess.ovh`.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
