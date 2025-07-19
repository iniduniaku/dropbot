const Keyboards = require('../utils/keyboards');
const config = require('../config/config');

class MenuHandler {
    static async showMainMenu(ctx) {
        try {
            const message = `🚀 *Menu Utama - Catatan Airdrop*\n\n` +
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
                          `Terima kasih telah menggunakan Airdrop Tracker Bot! 🙏\n\n` +
                          `Jika bot ini membantu Anda dalam mengelola tugas airdrop, ` +
                          `pertimbangkan untuk memberikan dukungan melalui:\n\n` +
                          `🎁 *Trakteer* - Platform donasi Indonesia\n` +
                          `Dukungan berkala atau sekali bayar\n\n` +
                          `💰 *EVM Wallet* - Cryptocurrency\n` +
                          `Support: ETH, BNB, MATIC, AVAX, dll\n` +
                          `(Network: Ethereum, BSC, Polygon, Avalanche)\n\n` +
                          `*Setiap dukungan sangat berarti untuk pengembangan bot ini!*\n\n` +
                          `Klik tombol di bawah untuk memilih metode donasi:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.donation().reply_markup,
                    disable_web_page_preview: true
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.donation(), {
                    disable_web_page_preview: true
                });
            }
        } catch (error) {
            console.error('Error showing donation:', error);
            await ctx.reply('❌ Gagal menampilkan info donasi.');
        }
    }

    static async showWallet(ctx) {
        try {
            const walletAddress = config.DONATION.EVM_WALLET;
            const message = `💰 *EVM Wallet Address*\n\n` +
                          `*Address:*\n\`${walletAddress}\`\n\n` +
                          `*Supported Networks:*\n` +
                          `• Ethereum (ETH)\n` +
                          `• Binance Smart Chain (BNB)\n` +
                          `• Polygon (MATIC)\n` +
                          `• Avalanche (AVAX)\n` +
                          `• Arbitrum (ETH)\n` +
                          `• Optimism (ETH)\n\n` +
                          `*Supported Tokens:*\n` +
                          `• Native tokens (ETH, BNB, MATIC, AVAX)\n` +
                          `• USDT, USDC, DAI\n` +
                          `• Semua ERC-20/BEP-20 tokens\n\n` +
                          `⚠️ *Penting:* Pastikan Anda mengirim ke network yang benar!\n\n` +
                          `Terima kasih atas dukungan Anda! 🙏`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.walletKeyboard().reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.walletKeyboard());
            }
        } catch (error) {
            console.error('Error showing wallet:', error);
            await ctx.reply('❌ Gagal menampilkan info wallet.');
        }
    }

    static async copyWallet(ctx) {
        try {
            const walletAddress = config.DONATION.EVM_WALLET;
            await ctx.answerCbQuery(
                `✅ Alamat wallet telah disalin!\n${walletAddress}`,
                { show_alert: true }
            );
        } catch (error) {
            console.error('Error copying wallet:', error);
            await ctx.answerCbQuery('❌ Gagal menyalin alamat wallet.');
        }
    }

    static async showDeveloperContact(ctx) {
        try {
            const message = `👨‍💻 *Contact Developer*\n\n` +
                          `*Developer:* ${config.DEVELOPER.NAME}\n` +
                          `*Telegram:* ${config.DEVELOPER.TELEGRAM}\n` +
                          `*Channel:* https://t.me/catatanairdropbot\n\n` +
                          `📋 *Layanan yang tersedia:*\n` +
                          `• Custom bot development\n` +
                          `• Bug reports dan feature requests\n` +
                          `• Technical support\n` +
                          `• Airdrop information sharing\n\n` +
                          `📢 *Channel Info:*\n` +
                          `Dapatkan update terbaru tentang airdrop, ` +
                          `tutorial, dan tips crypto di channel kami.\n\n` +
                          `Klik tombol di bawah untuk menghubungi:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.developerInfo().reply_markup,
                    disable_web_page_preview: true
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.developerInfo(), {
                    disable_web_page_preview: true
                });
            }
        } catch (error) {
            console.error('Error showing developer contact:', error);
            await ctx.reply('❌ Gagal menampilkan info developer.');
        }
    }

    static async showChannel(ctx) {
        try {
            const message = `📢 *Catatan Airdrop Channel*\n\n` +
                          `Join channel kami untuk mendapatkan:\n\n` +
                          `🎯 *Update Airdrop Terbaru*\n` +
                          `• Project airdrop baru\n` +
                          `• Deadline dan reminder\n` +
                          `• Status update dari project\n\n` +
                          `💡 *Tutorial & Tips*\n` +
                          `• Cara mengikuti airdrop\n` +
                          `• Best practices\n` +
                          `• Security tips\n\n` +
                          `📊 *Market Analysis*\n` +
                          `• Token analysis\n` +
                          `• Project reviews\n` +
                          `• Community feedback\n\n` +
                          `🤖 *Bot Updates*\n` +
                          `• Fitur baru\n` +
                          `• Bug fixes\n` +
                          `• Maintenance info\n\n` +
                          `Join sekarang dan jangan lewatkan update penting!`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard([
                        [Markup.button.url('📢 Join Channel', 'https://t.me/catatanairdropbot')],
                        [
                            Markup.button.callback('💝 Donasi', 'show_donation'),
                            Markup.button.callback('🔙 Menu Utama', 'main_menu')
                        ]
                    ]).reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Markup.inlineKeyboard([
                    [Markup.button.url('📢 Join Channel', 'https://t.me/catatanairdropbot')],
                    [
                        Markup.button.callback('💝 Donasi', 'show_donation'),
                        Markup.button.callback('🔙 Menu Utama', 'main_menu')
                    ]
                ]));
            }
        } catch (error) {
            console.error('Error showing channel info:', error);
            await ctx.reply('❌ Gagal menampilkan info channel.');
        }
    }
}

module.exports = MenuHandler;
