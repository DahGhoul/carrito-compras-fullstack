import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: "ADMIN", name: "Administrador" },
    { code: "CLIENTE", name: "Cliente" },
    { code: "GERENTE_VENTAS", name: "Gerente de Ventas" },
    { code: "GERENTE_INVENTARIO", name: "Gerente de Inventario" },
    { code: "VENDEDOR", name: "Vendedor" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: role
    });
  }

  await prisma.systemConfig.upsert({
    where: { key: "IMPUESTO_PORCENTAJE" },
    update: { value: "0.18" },
    create: { key: "IMPUESTO_PORCENTAJE", value: "0.18" }
  });

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const clientePassword = await bcrypt.hash("Cliente123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {
      firstName: "Admin",
      lastName: "Sistema",
      passwordHash: adminPassword
    },
    create: {
      email: "admin@ecommerce.com",
      firstName: "Admin",
      lastName: "Sistema",
      passwordHash: adminPassword,
      emailVerified: true
    }
  });

  const cliente = await prisma.user.upsert({
    where: { email: "cliente@example.com" },
    update: {
      firstName: "Cliente",
      lastName: "Demo",
      passwordHash: clientePassword
    },
    create: {
      email: "cliente@example.com",
      firstName: "Cliente",
      lastName: "Demo",
      passwordHash: clientePassword,
      emailVerified: true
    }
  });

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: "ADMIN" } });
  const clienteRole = await prisma.role.findUniqueOrThrow({ where: { code: "CLIENTE" } });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: cliente.id,
        roleId: clienteRole.id
      }
    },
    update: {},
    create: {
      userId: cliente.id,
      roleId: clienteRole.id
    }
  });

  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id }
  });

  await prisma.cart.upsert({
    where: { userId: cliente.id },
    update: {},
    create: { userId: cliente.id }
  });

  const categorias = [
    { code: "TEC", name: "Tecnologia" },
    { code: "HOG", name: "Hogar" },
    { code: "MOD", name: "Moda" },
    { code: "DEP", name: "Deportes" }
  ];

  for (const categoria of categorias) {
    await prisma.category.upsert({
      where: { code: categoria.code },
      update: { name: categoria.name },
      create: categoria
    });
  }

  const marcas = [
    { code: "GEN", name: "Generica" },
    { code: "NOVA", name: "Nova" },
    { code: "ALFA", name: "Alfa" }
  ];

  for (const marca of marcas) {
    await prisma.brand.upsert({
      where: { code: marca.code },
      update: { name: marca.name },
      create: marca
    });
  }

  const catTecnologia = await prisma.category.findUniqueOrThrow({ where: { code: "TEC" } });
  const catHogar = await prisma.category.findUniqueOrThrow({ where: { code: "HOG" } });
  const catModa = await prisma.category.findUniqueOrThrow({ where: { code: "MOD" } });
  const catDeportes = await prisma.category.findUniqueOrThrow({ where: { code: "DEP" } });
  const marcaGenerica = await prisma.brand.findUniqueOrThrow({ where: { code: "GEN" } });

  const productos = [
    { sku: "PRD-001", name: "Smartphone X1", categoryId: catTecnologia.id, price: 899.9, stock: 55 },
    { sku: "PRD-002", name: "Laptop Air 14", categoryId: catTecnologia.id, price: 1599.5, stock: 21 },
    { sku: "PRD-003", name: "Auriculares Pro", categoryId: catTecnologia.id, price: 129.0, stock: 120 },
    { sku: "PRD-004", name: "Monitor 27 pulgadas", categoryId: catTecnologia.id, price: 349.9, stock: 42 },
    { sku: "PRD-005", name: "Silla Ergonomica", categoryId: catHogar.id, price: 289.0, stock: 37 },
    { sku: "PRD-006", name: "Lampara LED", categoryId: catHogar.id, price: 49.9, stock: 80 },
    { sku: "PRD-007", name: "Mesa de Centro", categoryId: catHogar.id, price: 219.0, stock: 25 },
    { sku: "PRD-008", name: "Juego de Sabanas", categoryId: catHogar.id, price: 39.5, stock: 100 },
    { sku: "PRD-009", name: "Chaqueta Urbana", categoryId: catModa.id, price: 79.9, stock: 95 },
    { sku: "PRD-010", name: "Zapatillas Runner", categoryId: catModa.id, price: 109.9, stock: 70 },
    { sku: "PRD-011", name: "Jeans Slim Fit", categoryId: catModa.id, price: 59.9, stock: 88 },
    { sku: "PRD-012", name: "Camisa Formal", categoryId: catModa.id, price: 45.0, stock: 65 },
    { sku: "PRD-013", name: "Bicicleta Urbana", categoryId: catDeportes.id, price: 499.0, stock: 18 },
    { sku: "PRD-014", name: "Mancuernas 10kg", categoryId: catDeportes.id, price: 89.5, stock: 44 },
    { sku: "PRD-015", name: "Colchoneta Yoga", categoryId: catDeportes.id, price: 29.9, stock: 130 },
    { sku: "PRD-016", name: "Balon Futbol Pro", categoryId: catDeportes.id, price: 35.0, stock: 60 },
    { sku: "PRD-017", name: "Tablet Plus", categoryId: catTecnologia.id, price: 399.0, stock: 39 },
    { sku: "PRD-018", name: "Reloj Inteligente", categoryId: catTecnologia.id, price: 199.0, stock: 72 },
    { sku: "PRD-019", name: "Mochila Viaje", categoryId: catModa.id, price: 69.0, stock: 50 },
    { sku: "PRD-020", name: "Cafetera Premium", categoryId: catHogar.id, price: 149.0, stock: 29 }
  ];

  for (const producto of productos) {
    const created = await prisma.product.upsert({
      where: { sku: producto.sku },
      update: {
        name: producto.name,
        categoryId: producto.categoryId,
        priceCost: producto.price * 0.7,
        priceSale: producto.price,
        stock: producto.stock,
        stockMin: 5,
        brandId: marcaGenerica.id,
        descriptionShort: `Descripcion corta de ${producto.name}`,
        descriptionLong: `Descripcion extendida de ${producto.name}.`
      },
      create: {
        sku: producto.sku,
        name: producto.name,
        categoryId: producto.categoryId,
        brandId: marcaGenerica.id,
        priceCost: producto.price * 0.7,
        priceSale: producto.price,
        stock: producto.stock,
        stockMin: 5,
        descriptionShort: `Descripcion corta de ${producto.name}`,
        descriptionLong: `Descripcion extendida de ${producto.name}.`
      }
    });

    await prisma.productImage.upsert({
      where: {
        id: `${created.id}-main-image`
      },
      update: {
        url: "https://picsum.photos/600/600",
        isMain: true
      },
      create: {
        id: `${created.id}-main-image`,
        productId: created.id,
        url: "https://picsum.photos/600/600",
        isMain: true
      }
    });
  }

  // Crear una orden de prueba para que los reportes tengan datos
  const smartphone = await prisma.product.findUniqueOrThrow({ where: { sku: "PRD-001" } });
  const laptop = await prisma.product.findUniqueOrThrow({ where: { sku: "PRD-002" } });

  const order = await prisma.order.create({
    data: {
      code: `ORD-SEED-${Date.now()}`,
      userId: cliente.id,
      status: "PAGADA",
      subtotal: 2499.4,
      tax: 449.89,
      shipping: 0,
      total: 2949.29,
      paymentMethod: "tarjeta",
      paymentStatus: "completado",
      items: {
        create: [
          { productId: smartphone.id, quantity: 1, unitPrice: 899.9, subtotal: 899.9 },
          { productId: laptop.id, quantity: 1, unitPrice: 1599.5, subtotal: 1599.5 }
        ]
      },
      statusHistory: {
        create: [
          { status: "PENDIENTE_PAGO", comment: "Orden iniciada" },
          { status: "PAGADA", comment: "Pago confirmado mediante seed" }
        ]
      }
    }
  });

  console.log(`Seed ejecutado correctamente. Orden de prueba creada: ${order.code}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });