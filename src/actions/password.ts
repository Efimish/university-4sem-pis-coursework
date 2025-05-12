import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import argon2 from 'argon2';

export const password = {
  hash: defineAction({
    input: z.string(),
    handler: async (password) => {
      return await argon2.hash(password);
    }
  }),
  verify: defineAction({
    input: z.string().array().length(2),
    handler: async ([password, hash]) => {
      return await argon2.verify(hash, password);
    }
  })
}
