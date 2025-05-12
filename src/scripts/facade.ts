import { db, User, Item, Order, OrderItem, CartItem, eq, or, and } from "astro:db";

interface FacadeUserInsert {
  login: string;
  passwordHash: string;
  name: string;
}

interface FacadeUserSelect extends FacadeUserInsert {
  id: number;
  isManager: boolean;
  createdAt: Date;
}

interface FacadeItemInsert {
  name: string;
  price: number;
  unitsInStock: number;
}

interface FacadeItemSelect extends FacadeItemInsert {
  id: number;
  createdAt: Date;
}

interface FacadeOrderItem extends FacadeItemSelect {
  amount: number;
}

interface FacadeOrderInsert {
  userId: number;
  items: FacadeOrderItem[];
}

interface FacadeOrderSelectMany extends Omit<FacadeOrderInsert, 'items'> {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: Date;
}

interface FacadeOrderSelect extends FacadeOrderInsert, FacadeOrderSelectMany { }

export interface IUserDB {
  addUser: (user: FacadeUserInsert) => Promise<FacadeUserSelect>;
  getUsers: () => Promise<FacadeUserSelect[]>;
  getUserById: (id: number) => Promise<FacadeUserSelect | undefined>;
  getUserByLogin: (login: string) => Promise<FacadeUserSelect | undefined>;
  getUserCart: (userId: number) => Promise<FacadeOrderItem[] | undefined>;
  setUserCart: (userId: number, cart: FacadeOrderItem[]) => Promise<FacadeOrderItem[] | undefined>
  setItemInCart: (userId: number, itemId: number, amount: number) => Promise<FacadeOrderItem | undefined>;
}

export interface IItemDB {
  addItem: (item: FacadeItemInsert) => Promise<FacadeItemSelect>;
  getItems: () => Promise<FacadeItemSelect[]>;
  getItemById: (id: number) => Promise<FacadeItemSelect | undefined>;
  updateItem: (id: number, item: Partial<FacadeItemInsert>) => Promise<FacadeItemSelect | undefined>;
  deleteItem: (id: number) => Promise<FacadeItemSelect | undefined>;
}

export interface IOrderDB {
  addOrder: (order: FacadeOrderInsert) => Promise<FacadeOrderSelect>;
  addOrderByUserId: (userId: number) => Promise<FacadeOrderSelect | undefined>;
  getOrders: () => Promise<FacadeOrderSelectMany[]>;
  getOrderById: (id: number) => Promise<FacadeOrderSelect | undefined>;
  getOrdersByUserId: (userId: number) => Promise<FacadeOrderSelectMany[] | undefined>;
  setOrderStatus: (orderId: number, status: string) => Promise<FacadeOrderSelectMany | undefined>;
}

class FacadeDB implements IUserDB, IItemDB, IOrderDB {
  // USERS
  addUser = async (user: FacadeUserInsert) => {
    const [newUser] = await db.insert(User).values(user).returning();
    return newUser;
  }

  getUsers = async () => {
    const users = await db.select().from(User);
    return users;
  }

  getUserById = async (id: number) => {
    const users = await db.select().from(User)
      .where(
        eq(User.id, id)
      );
    return users[0];
  };

  getUserByLogin = async (login: string) => {
    const users = await db.select().from(User)
      .where(
        eq(User.login, login)
      );
    return users[0];
  };

  getUserCart = async (userId: number) => {
    const users = await db.select({ id: User.id }).from(User)
      .where(
        eq(User.id, userId)
      );
    if (users.length < 1) return;

    const cart = await db.select().from(CartItem)
      .where(eq(CartItem.userId, userId))
      .innerJoin(Item, eq(CartItem.itemId, Item.id));

    return cart.map(
      ({
        Item,
        CartItem: { amount },
      }) =>
      ({
        ...Item,
        amount,
      })
    );
  };

  setUserCart = async (userId: number, cart: FacadeOrderItem[]) => {
    const users = await db.select({ id: User.id }).from(User)
      .where(
        eq(User.id, userId)
      );
    if (users.length < 1) return;

    await db.delete(CartItem).where(
      eq(CartItem.userId, userId)
    );

    await db.insert(CartItem).values(
      cart.map(i => ({
        userId,
        itemId: i.id,
        amount: i.amount
      }))
    );

    return cart;
  }

