#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_create_and_buy() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(EventTickets, (&admin,));
    let client = EventTicketsClient::new(&env, &contract_id);

    // Create event
    let event_id = client.create_event(
        &String::from_str(&env, "Test Concert"),
        &100,
        &1_000_000,
    );
    assert_eq!(event_id, 0);

    let event = client.get_event(&event_id);
    assert_eq!(event.max_tickets, 100);
    assert_eq!(event.sold, 0);
    assert_eq!(event.price, 1_000_000);

    // Buy tickets
    let buyer = Address::generate(&env);
    client.buy_ticket(&buyer, &event_id, &2);

    assert_eq!(client.get_tickets(&event_id, &buyer), 2);

    let event = client.get_event(&event_id);
    assert_eq!(event.sold, 2);
    assert_eq!(client.get_balance(), 2_000_000);
}

#[test]
fn test_sold_out() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(EventTickets, (&admin,));
    let client = EventTicketsClient::new(&env, &contract_id);

    client.create_event(
        &String::from_str(&env, "Small Show"),
        &2,
        &500,
    );

    let buyer = Address::generate(&env);
    client.buy_ticket(&buyer, &0, &2);

    // Should fail - sold out
    let result = client.try_buy_ticket(&buyer, &0, &1);
    assert!(result.is_err());
}

#[test]
fn test_multiple_events() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(EventTickets, (&admin,));
    let client = EventTicketsClient::new(&env, &contract_id);

    let id0 = client.create_event(&String::from_str(&env, "Event A"), &50, &100);
    let id1 = client.create_event(&String::from_str(&env, "Event B"), &30, &200);

    assert_eq!(id0, 0);
    assert_eq!(id1, 1);

    let buyer = Address::generate(&env);
    client.buy_ticket(&buyer, &id0, &1);
    client.buy_ticket(&buyer, &id1, &3);

    assert_eq!(client.get_tickets(&id0, &buyer), 1);
    assert_eq!(client.get_tickets(&id1, &buyer), 3);
}
