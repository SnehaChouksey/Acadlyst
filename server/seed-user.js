import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      clerkId: 'user_34ylwjGjTisYzcPr4FAp8Nae6Vw',  
      email: 'snehachoukseyobc@gmail.com',      
      name: 'Sneha chouksey',
      isOwner: true,  
    }
  });
  console.log(' User created:', user);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
