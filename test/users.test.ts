import { test, expect } from "vitest";
import argon2 from "argon2";
import facade, { type IUserDB, type IItemDB } from "@scripts/facade";

const userFacade = facade as IUserDB;
const itemFacade = facade as IItemDB;

test("users", async () => {
  const password = "test password 1";

  const user = await userFacade.addUser({
    name: "Test User #1",
    login: "test-user-1",
    passwordHash: await argon2.hash(password),
  });

  // correct password hashing
  expect(await argon2.verify(user.passwordHash, password)).toBe(true);

  // user is not manager
  expect(user.isManager).toBe(false);

  // our user exists
  expect(await userFacade.getUserById(user.id)).toBeDefined();
  expect(await userFacade.getUserByLogin(user.login)).toBeDefined();

  // random user does not exist
  expect(await userFacade.getUserById(-123618723)).toBeUndefined();
  expect(await userFacade.getUserByLogin("non-existing-user")).toBeUndefined();

  // user cart is empty
  expect(await userFacade.getUserCart(user.id)).toHaveLength(0);

  // create 2 items
  const item1 = await itemFacade.addItem({
    name: "Test Item #1",
    price: 100,
    unitsInStock: 3
  });
  const item2 = await itemFacade.addItem({
    name: "Test Item #2",
    price: 200,
    unitsInStock: 5
  });
  // now add an item
  await userFacade.setItemInCart(user.id, item1.id, 1)

  // change amount to 2
  await userFacade.setItemInCart(user.id, item1.id, 2);

  const cart = await userFacade.getUserCart(user.id);

  // user cart now has 1 item
  expect(cart).toHaveLength(1);

  // user cart has the correct item
  expect(cart?.[0]?.id).toBe(item1.id);

  // add another item
  cart!.push({
    ...item2,
    amount: 2
  });

  // set new cart
  const newCart = await userFacade.setUserCart(user.id, cart!);

  expect(newCart).toHaveLength(2);

  // remove second item
  await userFacade.setItemInCart(user.id, item2.id, 0);

  const newNewCart = await userFacade.getUserCart(user.id);

  expect(newNewCart).toHaveLength(1);

  // other
  expect((await userFacade.getUsers()).length).toBeGreaterThan(0);
});
