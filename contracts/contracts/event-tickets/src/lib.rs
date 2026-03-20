#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, symbol_short, Address, Env, String, Symbol};

mod test;

const ADMIN: Symbol = symbol_short!("ADMIN");
const NEXT_ID: Symbol = symbol_short!("NEXT_ID");
const BALANCE: Symbol = symbol_short!("BALANCE");

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct EventInfo {
    pub name: String,
    pub max_tickets: u32,
    pub sold: u32,
    pub price: i128,
    pub creator: Address,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Event(u32),
    Ticket(u32, Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAdmin = 1,
    EventNotFound = 2,
    SoldOut = 3,
    InvalidQty = 4,
    InsufficientPayment = 5,
}

#[contract]
pub struct EventTickets;

#[contractimpl]
impl EventTickets {
    /// Initialize contract with admin
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&NEXT_ID, &0u32);
        env.storage().instance().set(&BALANCE, &0i128);
    }

    /// Create a new event. Admin only.
    pub fn create_event(
        env: Env,
        name: String,
        max_tickets: u32,
        price: i128,
    ) -> Result<u32, Error> {
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();

        let id: u32 = env.storage().instance().get(&NEXT_ID).unwrap();
        let event = EventInfo {
            name,
            max_tickets,
            sold: 0,
            price,
            creator: admin.clone(),
        };

        env.storage().persistent().set(&DataKey::Event(id), &event);
        env.storage().instance().set(&NEXT_ID, &(id + 1));

        env.storage().instance().extend_ttl(100, 200);
        env.storage().persistent().extend_ttl(&DataKey::Event(id), 100, 200);

        env.events().publish((symbol_short!("create"),), id);

        Ok(id)
    }

    /// Buy tickets for an event
    pub fn buy_ticket(
        env: Env,
        buyer: Address,
        event_id: u32,
        qty: u32,
    ) -> Result<(), Error> {
        buyer.require_auth();

        if qty == 0 {
            return Err(Error::InvalidQty);
        }

        let key = DataKey::Event(event_id);
        let mut event: EventInfo = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::EventNotFound)?;

        if event.sold + qty > event.max_tickets {
            return Err(Error::SoldOut);
        }

        event.sold += qty;
        env.storage().persistent().set(&key, &event);

        let ticket_key = DataKey::Ticket(event_id, buyer.clone());
        let current: u32 = env.storage().persistent().get(&ticket_key).unwrap_or(0);
        env.storage().persistent().set(&ticket_key, &(current + qty));

        // Track revenue
        let bal: i128 = env.storage().instance().get(&BALANCE).unwrap_or(0);
        env.storage().instance().set(&BALANCE, &(bal + event.price * (qty as i128)));

        env.storage().instance().extend_ttl(100, 200);
        env.storage().persistent().extend_ttl(&key, 100, 200);
        env.storage().persistent().extend_ttl(&ticket_key, 100, 200);

        env.events().publish((symbol_short!("buy"), event_id), (buyer, qty));

        Ok(())
    }

    /// Get event info
    pub fn get_event(env: Env, event_id: u32) -> Result<EventInfo, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Event(event_id))
            .ok_or(Error::EventNotFound)
    }

    /// Get ticket count for user
    pub fn get_tickets(env: Env, event_id: u32, user: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Ticket(event_id, user))
            .unwrap_or(0)
    }

    /// Get total revenue collected
    pub fn get_balance(env: Env) -> i128 {
        env.storage().instance().get(&BALANCE).unwrap_or(0)
    }

    /// Get admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN).unwrap()
    }
}
