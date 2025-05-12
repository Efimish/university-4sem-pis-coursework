import { test, expect } from "vitest";
import facade, { type IItemDB } from "@scripts/facade";

const itemFacade = facade as IItemDB;

test("items", async () => {
  let item = await itemFacade.addItem({
    name: "Test Item #1",
    price: 100,
    unitsInStock: 5,
  });

  // our item exists
  expect(await itemFacade.getItemById(item.id)).toBeDefined();

  // random item does not exist
  expect(await itemFacade.getItemById(-123618723)).toBeUndefined();

  // units in stock
  expect(item.unitsInStock).toBe(5);

  item = (await itemFacade.updateItem(item.id, { unitsInStock: 10 }))!;

  expect(item.unitsInStock).toBe(10);

  // delete our item
  await itemFacade.deleteItem(item.id);

  expect(await itemFacade.getItemById(item.id)).toBeUndefined();

  // other
  expect((await itemFacade.getItems()).length).toBeGreaterThan(0);
});
