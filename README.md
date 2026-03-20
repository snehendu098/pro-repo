# Event Ticketing System - Stellar Soroban

On-chain event ticketing system built with Soroban smart contracts and a Next.js frontend.

## Deployed Contract

- **Network:** Testnet
- **Contract ID:** `CBIKQRLDKUQEV6FGGLDMN6TPGGWKNC4ZOQ2MYEYDABZCICGTQQZ3R5GE`
- **Explorer:** https://stellar.expert/explorer/testnet/contract/CBIKQRLDKUQEV6FGGLDMN6TPGGWKNC4ZOQ2MYEYDABZCICGTQQZ3R5GE
- **Stellar Lab:** https://lab.stellar.org/r/testnet/contract/CBIKQRLDKUQEV6FGGLDMN6TPGGWKNC4ZOQ2MYEYDABZCICGTQQZ3R5GE

## Contract Functions

| Function | Auth | Description |
|---|---|---|
| `create_event(name, max_tickets, price)` | Admin | Create event, returns event_id |
| `buy_ticket(buyer, event_id, qty)` | Buyer | Purchase tickets |
| `get_event(event_id)` | None | Get event info |
| `get_tickets(event_id, user)` | None | Get user's ticket count |
| `get_balance()` | None | Get total revenue |
| `get_admin()` | None | Get admin address |

## Project Structure



```
test/
├── contracts/           # Soroban smart contracts (Rust)
│   ├── Cargo.toml
│   └── contracts/
│       └── event-tickets/
│           ├── Cargo.toml
│           └── src/
│               ├── lib.rs
│               └── test.rs
└── client/              # Next.js frontend
    ├── app/
    │   └── page.tsx
    └── packages/
        └── event-tickets/   # Auto-generated TS bindings
```

## Prerequisites

- Rust 1.84+ with `wasm32v1-none` target
- Stellar CLI v25+
- Bun (or Node.js)
- Freighter wallet browser extension (for buying tickets)

## Setup

### Contract

```bash
cd contracts

# build
stellar contract build

# test
cargo test -p event-tickets

# generate identity (first time)
stellar keys generate alice --network testnet --fund

# deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/event_tickets.wasm \
  --source-account alice \
  --network testnet \
  --alias event_tickets \
  -- --admin alice
```

### Client

```bash
cd client

# install deps
bun install

# generate TS bindings (after deploy)
stellar contract bindings typescript \
  --contract-id event_tickets \
  --output-dir packages/event-tickets \
  --network testnet --overwrite

# build bindings
cd packages/event-tickets && bun install && bun run build && cd ../..

# run dev server
bun dev
```

## CLI Usage

```bash
# create event (price in stroops, 10000000 = 1 XLM)
stellar contract invoke \
  --id event_tickets --source-account alice --network testnet \
  -- create_event --name "My Concert" --max_tickets 100 --price 10000000

# buy ticket
stellar contract invoke \
  --id event_tickets --source-account alice --network testnet \
  -- buy_ticket --buyer alice --event_id 0 --qty 2

# query event
stellar contract invoke \
  --id event_tickets --source-account alice --network testnet \
  -- get_event --event_id 0
```

## Wallet Integration

The frontend connects to Freighter wallet for signing `buy_ticket` transactions. Read-only calls (`get_event`, `get_tickets`) work without a wallet.

1. Install [Freighter](https://freighter.app) browser extension
2. Switch to Testnet in Freighter settings
3. Click "Connect Wallet" in the app header
4. Click "Buy Ticket" on any event card to sign and submit a purchase tx

# Screenshots
<img width="1280" height="735" alt="image" src="https://github.com/user-attachments/assets/4ba1869b-b4da-4e45-af12-51783b62f1e7" />
<img width="1280" height="738" alt="image" src="https://github.com/user-attachments/assets/4b489bcc-2755-4ec5-a314-a87956640c44" />

