import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create users
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    const hashedPassword3 = await bcrypt.hash('password789', 10);

    const user1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            username: 'johndoe',
            name: 'John Doe',
            password: hashedPassword1,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            username: 'janesmith',
            name: 'Jane Smith',
            password: hashedPassword2,
        },
    });

    const user3 = await prisma.user.create({
        data: {
            email: 'bob.johnson@example.com',
            username: 'bobjohnson',
            name: 'Bob Johnson',
            password: hashedPassword3,
        },
    });

    console.log('Created users');

    // Create comments
    const comment1 = await prisma.comment.create({
        data: {
            content: 'This is the first comment. What do you think about this topic?',
            authorId: user1.id,
        },
    });

    const comment2 = await prisma.comment.create({
        data: {
            content: 'I completely disagree with the previous statement. Here is my perspective on the matter.',
            authorId: user2.id,
        },
    });

    const comment3 = await prisma.comment.create({
        data: {
            content: 'Great discussion! I think there are valid points on both sides.',
            authorId: user3.id,
        },
    });

    console.log('Created comments');

    // Create replies
    const reply1 = await prisma.reply.create({
        data: {
            content: 'I see your point, but have you considered this alternative view?',
            authorId: user2.id,
            commentId: comment1.id,
        },
    });

    const reply2 = await prisma.reply.create({
        data: {
            content: 'That\'s an interesting perspective. Let me think about it more.',
            authorId: user1.id,
            commentId: comment1.id,
            parentId: reply1.id,
        },
    });

    const reply3 = await prisma.reply.create({
        data: {
            content: 'I agree with the original comment. The evidence supports this view.',
            authorId: user3.id,
            commentId: comment2.id,
        },
    });

    console.log('Created replies');

    // Create likes
    await prisma.like.create({
        data: {
            userId: user1.id,
            commentId: comment3.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: user2.id,
            commentId: comment3.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: user3.id,
            commentId: comment1.id,
        },
    });

    await prisma.like.create({
        data: {
            userId: user1.id,
            commentId: reply3.id,
        },
    });

    console.log('Created likes');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });