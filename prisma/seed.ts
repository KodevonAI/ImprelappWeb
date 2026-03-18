import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@imprelapp.com" },
    update: {},
    create: {
      email: "admin@imprelapp.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "rodamientos" },
      update: {},
      create: {
        name: "Rodamientos",
        slug: "rodamientos",
        description: "Rodamientos de bola, rodillos y agujas para aplicaciones industriales",
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "pinones" },
      update: {},
      create: {
        name: "Piñones",
        slug: "pinones",
        description: "Piñones de transmisión de potencia para cadenas de rodillos",
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "correas" },
      update: {},
      create: {
        name: "Correas",
        slug: "correas",
        description: "Correas de transmisión en V, dentadas y planas para maquinaria",
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: "ferreteria" },
      update: {},
      create: {
        name: "Ferretería",
        slug: "ferreteria",
        description: "Tornillos, tuercas, pernos y elementos de unión industriales",
        active: true,
      },
    }),
  ]);
  console.log("✅ Categories created:", categories.map((c) => c.name).join(", "));

  const [rodamientos, pinones, correas, ferreteria] = categories;

  // Products
  const products = [
    {
      name: "Rodamiento 6205-2RS",
      slug: "rodamiento-6205-2rs",
      description: "Rodamiento de bola de ranura profunda, sellado con doble sello de caucho. Ideal para motores eléctricos y bombas.",
      price: 12500,
      stock: 150,
      sku: "ROD-6205-2RS",
      featured: true,
      active: true,
      categoryId: rodamientos.id,
    },
    {
      name: "Rodamiento 6306 ZZ",
      slug: "rodamiento-6306-zz",
      description: "Rodamiento de bola protegido con escudos metálicos en ambos lados. Alta velocidad y larga duración.",
      price: 18900,
      stock: 80,
      sku: "ROD-6306-ZZ",
      featured: true,
      active: true,
      categoryId: rodamientos.id,
    },
    {
      name: "Rodamiento 6001-2Z",
      slug: "rodamiento-6001-2z",
      description: "Rodamiento miniatura de bola con escudos de acero. Para pequeños motores y ventiladores.",
      price: 7800,
      stock: 200,
      sku: "ROD-6001-2Z",
      featured: false,
      active: true,
      categoryId: rodamientos.id,
    },
    {
      name: "Rodamiento NTN 6207",
      slug: "rodamiento-ntn-6207",
      description: "Rodamiento de bola abierto NTN de alta calidad. Para transmisiones y reductores.",
      price: 22000,
      stock: 60,
      sku: "ROD-NTN-6207",
      featured: false,
      active: true,
      categoryId: rodamientos.id,
    },
    {
      name: "Piñón #40 15 Dientes",
      slug: "pinon-40-15-dientes",
      description: "Piñón para cadena #40 con 15 dientes. Material: acero al carbono tratado térmicamente.",
      price: 35000,
      stock: 45,
      sku: "PIN-40-15T",
      featured: true,
      active: true,
      categoryId: pinones.id,
    },
    {
      name: "Piñón #50 25 Dientes",
      slug: "pinon-50-25-dientes",
      description: "Piñón para cadena #50 con 25 dientes. Alta resistencia para aplicaciones de media carga.",
      price: 52000,
      stock: 30,
      sku: "PIN-50-25T",
      featured: false,
      active: true,
      categoryId: pinones.id,
    },
    {
      name: "Piñón Doble #60 20 Dientes",
      slug: "pinon-doble-60-20-dientes",
      description: "Piñón doble para cadena #60 de 20 dientes. Transmisión de alta potencia.",
      price: 85000,
      stock: 20,
      sku: "PIN-D60-20T",
      featured: false,
      active: true,
      categoryId: pinones.id,
    },
    {
      name: "Correa A-42",
      slug: "correa-a-42",
      description: "Correa en V tipo A de 42 pulgadas. Para compresores y bombas industriales.",
      price: 28000,
      stock: 100,
      sku: "COR-A42",
      featured: true,
      active: true,
      categoryId: correas.id,
    },
    {
      name: "Correa B-60",
      slug: "correa-b-60",
      description: "Correa en V tipo B de 60 pulgadas. Alta resistencia a calor y aceite.",
      price: 42000,
      stock: 75,
      sku: "COR-B60",
      featured: false,
      active: true,
      categoryId: correas.id,
    },
    {
      name: "Correa Dentada HTD 5M",
      slug: "correa-dentada-htd-5m",
      description: "Correa dentada sincrónica HTD perfil 5M. Transmisión precisa sin deslizamiento.",
      price: 65000,
      stock: 40,
      sku: "COR-HTD-5M",
      featured: true,
      active: true,
      categoryId: correas.id,
    },
    {
      name: "Perno Hexagonal M12 x 60",
      slug: "perno-hexagonal-m12-60",
      description: "Perno hexagonal M12 x 60mm grado 8.8. Para estructuras y maquinaria.",
      price: 2500,
      stock: 500,
      sku: "FER-PHM12-60",
      featured: false,
      active: true,
      categoryId: ferreteria.id,
    },
    {
      name: "Tuerca Hexagonal M12",
      slug: "tuerca-hexagonal-m12",
      description: "Tuerca hexagonal M12 grado 8 zincada. Complemento para pernos M12.",
      price: 800,
      stock: 1000,
      sku: "FER-THM12",
      featured: false,
      active: true,
      categoryId: ferreteria.id,
    },
    {
      name: "Chaveta 10x8x50",
      slug: "chaveta-10x8x50",
      description: "Chaveta paralela 10x8x50mm en acero C45. Para transmisión entre eje y cubo.",
      price: 5500,
      stock: 200,
      sku: "FER-CH10850",
      featured: false,
      active: true,
      categoryId: ferreteria.id,
    },
    {
      name: "Retenedor TC 40x60x10",
      slug: "retenedor-tc-40x60x10",
      description: "Retenedor de aceite TC 40x60x10mm. Sellado de ejes giratorios.",
      price: 9500,
      stock: 120,
      sku: "FER-RET-406010",
      featured: false,
      active: true,
      categoryId: ferreteria.id,
    },
    {
      name: "Rodamiento Cónico 30206",
      slug: "rodamiento-conico-30206",
      description: "Rodamiento de rodillos cónicos 30206. Para aplicaciones con cargas combinadas axiales y radiales.",
      price: 45000,
      stock: 35,
      sku: "ROD-CON-30206",
      featured: true,
      active: true,
      categoryId: rodamientos.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} products created`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Email: admin@imprelapp.com");
  console.log("   Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