  setItemInCart = async (userId: number, itemId: number, amount: number) => {
    const users = await db.select({ id: User.id }).from(User)
      .where(
        eq(User.id, userId)
      );
    if (users.length < 1) return;

    const items = await db.select({ id: Item.id }).from(Item)
      .where(
        eq(Item.id, itemId)
      );
    if (items.length < 1) return;

    const [item] = (await db.select().from(CartItem)
      .where(
        and(
          eq(CartItem.userId, userId),
          eq(CartItem.itemId, itemId)
        )
      ).innerJoin(Item, eq(CartItem.itemId, Item.id)))
      .map(({ Item, CartItem: { amount} }) => ({
        ...Item,
        amount,
      })
    );

    // here we remove the item from cart
    if (amount < 1) {
      if (item === undefined) return;

      await db.delete(CartItem).where(
        and(
          eq(CartItem.userId, userId),
          eq(CartItem.itemId, itemId),
        )
      ).returning();

      return item;
    }

    // here we increase the item amount in cart
    if (item !== undefined) {
      const [updatedCartItem] = await db.update(CartItem)
        .set({ amount })
        .where(
          and(
            eq(CartItem.userId, userId),
            eq(CartItem.itemId, itemId)
          )
        )
        .returning();
      return {
        ...item,
        amount: updatedCartItem.amount,
      };
      // here we add the item to cart
    } else {
      await db.insert(CartItem).values({
        userId,
        itemId,
        amount
      }).returning();
      const [newItem] = (await db.select().from(CartItem)
      .where(
        and(
          eq(CartItem.userId, userId),
          eq(CartItem.itemId, itemId)
        )
      ).innerJoin(Item, eq(CartItem.itemId, Item.id)))
      .map(({ Item, CartItem: { amount} }) => ({
        ...Item,
        amount,
      })
    );
      return newItem;
    }
  };

  // ITEMS
  addItem = async (item: FacadeItemInsert) => {
    const [newItem] = await db.insert(Item).values(item).returning();
    return newItem;
  }

  getItems = async () => {
    const items = await db.select().from(Item);
    return items;
  }

  getItemById = async (id: number) => {
    const items = await db.select().from(Item)
      .where(
        eq(Item.id, id)
      )
    return items[0];
  }

  updateItem = async (id: number, item: Partial<FacadeItemInsert>) => {
    const items = await db.select().from(Item)
      .where(
        eq(Item.id, id)
      );
    if (items.length < 1) return;

    const [updatedItem] = await db.update(Item)
      .set(item)
      .where(
        eq(Item.id, id)
      )
      .returning();

    return updatedItem;
  };

  deleteItem = async (id: number) => {
    const items = await db.select().from(Item)
      .where(
        eq(Item.id, id)
      );
    if (items.length < 1) return;

    const [deletedItem] = await db.delete(Item)
      .where(
        eq(Item.id, id)
      )
      .returning();

    return deletedItem;
  };

  // ORDERS
  addOrder = async (order: FacadeOrderInsert) => {
    const totalPrice = order.items.reduce((acc, item) => acc + item.price * item.amount, 0);
    const addOrder = {
      ...order,
      totalPrice
    }
    const [newOrder] = await db.insert(Order).values(addOrder).returning();
    const items = order.items.map(i => ({
      orderId: newOrder.id,
      itemId: i.id,
      amount: i.amount
    }));
    await db.insert(OrderItem).values(items);

    return {
      ...newOrder,
      ...order,
    };
  }

  addOrderByUserId = async (userId: number) => {
    const cart = await this.getUserCart(userId);
    if (!cart) return;
    const order: FacadeOrderInsert = {
      userId,
      items: cart,
    }
    const newOrder = await this.addOrder(order);
    order.items.forEach(async (item) => {
      await this.updateItem(item.id, { unitsInStock: item.unitsInStock - item.amount });
    });
    await this.setUserCart(userId, []);
    return newOrder;
  };

  getOrders = async () => {
    const orders = await db.select().from(Order);
    return orders;
  }

  getOrderById = async (id: number) => {
    const orders = await db.select().from(Order)
      .where(
        eq(Order.id, id)
      );
    if (orders.length < 1) return;

    const order = orders[0];
    const orderItems = await db.select().from(OrderItem)
      .where(eq(OrderItem.orderId, order.id))
      .innerJoin(Item, eq(OrderItem.itemId, Item.id));
    return {
      ...order,
      items: orderItems.map(i => ({
        ...i.Item,
        amount: i.OrderItem.amount
      }))
    };
  };

  getOrdersByUserId = async (userId: number) => {
    const users = await db.select({ id: User.id }).from(User)
      .where(
        eq(User.id, userId)
      );
    if (users.length < 1) return;

    const orders = await db.select().from(Order)
      .where(
        eq(Order.userId, userId)
      );
    return orders;
  }

  setOrderStatus = async (orderId: number, status: string) => {
    const orders = await db.select().from(Order)
      .where(
        eq(Order.id, orderId)
      );
    if (orders.length < 1) return;

    const newOrders = await db.update(Order)
      .set({ status })
      .where(
        eq(Order.id, orderId)
      )
      .returning();

    return newOrders[0];
  };
}

export default new FacadeDB();
