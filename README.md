# Solvent MCP Server

MCP (Model Context Protocol) server for Solvent - Personal Finance Manager. This allows Claude to interact with your Solvent data through natural language.

## Features

- **Expenses**: List, create, update, and delete expenses
- **Incomes**: List, create, update, and delete incomes
- **Categories**: List, create, update, and delete categories
- **Recurring Transactions**: List, create, update, and delete recurring transactions

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
      "args": [
        "solvent-mcp",
        "--token", "slvt_your_token_here",
        "--api-url", "https://your-solvent-domain.com"
      ]
    }
  }
}
```

4. Restart Claude Desktop

## Usage Examples

Once connected, you can ask Claude things like:

- "Show me my expenses from last week"
- "Create a new expense of $50 for groceries"
- "List all my income categories"
- "What are my recurring expenses?"
- "Create a monthly recurring expense of $15 for Netflix"

## Available Tools

### Expenses

| Tool | Description |
|------|-------------|
| `list_expenses` | List all expenses (optionally with category info) |
| `get_expense` | Get a single expense by ID |
| `create_expense` | Create a new expense |
| `update_expense` | Update an existing expense |
| `delete_expense` | Delete an expense |

### Incomes

| Tool | Description |
|------|-------------|
| `list_incomes` | List all incomes (optionally with category info) |
| `get_income` | Get a single income by ID |
| `create_income` | Create a new income |
| `update_income` | Update an existing income |
| `delete_income` | Delete an income |

### Categories

| Tool | Description |
|------|-------------|
| `list_categories` | List all categories (with optional filters) |
| `get_category` | Get a single category by ID |
| `create_category` | Create a new category |
| `update_category` | Update an existing category |
| `delete_category` | Delete a category |

### Recurring Transactions

| Tool | Description |
|------|-------------|
| `list_recurrings` | List all recurring transactions |
| `get_recurring` | Get a single recurring transaction by ID |
| `create_recurring` | Create a new recurring transaction |
| `update_recurring` | Update an existing recurring transaction |
| `delete_recurring` | Delete a recurring transaction |

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

## Development

### Building from Source

```bash
cd mcp-server
npm install
npm run build
```

### Running in Development

```bash
npm run dev -- --token slvt_xxx --api-url http://localhost:3000
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

### Connection issues with Claude Desktop

1. Make sure Node.js is installed: `node --version`
2. Check the Claude Desktop logs for errors
3. Verify your config file is valid JSON
4. Restart Claude Desktop after making config changes

## License

MIT

