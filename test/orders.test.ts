import { test, expect } from "vitest";
import argon2 from "argon2";
import facade, { type IUserDB, type IItemDB, type IOrderDB } from "@scripts/facade";

const userFacade = facade as IUserDB;
const itemFacade = facade as IItemDB;
const orderFacade = facade as IOrderDB;

test("orders", async () => {
  const user = await userFacade.addUser({
    name: "Test User #2",
    login: "test-user-2",
    passwordHash: await argon2.hash("test-password-2"),
  });

  const item = await itemFacade.addItem({
    name: "Test Item #1",
    price: 100,
    unitsInStock: 5,
  });

  const order = await orderFacade.addOrder({
    userId: user.id,
    items: [
      {
        ...item,
        amount: 2
      }
    ]
  });

  // our order exists
  expect(await orderFacade.getOrderById(order.id)).toBeDefined();
  expect(await orderFacade.getOrdersByUserId(user.id)).toHaveLength(1);

  // random order does not exist
  expect(await orderFacade.getOrderById(-123618723)).toBeUndefined();

  // finish an order
  const changedOrder = await orderFacade.setOrderStatus(order.id, "completed")
  order.status = changedOrder!.status;

  expect(order.status).toBe("completed");

  // other
  expect((await orderFacade.getOrders()).length).toBeGreaterThan(0);
});
