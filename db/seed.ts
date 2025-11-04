import { db, eq, User, Item, Order, OrderItem, CartItem } from 'astro:db';
import argon2 from 'argon2';

// https://astro.build/db/seed
export default async function seed() {
  await db.insert(User).values([
    {
      login: "admin",
      passwordHash: await argon2.hash("admin"),
      isManager: true,
      name: "admin"
    },
    {
      login: "user",
      passwordHash: await argon2.hash("user"),
      name: "user 1"
    }
  ]);

  const items = await db.insert(Item).values([
    {
      "name": "iPhone 16 Pro Max 256GB",
      "unitsInStock": 12,
      "price": 114718
    },
    {
      "name": "Samsung Galaxy S25 Ultra 512GB",
      "unitsInStock": 8,
      "price": 130298
    },
    {
      "name": "ThinkPad T480 (i7, 16GB RAM, 512GB SSD)",
      "unitsInStock": 5,
      "price": 65518
    },
    {
      "name": "MacBook Pro 16\" (M4 Max, 1TB, 48GB RAM)",
      "unitsInStock": 3,
      "price": 327918
    },
    {
      "name": "Google Pixel 9 Pro 256GB",
      "unitsInStock": 10,
      "price": 90118
    },
    {
      "name": "Dell XPS 15 (i9, 32GB RAM, 1TB SSD)",
      "unitsInStock": 6,
      "price": 180318
    },
    {
      "name": "ASUS ROG Zephyrus G16 (Ryzen 9, RTX 4070)",
      "unitsInStock": 4,
      "price": 155718
    },
    {
      "name": "Apple iPad Pro 12.9\" (M4, 256GB)",
      "unitsInStock": 15,
      "price": 98318
    },
    {
      "name": "Samsung Galaxy Tab S9 Ultra 512GB",
      "unitsInStock": 7,
      "price": 106518
    },
    {
      "name": "Sony WH-1000XM6 Wireless Headphones",
      "unitsInStock": 20,
      "price": 32718
    },
    {
      "name": "Bose QuietComfort Ultra Headphones",
      "unitsInStock": 18,
      "price": 35178
    },
    {
      "name": "Apple Watch Series 10 (45mm, GPS + Cellular)",
      "unitsInStock": 9,
      "price": 49118
    },
    {
      "name": "Garmin Fenix 8 Pro Solar",
      "unitsInStock": 5,
      "price": 61418
    },
    {
      "name": "Logitech MX Master 4 Wireless Mouse",
      "unitsInStock": 25,
      "price": 10578
    },
    {
      "name": "Keychron K8 Pro Mechanical Keyboard (RGB, Wireless)",
      "unitsInStock": 14,
      "price": 9758
    },
    {
      "name": "LG UltraFine 5K Monitor (27-inch)",
      "unitsInStock": 6,
      "price": 106518
    },
    {
      "name": "Samsung Odyssey Neo G9 (49-inch, 240Hz)",
      "unitsInStock": 3,
      "price": 180318
    },
    {
      "name": "NVIDIA GeForce RTX 5090 Founders Edition",
      "unitsInStock": 2,
      "price": 163918
    },
    {
      "name": "AMD Radeon RX 8900 XT",
      "unitsInStock": 4,
      "price": 122918
    },
    {
      "name": "Valve Steam Deck 2 (512GB)",
      "unitsInStock": 11,
      "price": 53218
    },
    {
      "name": "PlayStation 6 Digital Edition",
      "unitsInStock": 13,
      "price": 49118
    },
    {
      "name": "Xbox Series Z (1TB)",
      "unitsInStock": 10,
      "price": 49118
    },
    {
      "name": "DJI Mini 5 Pro Drone",
      "unitsInStock": 5,
      "price": 81918
    },
    {
      "name": "GoPro Hero 13 Black",
      "unitsInStock": 8,
      "price": 40918
    },
    {
      "name": "Canon EOS R7 Mirrorless Camera (Body Only)",
      "unitsInStock": 4,
      "price": 122918
    },
    {
      "name": "Sony Alpha A7 V (Full-Frame, 24MP)",
      "unitsInStock": 3,
      "price": 163918
    },
    {
      "name": "Microsoft Surface Laptop 6 (i7, 16GB RAM, 512GB SSD)",
      "unitsInStock": 7,
      "price": 139318
    },
    {
      "name": "Lenovo Yoga 9i Gen 9 (14-inch, OLED)",
      "unitsInStock": 6,
      "price": 131118
    },
    {
      "name": "Razer Blade 16 (i9, RTX 4080, 32GB RAM)",
      "unitsInStock": 2,
      "price": 245918
    },
    {
      "name": "Alienware Aurora R16 (i9, RTX 4090, 64GB RAM)",
      "unitsInStock": 1,
      "price": 286918
    }
  ]).returning();

  const user_id = (await db.select().from(User).where(
    eq(User.login, "user")
  ))[0].id;
  const order_id = (await db.insert(Order).values({
    userId: user_id,
    totalPrice: 10000,
    status: "completed"
  }).returning())[0].id;

  await db.insert(OrderItem).values([
    { orderId: order_id, itemId: items[0].id },
    { orderId: order_id, itemId: items[1].id, amount: 3 }
  ]);

  await db.insert(CartItem).values([
    { userId: user_id, itemId: items[2].id, amount: 1 },
    { userId: user_id, itemId: items[3].id, amount: 2, active: false }
  ]);
}
