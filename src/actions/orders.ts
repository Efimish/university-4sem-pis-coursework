import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import facade, { type IOrderDB } from '@scripts/facade';

const orderFacade = facade as IOrderDB;

export const orders = {
  addOrderByUserId: defineAction({
    input: z.number(),
    handler: async (userId, _context) => {
      return await orderFacade.addOrderByUserId(userId);
    }
  }),
  setOrderStatus: defineAction({
    input: z.object({
      orderId: z.number(),
      status: z.enum(['pending', 'packed', 'completed', 'cancelled'])
    }),
    handler: async ({ orderId, status }, _context) => {
      return await orderFacade.setOrderStatus(orderId, status);
    }
  }),
  cancelOrder: defineAction({
    input: z.number(),
    handler: async (orderId, _context) => {
      return await orderFacade.setOrderStatus(orderId, 'cancelled');
    }
  })
}
