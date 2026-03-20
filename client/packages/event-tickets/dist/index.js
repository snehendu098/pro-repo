import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export const Errors = {
    1: { message: "NotAdmin" },
    2: { message: "EventNotFound" },
    3: { message: "SoldOut" },
    4: { message: "InvalidQty" },
    5: { message: "InsufficientPayment" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ admin }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABQAAAAAAAAAITm90QWRtaW4AAAABAAAAAAAAAA1FdmVudE5vdEZvdW5kAAAAAAAAAgAAAAAAAAAHU29sZE91dAAAAAADAAAAAAAAAApJbnZhbGlkUXR5AAAAAAAEAAAAAAAAABNJbnN1ZmZpY2llbnRQYXltZW50AAAAAAU=",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABUV2ZW50AAAAAAAAAQAAAAQAAAABAAAAAAAAAAZUaWNrZXQAAAAAAAIAAAAEAAAAEw==",
            "AAAAAQAAAAAAAAAAAAAACUV2ZW50SW5mbwAAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAALbWF4X3RpY2tldHMAAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAEc29sZAAAAAQ=",
            "AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAlnZXRfYWRtaW4AAAAAAAAAAAAAAQAAABM=",
            "AAAAAAAAAA5HZXQgZXZlbnQgaW5mbwAAAAAACWdldF9ldmVudAAAAAAAAAEAAAAAAAAACGV2ZW50X2lkAAAABAAAAAEAAAPpAAAH0AAAAAlFdmVudEluZm8AAAAAAAAD",
            "AAAAAAAAABhCdXkgdGlja2V0cyBmb3IgYW4gZXZlbnQAAAAKYnV5X3RpY2tldAAAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAhldmVudF9pZAAAAAQAAAAAAAAAA3F0eQAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
            "AAAAAAAAABtHZXQgdG90YWwgcmV2ZW51ZSBjb2xsZWN0ZWQAAAAAC2dldF9iYWxhbmNlAAAAAAAAAAABAAAACw==",
            "AAAAAAAAABlHZXQgdGlja2V0IGNvdW50IGZvciB1c2VyAAAAAAAAC2dldF90aWNrZXRzAAAAAAIAAAAAAAAACGV2ZW50X2lkAAAABAAAAAAAAAAEdXNlcgAAABMAAAABAAAABA==",
            "AAAAAAAAAB9DcmVhdGUgYSBuZXcgZXZlbnQuIEFkbWluIG9ubHkuAAAAAAxjcmVhdGVfZXZlbnQAAAADAAAAAAAAAARuYW1lAAAAEAAAAAAAAAALbWF4X3RpY2tldHMAAAAABAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAQAAA+kAAAAEAAAAAw==",
            "AAAAAAAAAB5Jbml0aWFsaXplIGNvbnRyYWN0IHdpdGggYWRtaW4AAAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_admin: (this.txFromJSON),
        get_event: (this.txFromJSON),
        buy_ticket: (this.txFromJSON),
        get_balance: (this.txFromJSON),
        get_tickets: (this.txFromJSON),
        create_event: (this.txFromJSON)
    };
}
