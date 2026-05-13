interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Lichess MCP — public read-only API for users, games, explorer, tablebase.
 *
 * Docs: https://lichess.org/api
 * No auth for public data.
 */


const BASE = 'https://lichess.org/api';
const EXPLORER = 'https://explorer.lichess.ovh';
const TABLEBASE = 'https://tablebase.lichess.ovh';
const UA = 'pipeworx-mcp-lichess/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'user',
    description: 'Player profile with ratings across all variants.',
    inputSchema: {
      type: 'object',
      properties: { username: { type: 'string' } },
      required: ['username'],
    },
  },
  {
    name: 'users',
    description: 'Bulk lookup of up to 300 users by username.',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: { type: 'array', items: { type: 'string' }, description: '1-300 usernames.' },
      },
      required: ['usernames'],
    },
  },
  {
    name: 'user_status',
    description: 'Online / playing status for the given usernames (up to 100).',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: { type: 'array', items: { type: 'string' } },
      },
      required: ['usernames'],
    },
  },
  {
    name: 'user_performance',
    description: 'Single-variant performance + best rated game for a user.',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        perf: { type: 'string', description: 'bullet | blitz | rapid | classical | correspondence | chess960 | crazyhouse | antichess | atomic | horde | kingOfTheHill | racingKings | threeCheck | ultraBullet' },
      },
      required: ['username', 'perf'],
    },
  },
  {
    name: 'top_players',
    description: 'Top-rated players for one variant.',
    inputSchema: {
      type: 'object',
      properties: {
        perf: { type: 'string' },
        limit: { type: 'number', description: '1-200 (default 50)' },
      },
      required: ['perf'],
    },
  },
  {
    name: 'leaderboards',
    description: 'Top-10 across all variants in one call.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'tv_channels',
    description: 'Currently-featured TV games per variant.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'cloud_eval',
    description: 'Stockfish cloud evaluation for a FEN position.',
    inputSchema: {
      type: 'object',
      properties: {
        fen: { type: 'string', description: 'FEN of position to evaluate.' },
        multi_pv: { type: 'number', description: '1-5 (default 1)' },
      },
      required: ['fen'],
    },
  },
  {
    name: 'tablebase',
    description: 'Syzygy tablebase lookup (≤7 pieces). Variant: standard (default), atomic, antichess.',
    inputSchema: {
      type: 'object',
      properties: {
        fen: { type: 'string' },
        variant: { type: 'string', description: 'standard | atomic | antichess' },
      },
      required: ['fen'],
    },
  },
  {
    name: 'opening_explorer',
    description: 'Opening explorer. scope: "lichess" (community), "masters" (top 2200+ humans), "player" (single user).',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', description: 'lichess | masters | player' },
        fen: { type: 'string', description: 'Mutually exclusive with play.' },
        play: { type: 'string', description: 'UCI move list, comma-separated. Mutually exclusive with fen.' },
        player: { type: 'string', description: 'Username (only for scope=player).' },
        speeds: { type: 'string', description: 'Comma-sep: ultraBullet,bullet,blitz,rapid,classical,correspondence' },
        ratings: { type: 'string', description: 'Comma-sep (lichess scope): 0,1000,1200,1400,1600,1800,2000,2200,2500' },
        moves: { type: 'number', description: 'Number of top moves to return (default 12, max 64).' },
      },
      required: ['scope'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'user':
      return lichessGet(`/user/${encodeURIComponent(reqStr(args, 'username', '"DrNykterstein"'))}`);
    case 'users': {
      const names = reqArr(args, 'usernames', '["DrNykterstein"]').slice(0, 300);
      const res = await fetch(`${BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', Accept: 'application/json', 'User-Agent': UA },
        body: names.join(','),
      });
      if (!res.ok) throw new Error(`Lichess: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    case 'user_status': {
      const names = reqArr(args, 'usernames', '["DrNykterstein"]').slice(0, 100);
      return lichessGet(`/users/status?ids=${encodeURIComponent(names.join(','))}`);
    }
    case 'user_performance':
      return lichessGet(
        `/user/${encodeURIComponent(reqStr(args, 'username', '"DrNykterstein"'))}/perf/${encodeURIComponent(reqStr(args, 'perf', '"blitz"'))}`,
      );
    case 'top_players': {
      const limit = Math.min(200, Math.max(1, (args.limit as number) ?? 50));
      return lichessGet(`/player/top/${limit}/${encodeURIComponent(reqStr(args, 'perf', '"blitz"'))}`);
    }
    case 'leaderboards':
      return lichessGet('/player');
    case 'tv_channels':
      return lichessGet('/tv/channels');
    case 'cloud_eval': {
      const params = new URLSearchParams({ fen: reqStr(args, 'fen', '"<fen>"') });
      if (args.multi_pv) params.set('multiPv', String(args.multi_pv));
      return lichessGet(`/cloud-eval?${params}`);
    }
    case 'tablebase': {
      const variant = (args.variant as string | undefined)?.toLowerCase() ?? 'standard';
      if (!['standard', 'atomic', 'antichess'].includes(variant)) {
        throw new Error('variant must be standard | atomic | antichess.');
      }
      const params = new URLSearchParams({ fen: reqStr(args, 'fen', '"4k3/8/4K3/4P3/8/8/8/8 b - - 0 1"') });
      const res = await fetch(`${TABLEBASE}/${variant}?${params}`, {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      });
      if (!res.ok) throw new Error(`Lichess tablebase: ${res.status}`);
      return res.json();
    }
    case 'opening_explorer': {
      const scope = reqStr(args, 'scope', '"lichess"').toLowerCase();
      if (!['lichess', 'masters', 'player'].includes(scope)) {
        throw new Error('scope must be lichess | masters | player.');
      }
      const params = new URLSearchParams();
      if (args.fen) params.set('fen', String(args.fen));
      if (args.play) params.set('play', String(args.play));
      if (args.speeds) params.set('speeds', String(args.speeds));
      if (args.ratings && scope === 'lichess') params.set('ratings', String(args.ratings));
      if (args.moves) params.set('moves', String(Math.min(64, Math.max(1, args.moves as number))));
      if (scope === 'player') {
        params.set('player', reqStr(args, 'player', '"DrNykterstein"'));
        params.set('color', 'white');
      }
      const res = await fetch(`${EXPLORER}/${scope === 'lichess' ? 'lichess' : scope}?${params}`, {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      });
      if (!res.ok) throw new Error(`Lichess explorer: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function lichessGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('Lichess: not found');
  if (res.status === 429) throw new Error('Lichess: rate-limit (HTTP 429)');
  if (!res.ok) throw new Error(`Lichess: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

function reqArr(args: Record<string, unknown>, key: string, example: string): string[] {
  const v = args[key];
  if (!Array.isArray(v) || v.length === 0) {
    throw new Error(`Required argument "${key}" must be a non-empty array, e.g. ${example}.`);
  }
  return v.filter((s): s is string => typeof s === 'string');
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
