# Solvent MCP Server

A dynamic MCP (Model Context Protocol) server for Solvent - Personal Finance Manager. This allows Claude to interact with your Solvent data through natural language.

## Architecture

This MCP server uses **dynamic tool discovery**:

1. On startup, fetches API metadata from `GET {SOLVENT_API_URL}/api/v1/meta`
2. Dynamically generates MCP tools from the metadata
3. When tools are called, proxies requests to the actual API endpoints

This means the tools are always in sync with the API—no manual updates needed when the API changes.

## Features

- **Expenses**: List, create, update, and delete expenses
- **Incomes**: List, create, update, and delete incomes
- **Categories**: List, create, update, and delete categories
- **Recurring Transactions**: List, create, update, and delete recurring transactions
- **Receipts**: List, create, update, and delete receipts

## Setup

### 1. Create an MCP Token

1. Log into your Solvent account
2. Go to **Settings** > **Tokens**
3. Click **Create Token**
4. Select **MCP** as the token type
5. Set the permissions you want to grant
6. Copy the token (you won't be able to see it again!)

### 2. Choose Your Connection Method

#### Option A: Claude.ai Connector (Recommended for Web)

Use this if you want to use Claude through the web interface (claude.ai).

1. After creating your MCP token, copy the **Connector URL** shown
2. Go to [Claude.ai](https://claude.ai)
3. Click on "Search and tools" > "Add connectors"
4. Select "Add custom connector"
5. Paste the Connector URL
6. Click Connect

The Connector URL format is:
```
https://your-solvent-domain.com/api/mcp?token=slvt_your_token_here
```

#### Option B: Claude Desktop (Local)

Use this if you want to use Claude Desktop on your computer.

1. Install Node.js (v18 or later) from [nodejs.org](https://nodejs.org)

2. Install the MCP server globally:
```bash
npm install -g solvent-mcp
```

Or run directly with npx:
```bash
npx solvent-mcp --token slvt_xxx --api-url https://your-solvent-domain.com
```

3. Configure Claude Desktop by editing the config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "solvent": {
      "command": "npx",
      "args": ["solvent-mcp", "--token", "slvt_your_token_here"],
      "env": {
        "SOLVENT_API_URL": "https://your-solvent-domain.com"
      }
    }
  }
}
```

4. Restart Claude Desktop

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLVENT_API_URL` | Base URL of the Solvent API | `http://localhost:3000` |
| `SOLVENT_API_TOKEN` | Your API token (starts with `slvt_`) | Required |

### Command Line Arguments

```bash
solvent-mcp --token <token> [--api-url <url>]
```

| Argument | Description |
|----------|-------------|
| `--token <token>` | Your Solvent API token (required) |
| `--api-url <url>` | The Solvent API URL (optional) |
| `--help, -h` | Show help message |

## Usage Examples

Once connected, you can ask Claude things like:

- "Show me my expenses from last week"
- "Create a new expense of $50 for groceries"
- "List all my income categories"
- "What are my recurring expenses?"
- "Create a monthly recurring expense of $15 for Netflix"

## Generated Tools

Tools are automatically generated based on the API metadata. The naming convention is:

| Pattern | Tool Name | Description |
|---------|-----------|-------------|
| `GET /api/v1/{entity}` | `list_{entity}` | List all items |
| `GET /api/v1/{entity}/:id` | `get_{singular}` | Get a single item by ID |
| `POST /api/v1/{entity}` | `create_{singular}` | Create a new item |
| `PUT /api/v1/{entity}/:id` | `update_{singular}` | Update an existing item |
| `DELETE /api/v1/{entity}/:id` | `delete_{singular}` | Delete an item |

### Expected Tools (25 total)

| Entity | Tools |
|--------|-------|
| Expenses | `list_expenses`, `get_expense`, `create_expense`, `update_expense`, `delete_expense` |
| Incomes | `list_incomes`, `get_income`, `create_income`, `update_income`, `delete_income` |
| Categories | `list_categories`, `get_category`, `create_category`, `update_category`, `delete_category` |
| Recurrings | `list_recurrings`, `get_recurring`, `create_recurring`, `update_recurring`, `delete_recurring` |
| Receipts | `list_receipts`, `get_receipt`, `create_receipt`, `update_receipt`, `delete_receipt` |

## Permissions

When creating an MCP token, you can control which operations Claude can perform:

| Permission | Allows |
|------------|--------|
| Expenses: Read | List and view expenses |
| Expenses: Write | Create, update, delete expenses |
| Incomes: Read | List and view incomes |
| Incomes: Write | Create, update, delete incomes |
| Categories: Read | List and view categories |
| Categories: Write | Create, update, delete categories |
| Recurrings: Read | List and view recurring transactions |
| Recurrings: Write | Create, update, delete recurring transactions |
| Receipts: Read | List and view receipts |
| Receipts: Write | Create, update, delete receipts |

## Development

### Building from Source

```bash
npm install
npm run build
```

### Running in Development

```bash
npm run dev -- --token slvt_xxx --api-url http://localhost:3000
```

### Project Structure

```
src/
├── cli.ts          # CLI entry point (stdio transport)
├── server.ts       # Dynamic MCP server (tool discovery & proxying)
├── http-handler.ts # HTTP/SSE handler for remote MCP
├── types.ts        # TypeScript types for API metadata
└── index.ts        # Package exports
```

## Security Notes

- Your MCP token grants access to your financial data
- Only create tokens with the minimum permissions needed
- Revoke tokens you no longer need from the Settings page
- The token is stored locally on your machine (Claude Desktop) or transmitted securely (Claude.ai)

## Troubleshooting

### "Token is not an MCP token"

Make sure you selected **MCP** as the token type when creating the token. API tokens cannot be used for MCP connections.

### "Invalid or revoked token"

Your token may have been revoked. Create a new MCP token in Settings.

### "Failed to fetch API metadata"

The server couldn't connect to the Solvent API. Check:
1. The `SOLVENT_API_URL` is correct
2. The API server is running
3. Your network can reach the API

### Connection issues with Claude Desktop

1. Make sure Node.js is installed: `node --version`
2. Check the Claude Desktop logs for errors
3. Verify your config file is valid JSON
4. Restart Claude Desktop after making config changes

## License

MIT
