const db = require('../utils/database');
const Keyboards = require('../utils/keyboards');
const config = require('../config/config');

class AuthHandler {
    static async handleStart(ctx) {
        try {
            const userId = ctx.from.id;
            const userData = {
                telegramId: userId,
                username: ctx.from.username || '',
                firstName: ctx.from.first_name || '',
                lastName: ctx.from.last_name || ''
            };

            // Create or get existing user
            const user = db.createUser(userData);
            
            await ctx.replyWithMarkdown(
                config.MESSAGES.WELCOME,
                Keyboards.mainMenu()
            );

            // Log new user registration
            if (user.createdAt === user.updatedAt) {
                console.log(`New user registered: ${userData.firstName} (${userId})`);
            }

        } catch (error) {
            console.error('Error in start handler:', error);
            await ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    static async ensureUser(ctx, next) {
        try {
            const userId = ctx.from.id;
            let user = db.getUserById(userId);

            if (!user) {
                const userData = {
                    telegramId: userId,
                    username: ctx.from.username || '',
                    firstName: ctx.from.first_name || '',
                    lastName: ctx.from.last_name || ''
                };
                user = db.createUser(userData);
            }

            ctx.user = user;
            return next();
        } catch (error) {
            console.error('Error in ensureUser middleware:', error);
            await ctx.reply('❌ Terjadi kesalahan sistem. Silakan coba lagi.');
        }
    }
}

module.exports = AuthHandler;
