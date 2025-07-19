const db = require('../utils/database');
const Helpers = require('../utils/helpers');
const Keyboards = require('../utils/keyboards');

// User sessions untuk menyimpan data sementara
const userSessions = new Map();

class TaskHandler {
    static async listTasks(ctx, page = 0) {
        try {
            const userId = ctx.user.telegramId;
            const tasks = db.getUserTasks(userId);
            
            if (tasks.length === 0) {
                const message = '📝 *Belum ada tugas airdrop*\n\nKlik "Tambah Tugas" untuk menambahkan project airdrop pertama Anda!';
                
                if (ctx.callbackQuery) {
                    await ctx.editMessageText(message, {
                        parse_mode: 'Markdown',
                        reply_markup: Keyboards.backToMenu().reply_markup
                    });
                } else {
                    await ctx.replyWithMarkdown(message, Keyboards.backToMenu());
                }
                return;
            }

            const message = `📋 *Daftar Tugas Airdrop (${tasks.length})*\n\nPilih tugas untuk melihat detail:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.taskList(tasks, page).reply_markup
                });
            } else {
                await ctx.replyWithMarkdown(message, Keyboards.taskList(tasks, page));
            }
        } catch (error) {
            console.error('Error listing tasks:', error);
            await ctx.reply('❌ Gagal menampilkan daftar tugas.');
        }
    }

    static async showStatusFilter(ctx) {
        try {
            const message = `🔍 *Filter Tugas Berdasarkan Status*\n\nPilih status yang ingin ditampilkan:`;

            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.statusFilter().reply_markup
            });
        } catch (error) {
            console.error('Error showing status filter:', error);
            await ctx.reply('❌ Gagal menampilkan filter status.');
        }
    }

    static async filterTasksByStatus(ctx, status) {
        try {
            const userId = ctx.user.telegramId;
            const filteredTasks = db.getUserTasksByStatus(userId, status);
            
            const message = Helpers.formatStatusFilter(status, filteredTasks);

            if (filteredTasks.length > 0) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.taskList(filteredTasks, 0).reply_markup
                });
            } else {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Keyboards.statusFilter().reply_markup
                });
            }
        } catch (error) {
            console.error('Error filtering tasks by status:', error);
            await ctx.reply('❌ Gagal memfilter tugas.');
        }
    }

    static async viewTask(ctx, taskId) {
        try {
            const userId = ctx.user.telegramId;
            const task = db.getTaskById(taskId, userId);

            if (!task) {
                await ctx.answerCbQuery('❌ Tugas tidak ditemukan.');
                return;
            }

            const message = Helpers.formatTaskMessage(task);

            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.taskActions(taskId).reply_markup,
                disable_web_page_preview: true
            });
        } catch (error) {
            console.error('Error viewing task:', error);
            await ctx.answerCbQuery('❌ Gagal menampilkan detail tugas.');
        }
    }

    static async startAddTask(ctx) {
        try {
            const userId = ctx.user.telegramId;
            
            // Initialize session
            userSessions.set(userId, {
                action: 'add_task',
                step: 'projectName',
                data: {}
            });

            const message = `📝 *Tambah Tugas Airdrop Baru*\n\n` +
                          `Mari kita mulai dengan informasi dasar project.\n\n` +
                          `*Langkah 1/3: Nama Project*\n` +
                          `Masukkan nama project airdrop:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown'
                });
            } else {
                await ctx.replyWithMarkdown(message);
            }
        } catch (error) {
            console.error('Error starting add task:', error);
            await ctx.reply('❌ Gagal memulai penambahan tugas.');
        }
    }

    static async handleTextInput(ctx) {
        try {
            const userId = ctx.from.id;
            const session = userSessions.get(userId);

            if (!session) {
                return; // No active session
            }

            const text = ctx.message.text.trim();

            switch (session.action) {
                case 'add_task':
                    await TaskHandler.handleAddTaskInput(ctx, session, text);
                    break;
                case 'edit_task':
                    await TaskHandler.handleEditTaskInput(ctx, session, text);
                    break;
                case 'search_tasks':
                    await TaskHandler.handleSearchInput(ctx, text);
                    break;
            }
        } catch (error) {
            console.error('Error handling text input:', error);
            await ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    static async handleAddTaskInput(ctx, session, text) {
        try {
            switch (session.step) {
                case 'projectName':
                    if (text.length < 2) {
                        return ctx.reply('❌ Nama project minimal 2 karakter. Silakan coba lagi:');
                    }
                    session.data.projectName = text;
                    session.step = 'projectUrl';
                    await ctx.reply(
                        `✅ Nama project: *${text}*\n\n` +
                        `*Langkah 2/3: URL Project*\n` +
                        `Masukkan link/URL project (harus dimulai dengan http/https):`,
                        { parse_mode: 'Markdown' }
                    );
                    break;

                case 'projectUrl':
                    if (!Helpers.validateUrl(text)) {
                        return ctx.reply('❌ URL tidak valid. Pastikan dimulai dengan http:// atau https://. Silakan coba lagi:');
                    }
                    session.data.projectUrl = text;
                    session.step = 'optional';
                    await TaskHandler.askOptionalData(ctx);
                    break;

                case 'optional':
                    await TaskHandler.handleOptionalInput(ctx, session, text);
                    break;
            }
        } catch (error) {
            console.error('Error in handleAddTaskInput:', error);
            await ctx.reply('❌ Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    static async askOptionalData(ctx) {
        const message = `✅ URL project tersimpan!\n\n` +
                      `*Langkah 3/3: Informasi Tambahan (Opsional)*\n\n` +
                      `Kirim informasi tambahan dalam format berikut, atau ketik "selesai" untuk menyimpan:\n\n` +
                      `*Format:*\n` +
                      `Wallet: [alamat wallet]\n` +
                      `Email: [email]\n` +
                      `Telegram: [handle telegram]\n` +
                      `Discord: [handle discord]\n` +
                      `Twitter: [handle twitter]\n` +
                      `Timeline: [DD/MM/YYYY]\n` +
                      `Status: [active/completed/waiting_claim/claimed]\n` +
                      `Catatan: [catatan tambahan]\n\n` +
                      `*Contoh:*\n` +
                      `Wallet: 0x123...abc\n` +
                      `Email: user@email.com\n` +
                      `Telegram: @username\n` +
                      `Timeline: 31/12/2024\n` +
                      `Status: active\n` +
                      `Catatan: Follow Twitter dan join Discord`;

        await ctx.replyWithMarkdown(message);
    }

    static async handleOptionalInput(ctx, session, text) {
        if (text.toLowerCase() === 'selesai') {
            await TaskHandler.saveTask(ctx, session);
            return;
        }

        // Parse optional data
        const lines = text.split('\n');
        for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                const normalizedKey = key.toLowerCase().trim();

                switch (normalizedKey) {
                    case 'wallet':
                        session.data.walletAddress = value;
                        break;
                    case 'email':
                        session.data.email = value;
                        break;
                    case 'telegram':
                        session.data.telegramHandle = value;
                        break;
                    case 'discord':
                        session.data.discordHandle = value;
                        break;
                    case 'twitter':
                        session.data.twitterHandle = value;
                        break;
                    case 'timeline':
                        if (Helpers.validateDate(value)) {
                            session.data.timeline = Helpers.parseDate(value);
                        }
                        break;
                    case 'status':
                        const validStatuses = ['active', 'completed', 'waiting_claim', 'claimed'];
                        if (validStatuses.includes(value.toLowerCase())) {
                            session.data.status = value.toLowerCase();
                        }
                        break;
                    case 'catatan':
                    case 'notes':
                        session.data.notes = value;
                        break;
                }
            }
        }

        await TaskHandler.saveTask(ctx, session);
    }

    static async saveTask(ctx, session) {
        try {
            const userId = ctx.user.telegramId;
            
            const taskData = {
                userId: userId,
                projectName: session.data.projectName,
                projectUrl: session.data.projectUrl,
                walletAddress: session.data.walletAddress || '',
                email: session.data.email || '',
                telegramHandle: session.data.telegramHandle || '',
                discordHandle: session.data.discordHandle || '',
                twitterHandle: session.data.twitterHandle || '',
                timeline: session.data.timeline || '',
                notes: session.data.notes || '',
                status: session.data.status || 'active'
            };

            const newTask = db.createTask(taskData);
            userSessions.delete(userId);

            const statusInfo = Helpers.getStatusInfo(newTask.status);
            const message = `✅ *Tugas airdrop berhasil ditambahkan!*\n\n` +
                          `📋 *${newTask.projectName}*\n` +
                          `🔗 [Link Project](${newTask.projectUrl})\n` +
                          `📊 Status: ${statusInfo.icon} ${statusInfo.text}`;

            await ctx.replyWithMarkdown(message, Keyboards.mainMenu(), { disable_web_page_preview: true });

        } catch (error) {
            console.error('Error saving task:', error);
            await ctx.reply('❌ Gagal menyimpan tugas. Silakan coba lagi.');
        }
    }

    static async handleEditTaskInput(ctx, session, text) {
        // Implementation for edit task - placeholder
        await ctx.reply('❌ Fitur edit belum tersedia. Gunakan /menu untuk kembali ke menu utama.');
    }

    static async changeTaskStatus(ctx, taskId) {
        try {
            const message = `🔄 *Ubah Status Tugas*\n\nPilih status baru untuk tugas ini:`;

            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.statusSelection(taskId).reply_markup
            });
        } catch (error) {
            console.error('Error showing status change menu:', error);
            await ctx.answerCbQuery('❌ Gagal menampilkan menu ubah status.');
        }
    }

    static async setTaskStatus(ctx, taskId, newStatus) {
        try {
            const userId = ctx.user.telegramId;
            const task = db.getTaskById(taskId, userId);

            if (!task) {
                await ctx.answerCbQuery('❌ Tugas tidak ditemukan.');
                return;
            }

            const updatedTask = db.updateTask(taskId, userId, { status: newStatus });

            if (updatedTask) {
                const statusInfo = Helpers.getStatusInfo(newStatus);
                await ctx.answerCbQuery(`✅ Status diubah menjadi: ${statusInfo.text}`);
                await TaskHandler.viewTask(ctx, taskId);
            } else {
                await ctx.answerCbQuery('❌ Gagal mengubah status.');
            }
        } catch (error) {
            console.error('Error setting task status:', error);
            await ctx.answerCbQuery('❌ Gagal mengubah status tugas.');
        }
    }

    static async toggleTaskStatus(ctx, taskId) {
        try {
            const userId = ctx.user.telegramId;
            const task = db.getTaskById(taskId, userId);

            if (!task) {
                await ctx.answerCbQuery('❌ Tugas tidak ditemukan.');
                return;
            }

            // Show quick status actions based on current status
            const message = `🔄 *Status Saat Ini: ${Helpers.getStatusInfo(task.status).icon} ${Helpers.getStatusInfo(task.status).text}*\n\n` +
                          `Pilih aksi cepat atau ubah ke status lain:`;

            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.statusQuickActions(taskId, task.status).reply_markup
            });
        } catch (error) {
            console.error('Error toggling task status:', error);
            await ctx.answerCbQuery('❌ Gagal mengubah status tugas.');
        }
    }

    static async deleteTask(ctx, taskId) {
        try {
            const message = `🗑️ *Konfirmasi Penghapusan*\n\n` +
                          `Apakah Anda yakin ingin menghapus tugas ini?\n` +
                          `Tindakan ini tidak dapat dibatalkan.`;

            await ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                reply_markup: Keyboards.confirmDelete(taskId).reply_markup
            });
        } catch (error) {
            console.error('Error showing delete confirmation:', error);
            await ctx.answerCbQuery('❌ Gagal menampilkan konfirmasi hapus.');
        }
    }

    static async confirmDelete(ctx, taskId) {
        try {
            const userId = ctx.user.telegramId;
            const success = db.deleteTask(taskId, userId);

            if (success) {
                await ctx.answerCbQuery('✅ Tugas berhasil dihapus!');
                await TaskHandler.listTasks(ctx);
            } else {
                await ctx.answerCbQuery('❌ Gagal menghapus tugas.');
            }
        } catch (error) {
            console.error('Error confirming delete:', error);
            await ctx.answerCbQuery('❌ Gagal menghapus tugas.');
        }
    }

    static async startSearch(ctx) {
        try {
            const userId = ctx.user.telegramId;
            
            userSessions.set(userId, {
                action: 'search_tasks'
            });

            const message = `🔍 *Cari Tugas Airdrop*\n\n` +
                          `Masukkan nama project yang ingin dicari:`;

            if (ctx.callbackQuery) {
                await ctx.editMessageText(message, {
                    parse_mode: 'Markdown'
                });
            } else {
                await ctx.replyWithMarkdown(message);
            }
        } catch (error) {
            console.error('Error starting search:', error);
            await ctx.reply('❌ Gagal memulai pencarian.');
        }
    }

    static async handleSearchInput(ctx, searchQuery) {
        try {
            const userId = ctx.user.telegramId;
            const allTasks = db.getUserTasks(userId);
            
            const filteredTasks = allTasks.filter(task => 
                task.projectName.toLowerCase().includes(searchQuery.toLowerCase())
            );

            userSessions.delete(userId);

            if (filteredTasks.length === 0) {
                const message = `🔍 *Hasil Pencarian*\n\n` +
                              `Tidak ditemukan tugas dengan kata kunci: "*${searchQuery}*"`;
                              
                await ctx.replyWithMarkdown(message, Keyboards.backToMenu());
                return;
            }

            const message = `🔍 *Hasil Pencarian: "${searchQuery}"*\n\n` +
                          `Ditemukan ${filteredTasks.length} tugas:`;

            await ctx.replyWithMarkdown(message, Keyboards.taskList(filteredTasks));

        } catch (error) {
            console.error('Error handling search:', error);
            await ctx.reply('❌ Gagal melakukan pencarian.');
        }
    }

    // Command handlers
    static async handleListCommand(ctx) {
        try {
            const userId = ctx.from.id;
            const user = db.getUserById(userId);
            
            if (!user) {
                return ctx.reply('❌ Silakan mulai dengan /start terlebih dahulu.');
            }

            ctx.user = user;
            await TaskHandler.listTasks(ctx);
        } catch (error) {
            console.error('Error in list command:', error);
            await ctx.reply('❌ Gagal menampilkan daftar tugas.');
        }
    }

    static async handleAddCommand(ctx) {
        try {
            const userId = ctx.from.id;
            const user = db.getUserById(userId);
            
            if (!user) {
                return ctx.reply('❌ Silakan mulai dengan /start terlebih dahulu.');
            }

            ctx.user = user;
            await TaskHandler.startAddTask(ctx);
        } catch (error) {
            console.error('Error in add command:', error);
            await ctx.reply('❌ Gagal memulai penambahan tugas.');
        }
    }

    // New command for checking tasks ready to claim
    static async handleClaimCommand(ctx) {
        try {
            const userId = ctx.from.id;
            const user = db.getUserById(userId);
            
            if (!user) {
                return ctx.reply('❌ Silakan mulai dengan /start terlebih dahulu.');
            }

            ctx.user = user;
            const readyToClaim = db.getTasksReadyToClaim(userId);
            
            if (readyToClaim.length === 0) {
                const message = `⏳ *Tidak ada tugas yang siap di claim*\n\n` +
                              `Selesaikan tugas aktif terlebih dahulu untuk mulai claiming!`;
                await ctx.replyWithMarkdown(message, Keyboards.backToMenu());
                return;
            }

            const message = `⏳ *Tugas Siap di Claim (${readyToClaim.length})*\n\n` +
                          `Jangan lupa claim reward dari project berikut:`;

            await ctx.replyWithMarkdown(message, Keyboards.taskList(readyToClaim));
        } catch (error) {
            console.error('Error in claim command:', error);
            await ctx.reply('❌ Gagal menampilkan tugas siap claim.');
        }
    }
}

module.exports = TaskHandler;
