"use client";

import { useEffect, useState, useCallback } from "react";
import { Client, networks } from "event-tickets";
import type { EventInfo } from "event-tickets";
import {
  isConnected as freighterIsConnected,
  requestAccess,
  signTransaction,
  signAuthEntry,
} from "@stellar/freighter-api";

const CONTRACT_ID = networks.testnet.contractId;
const NETWORK_PASSPHRASE = networks.testnet.networkPassphrase;
const RPC_URL = "https://soroban-testnet.stellar.org";

function getClient(publicKey?: string) {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    ...(publicKey
      ? {
          signTransaction: async (xdr, opts) => {
            const result = await signTransaction(xdr, {
              networkPassphrase: opts?.networkPassphrase,
              address: opts?.address,
            });
            if (result.error) throw new Error(result.error);
            return {
              signedTxXdr: result.signedTxXdr,
              signerAddress: result.signerAddress,
            };
          },
          signAuthEntry: async (entryXdr, opts) => {
            const result = await signAuthEntry(entryXdr, {
              networkPassphrase: opts?.networkPassphrase,
              address: opts?.address,
            });
            if (result.error) throw new Error(result.error);
            return {
              signedAuthEntry: result.signedAuthEntry ?? "",
              signerAddress: result.signerAddress,
            };
          },
        }
      : {}),
  });
}

interface EventData {
  id: number;
  info: EventInfo;
}

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = getClient();
      const loaded: EventData[] = [];

      for (let i = 0; i < 10; i++) {
        try {
          const tx = await client.get_event({ event_id: i });
          const result = tx.result;
          if (result.isOk()) {
            loaded.push({ id: i, info: result.unwrap() });
          }
        } catch {
          break;
        }
      }

      setEvents(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);
    try {
      const connected = await freighterIsConnected();
      if (!connected.isConnected) {
        setError("Freighter wallet not found. Install the browser extension.");
        return;
      }
      const access = await requestAccess();
      if (access.error) {
        setError(String(access.error));
        return;
      }
      setWalletAddress(access.address);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const buyTicket = async (eventId: number) => {
    if (!walletAddress) {
      setError("Connect wallet first");
      return;
    }
    setBuyingId(eventId);
    setError(null);
    try {
      const client = getClient(walletAddress);
      const tx = await client.buy_ticket({
        buyer: walletAddress,
        event_id: eventId,
        qty: 1,
      });
      await tx.signAndSend();
      await loadEvents();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Event Tickets</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-mono hidden sm:block">
              {CONTRACT_ID.slice(0, 8)}...{CONTRACT_ID.slice(-4)}
            </span>
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-400 font-mono">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connecting}
                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50 font-medium"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Events</h2>
          <button
            onClick={loadEvents}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && events.length === 0 && !error && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">No events found</p>
            <p className="text-sm">Create events using the Stellar CLI</p>
          </div>
        )}

        <div className="grid gap-4">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              walletConnected={!!walletAddress}
              buying={buyingId === evt.id}
              onBuy={() => buyTicket(evt.id)}
            />
          ))}
        </div>

        <div className="mt-12 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-sm font-semibold mb-3 text-zinc-400">
            CLI Quick Reference
          </h3>
          <div className="space-y-2 font-mono text-xs text-zinc-500">
            <p>
              <span className="text-zinc-400">Create event:</span> stellar
              contract invoke --id event_tickets --source-account alice
              --network testnet -- create_event --name &quot;My Event&quot;
              --max_tickets 100 --price 1000000
            </p>
            <p>
              <span className="text-zinc-400">Buy ticket:</span> stellar
              contract invoke --id event_tickets --source-account alice
              --network testnet -- buy_ticket --buyer alice --event_id 0 --qty 1
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EventCard({
  event,
  walletConnected,
  buying,
  onBuy,
}: {
  event: EventData;
  walletConnected: boolean;
  buying: boolean;
  onBuy: () => void;
}) {
  const { id, info } = event;
  const available = info.max_tickets - info.sold;
  const soldPct =
    info.max_tickets > 0 ? (info.sold / info.max_tickets) * 100 : 0;
  const priceXlm = Number(info.price) / 10_000_000;

  return (
    <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{info.name}</h3>
          <p className="text-xs text-zinc-500 font-mono mt-1">Event #{id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{priceXlm.toFixed(2)} XLM</p>
          <p className="text-xs text-zinc-500">per ticket</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-zinc-400">{info.sold} sold</span>
          <span className={available > 0 ? "text-green-400" : "text-red-400"}>
            {available > 0 ? `${available} available` : "Sold out"}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-zinc-600 font-mono truncate max-w-[60%]">
          Creator: {info.creator}
        </p>
        {available > 0 && (
          <button
            onClick={onBuy}
            disabled={!walletConnected || buying}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-md transition-colors font-medium"
            title={!walletConnected ? "Connect wallet first" : undefined}
          >
            {buying ? "Buying..." : "Buy Ticket"}
          </button>
        )}
      </div>
    </div>
  );
}
