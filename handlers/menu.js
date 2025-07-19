const Keyboards = require('../utils/keyboards');
const config = require('../config/config');

class MenuHandler {
    static async showMainMenu(ctx) {
        try {
            const message = `🚀 *Menu Utama - Airdrop Tracker*\n\n` +
                          `Selamat datang kembali, ${ctx.user.firstName}!\n` +
                          `Pilih menu di bawah untuk mengelola tugas airdrop Anda:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.mainMenu().reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.mainMenu());
            }
        } catch (error) {
            console.error('Error showing main menu:', error);
            await ctx.reply('❌ Gagal menampilkan menu utama.');
        }
    }

    static async showHelp(ctx) {
        try {
            if (ctx.callbackQuery) {
                await ctx.editMessageText(config.MESSAGES.HELP, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.backToMenu().reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(config.MESSAGES.HELP, Keyboards.backToMenu());
            }
        } catch (error) {
            console.error('Error showing help:', error);
            await ctx.reply('❌ Gagal menampilkan bantuan.');
        }
    }

    static async showDonation(ctx) {
        try {
            const message = `💝 *Dukung Pengembangan Bot*\n\n` +
                          `Jika bot ini membantu Anda, pertimbangkan untuk memberikan donasi:\n\n` +
                          `*Bitcoin (BTC):*\n\`${config.DONATION.BTC}\`\n\n` +
                          `*Ethereum (ETH):*\n\`${config.DONATION.ETH}\`\n\n` +
                          `*Binance Smart Chain (BNB):*\n\`${config.DONATION.BNB}\`\n\n` +
                          `Terima kasih atas dukungan Anda! 🙏`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.donation().reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.donation());
            }
        } catch (error) {
            console.error('Error showing donation:', error);
            await ctx.reply('❌ Gagal menampilkan info donasi.');
        }
    }

    static async handleDonationCopy(ctx, currency) {
        try {
            const addresses = {
                'btc': config.DONATION.BTC,
                'eth': config.DONATION.ETH,
                'bnb': config.DONATION.BNB
            };

            const address = addresses[currency];
            if (address) {
                await ctx.answerCbQuery(
                    `✅ Alamat ${currency.toUpperCase()} telah disalin!\n${address}`,
                    { show_alert: true }
                );
            }
        } catch (error) {
            console.error('Error copying donation address:', error);
            await ctx.answerCbQuery('❌ Gagal menyalin alamat.');
        }
    }
}

module.exports = MenuHandler;
