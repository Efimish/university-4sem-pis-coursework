import { defineDb, defineTable, column, NOW, FALSE, TRUE } from 'astro:db';

// https://astro.build/db/config

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    login: column.text({ unique: true }),
    passwordHash: column.text(),
    name: column.text(),
    isManager: column.boolean({ default: FALSE }),
    createdAt: column.date({ default: NOW })
  }
});

const Item = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    price: column.number(),
    unitsInStock: column.number({ default: 0 }),
    createdAt: column.date({ default: NOW })
  }
});

const Order = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => User.columns.id }),
    status: column.text({ enum: ["pending", "packed", "completed", "cancelled"], default: "pending" }),
    totalPrice: column.number(), // WARN: denormalization
    createdAt: column.date({ default: NOW }),
  }
});

const CartItem = defineTable({
  columns: {
    userId: column.number({ references: () => User.columns.id }),
    itemId: column.number({ references: () => Item.columns.id }),
    amount: column.number(),
    active: column.boolean({ default: TRUE }),
  },
  indexes: [
    { on: ["userId", "itemId"], unique: true }
  ]
});

const OrderItem = defineTable({
  columns: {
    orderId: column.number({ references: () => Order.columns.id }),
    itemId: column.number({ references: () => Item.columns.id }),
    amount: column.number({ default: 1 }),
  },
  indexes: [
    { on: ["orderId", "itemId"], unique: true }
  ]
});

export default defineDb({
  tables: { User, Item, Order, CartItem, OrderItem }
});
