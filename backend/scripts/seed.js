const { PrismaClient } = require('@prisma/client');
const DataLoader = require('../dataLoader');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const dataLoader = new DataLoader('../../dataset');

async function main() {
    console.log('Loading CSVs into memory...');
    await dataLoader.loadAll();

    console.log('Seeding Users...');
    for (const profile of dataLoader.profiles) {
        // Hash a default password for each user to allow login
        const passwordHash = await bcrypt.hash('password123', 10);
        await prisma.user.upsert({
            where: { user_id: profile.user_id },
            update: {},
            create: {
                user_id: profile.user_id,
                password: passwordHash,
                home_currency: profile.home_currency,
                available_balance: parseFloat(profile.available_balance),
                minimum_balance_to_keep: parseFloat(profile.minimum_balance_to_keep),
                payment_methods_user_will_consider: profile.payment_methods_user_will_consider
            }
        });
    }

    console.log('Seeding Events...');
    for (const event of dataLoader.events) {
        await prisma.event.upsert({
            where: { event_id: event.event_id },
            update: {},
            create: {
                event_id: event.event_id,
                user_id: event.user_id,
                event_type: event.event_type,
                amount: parseFloat(event.amount),
                date: event.date,
                description: event.description
            }
        });
    }

    console.log('Seeding Requests...');
    for (const req of dataLoader.requests) {
        await prisma.request.upsert({
            where: { request_id: req.request_id },
            update: {},
            create: {
                request_id: req.request_id,
                user_id: req.user_id,
                type: req.type,
                target_amount: parseFloat(req.target_amount),
                currency: req.currency,
                status: req.status,
                date: req.date
            }
        });
    }

    console.log('Seeding Payment Options...');
    for (const opt of dataLoader.paymentOptions) {
        await prisma.paymentOption.upsert({
            where: { option_id: opt.option_id },
            update: {},
            create: {
                option_id: opt.option_id,
                request_id: opt.request_id,
                method: opt.method,
                amount: parseFloat(opt.amount),
                currency: opt.currency,
                terms: opt.terms
            }
        });
    }

    console.log('Seeding Messages...');
    for (const msg of dataLoader.messages) {
        await prisma.message.upsert({
            where: { message_id: msg.message_id },
            update: {},
            create: {
                message_id: msg.message_id,
                user_id: msg.user_id,
                request_id: msg.request_id || null,
                related_event_id: msg.related_event_id || null,
                timestamp: msg.timestamp,
                sender: msg.sender,
                content: msg.content
            }
        });
    }

    console.log('Seeding Images...');
    for (const img of dataLoader.images) {
        await prisma.image.upsert({
            where: { image_id: img.image_id },
            update: {},
            create: {
                image_id: img.image_id,
                user_id: img.user_id,
                request_id: img.request_id || null,
                related_event_id: img.related_event_id || null,
                image_path: img.image_path,
                context: img.context
            }
        });
    }

    console.log('Database seeding complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
