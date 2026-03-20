import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBIKQRLDKUQEV6FGGLDMN6TPGGWKNC4ZOQ2MYEYDABZCICGTQQZ3R5GE",
  }
} as const

export const Errors = {
  1: {message:"NotAdmin"},
  2: {message:"EventNotFound"},
  3: {message:"SoldOut"},
  4: {message:"InvalidQty"},
  5: {message:"InsufficientPayment"}
}

export type DataKey = {tag: "Event", values: readonly [u32]} | {tag: "Ticket", values: readonly [u32, string]};


export interface EventInfo {
  creator: string;
  max_tickets: u32;
  name: string;
  price: i128;
  sold: u32;
}

export interface Client {
  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get admin address
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get event info
   */
  get_event: ({event_id}: {event_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<EventInfo>>>

  /**
   * Construct and simulate a buy_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy tickets for an event
   */
  buy_ticket: ({buyer, event_id, qty}: {buyer: string, event_id: u32, qty: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total revenue collected
   */
  get_balance: (options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get ticket count for user
   */
  get_tickets: ({event_id, user}: {event_id: u32, user: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a create_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new event. Admin only.
   */
  create_event: ({name, max_tickets, price}: {name: string, max_tickets: u32, price: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin}: {admin: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAAITm90QWRtaW4AAAABAAAAAAAAAA1FdmVudE5vdEZvdW5kAAAAAAAAAgAAAAAAAAAHU29sZE91dAAAAAADAAAAAAAAAApJbnZhbGlkUXR5AAAAAAAEAAAAAAAAABNJbnN1ZmZpY2llbnRQYXltZW50AAAAAAU=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABUV2ZW50AAAAAAAAAQAAAAQAAAABAAAAAAAAAAZUaWNrZXQAAAAAAAIAAAAEAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAACUV2ZW50SW5mbwAAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAALbWF4X3RpY2tldHMAAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAEc29sZAAAAAQ=",
        "AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAlnZXRfYWRtaW4AAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAA5HZXQgZXZlbnQgaW5mbwAAAAAACWdldF9ldmVudAAAAAAAAAEAAAAAAAAACGV2ZW50X2lkAAAABAAAAAEAAAPpAAAH0AAAAAlFdmVudEluZm8AAAAAAAAD",
        "AAAAAAAAABhCdXkgdGlja2V0cyBmb3IgYW4gZXZlbnQAAAAKYnV5X3RpY2tldAAAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAhldmVudF9pZAAAAAQAAAAAAAAAA3F0eQAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAABtHZXQgdG90YWwgcmV2ZW51ZSBjb2xsZWN0ZWQAAAAAC2dldF9iYWxhbmNlAAAAAAAAAAABAAAACw==",
        "AAAAAAAAABlHZXQgdGlja2V0IGNvdW50IGZvciB1c2VyAAAAAAAAC2dldF90aWNrZXRzAAAAAAIAAAAAAAAACGV2ZW50X2lkAAAABAAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
        "AAAAAAAAAB9DcmVhdGUgYSBuZXcgZXZlbnQuIEFkbWluIG9ubHkuAAAAAAxjcmVhdGVfZXZlbnQAAAADAAAAAAAAAARuYW1lAAAAEAAAAAAAAAALbWF4X3RpY2tldHMAAAAABAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAAB5Jbml0aWFsaXplIGNvbnRyYWN0IHdpdGggYWRtaW4AAAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_admin: this.txFromJSON<string>,
        get_event: this.txFromJSON<Result<EventInfo>>,
        buy_ticket: this.txFromJSON<Result<void>>,
        get_balance: this.txFromJSON<i128>,
        get_tickets: this.txFromJSON<u32>,
        create_event: this.txFromJSON<Result<u32>>
  }
}