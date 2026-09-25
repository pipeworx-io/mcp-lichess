# @pipeworx/lichess

[Lichess.org](https://lichess.org) public API MCP — player profiles, games, broadcasts, opening explorer, tablebase. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/lichess/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/lichess_user \
  -H 'Content-Type: application/json' \
  -d '{"username":"hikaru"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/lichess_user`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "lichess": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-lichess"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-lichess
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Lichess data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
