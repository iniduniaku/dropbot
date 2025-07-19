const db = require('../utils/database');
const Helpers = require('../utils/helpers');
const Keyboards = require('../utils/keyboards');

class StatsHandler {
    static async showStats(ctx) {
        try {
            const userId = ctx.user.telegramId;
            const stats = db.getTaskStats(userId);
            const message = Helpers.formatStats(stats);

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.backToMenu().reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.backToMenu());
            }
        } catch (error) {
            console.error('Error showing stats:', error);
            await ctx.reply('❌ Gagal menampilkan statistik.');
        }
    }

    static async handleStatsCommand(ctx) {
        try {
            const userId = ctx.from.id;
            const user = db.getUserById(userId);
            
            if (!user) {
                return ctx.reply('❌ Silakan mulai dengan /start terlebih dahulu.');
            }

            ctx.user = user;
            await this.showStats(ctx);
        } catch (error) {
            console.error('Error in stats command:', error);
            await ctx.reply('❌ Gagal menampilkan statistik.');
        }
    }
}

module.exports = StatsHandler;
