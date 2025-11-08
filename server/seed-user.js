import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      clerkId: 'user_34ylwjGjTisYzcPr4FAp8Nae6Vw',  // ← Replace with your actual ID!
      email: 'snehachoukseyobc@gmail.com',      // ← Your email
      name: 'Sneha chouksey',
      isOwner: true,  // Set to true for unlimited credits
    }
  });
  console.log('✅ User created:', user);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
