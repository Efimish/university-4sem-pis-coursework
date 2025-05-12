import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import facade, { type IUserDB } from '@scripts/facade';
import argon2 from 'argon2';

const userFacade = facade as IUserDB;

export const auth = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      login: z.string(),
      password: z.string()
    }),
    handler: async ({ login, password }, context) => {
      const user = await userFacade.getUserByLogin(login);

      if (!user) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: 'Такой пользователь не найден'
        });
      }

      const correct = await argon2.verify(user.passwordHash, password);

      if (!correct) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: 'Неверный пароль'
        });
      }

      context.session?.set('user', {
        id: user.id,
        login: user.login,
        name: user.name,
        isManager: user.isManager
      });
    }
  }),
  register: defineAction({
    accept: 'form',
    input: z.object({
      login: z.string(),
      password: z.string(),
      name: z.string()
    }),
    handler: async ({ login, password, name }, context) => {
      const user = await userFacade.getUserByLogin(login);

      if (user) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: 'Такой пользователь уже существует'
        });
      }

      const passwordHash = await argon2.hash(password);

      const newUser = await userFacade.addUser({
        login,
        passwordHash,
        name
      });

      context.session?.set('user', {
        id: newUser.id,
        login: newUser.login,
        name: newUser.name,
        isManager: newUser.isManager
      });
    }
  }),
  logout: defineAction({
    accept: 'form',
    input: z.any(),
    handler: async (_, context) => {
      context.session?.destroy();
    }
  }),
  whoami: defineAction({
    handler: async (_, context) => {
      return context.session?.get("user");
    }
  })
}
