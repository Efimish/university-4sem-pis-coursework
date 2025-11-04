import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import facade, { type IUserDB } from '@scripts/facade';

const userFacade = facade as IUserDB;

export const user = {
  getCart: defineAction({
    input: z.number(),
    handler: async (userId, _context) => {
      return await userFacade.getUserCart(userId);
    },
  }),
  clearCart: defineAction({
    input: z.number(),
    handler: async (userId, _context) => {
      return await userFacade.setUserCart(userId, []);
    },
  }),
  setItemInCartAmount: defineAction({
    input: z.object({
      userId: z.number(),
      itemId: z.number(),
      amount: z.number().min(0),
    }),
    handler: async ({ userId, itemId, amount }, _context) => {
      return await userFacade.setItemInCartAmount(userId, itemId, amount);
    },
  }),
  setItemInCartActive: defineAction({
    input: z.object({
      userId: z.number(),
      itemId: z.number(),
      active: z.boolean(),
    }),
    handler: async ({ userId, itemId, active }, _context) => {
      return await userFacade.setItemInCartActive(userId, itemId, active);
    },
  }),
}
