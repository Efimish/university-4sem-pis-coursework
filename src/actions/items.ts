import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import facade, { type IItemDB } from '@scripts/facade';

const itemFacade = facade as IItemDB;

export const items = {
  addItem: defineAction({
    input: z.object({
      name: z.string(),
      price: z.number(),
      amount: z.number()
    }),
    handler: async ({ name, price, amount }, _context) => {
      return await itemFacade.addItem({
        name,
        price,
        unitsInStock: amount
      });
    }
  }),
  deleteItem: defineAction({
    input: z.number(),
    handler: async (id, _context) => {
      return await itemFacade.deleteItem(id);
    }
  }),
  updateItem: defineAction({
    input: z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      amount: z.number()
    }),
    handler: async ({ id, name, price, amount }, _context) => {
      const item = await itemFacade.updateItem(id, {
        name,
        price,
        unitsInStock: amount
      });

      return item;
    }
  }),
}
