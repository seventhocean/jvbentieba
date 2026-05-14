import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@juben.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const passwordHash = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      nickname: "管理员",
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create 4 preset topics
  const topics = [
    {
      slug: "player-red",
      name: "玩家红榜",
      description: "分享优秀玩家的精彩表现，记录那些让你难忘的好队友",
      isPreset: true,
    },
    {
      slug: "player-black",
      name: "玩家黑榜",
      description: "吐槽不愉快的游戏体验，让大家避坑",
      isPreset: true,
    },
    {
      slug: "dm-red",
      name: "DM红榜",
      description: "推荐优秀DM，分享精彩主持体验",
      isPreset: true,
    },
    {
      slug: "dm-black",
      name: "DM黑榜",
      description: "分享不佳的DM体验，帮助大家选择",
      isPreset: true,
    },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }

  console.log("4 preset topics created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
