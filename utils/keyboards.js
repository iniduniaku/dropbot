const { Markup } = require('telegraf');

class Keyboards {
    static mainMenu() {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('📝 Tambah Tugas', 'add_task'),
                Markup.button.callback('📋 Lihat Tugas', 'list_tasks')
            ],
            [
                Markup.button.callback('📊 Statistik', 'show_stats'),
                Markup.button.callback('🔍 Cari Tugas', 'search_tasks')
            ],
            [
                Markup.button.callback('💝 Donasi', 'show_donation'),
                Markup.button.callback('🆘 Bantuan', 'show_help')
            ]
        ]);
    }

    static taskActions(taskId) {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('✏️ Edit', `edit_task:${taskId}`),
                Markup.button.callback('🗑️ Hapus', `delete_task:${taskId}`)
            ],
            [
                Markup.button.callback('🔄 Ubah Status', `toggle_status:${taskId}`)
            ],
            [
                Markup.button.callback('🔙 Kembali', 'list_tasks')
            ]
        ]);
    }

    static taskList(tasks, page = 0) {
        const itemsPerPage = 5;
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, tasks.length);
        const buttons = [];

        for (let i = startIndex; i < endIndex; i++) {
            const task = tasks[i];
            const statusIcons = {
                'active': '🟢',
                'completed': '✅',
                'waiting_claim': '⏳',
                'claimed': '💰'
            };
            const status = statusIcons[task.status] || '🟢';
            
            buttons.push([
                Markup.button.callback(
                    `${status} ${task.projectName}`,
                    `view_task:${task.id}`
                )
            ]);
        }

        // Pagination buttons
        const paginationButtons = [];
        if (page > 0) {
            paginationButtons.push(Markup.button.callback('⬅️ Prev', `tasks_page:${page - 1}`));
        }
        if (endIndex < tasks.length) {
            paginationButtons.push(Markup.button.callback('➡️ Next', `tasks_page:${page + 1}`));
        }
        
        if (paginationButtons.length > 0) {
            buttons.push(paginationButtons);
        }

        buttons.push([Markup.button.callback('🔙 Menu Utama', 'main_menu')]);

        return Markup.inlineKeyboard(buttons);
    }

    static statusSelection(taskId) {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('🟢 Aktif', `set_status:${taskId}:active`),
                Markup.button.callback('✅ Selesai', `set_status:${taskId}:completed`)
            ],
            [
                Markup.button.callback('⏳ Menunggu Claim', `set_status:${taskId}:waiting_claim`),
                Markup.button.callback('💰 Telah di Claim', `set_status:${taskId}:claimed`)
            ],
            [
                Markup.button.callback('🔙 Kembali', `view_task:${taskId}`)
            ]
        ]);
    }

    static statusQuickActions(taskId, currentStatus) {
        const buttons = [];
        
        // Dynamic buttons based on current status
        if (currentStatus === 'active') {
            buttons.push([
                Markup.button.callback('✅ Tandai Selesai', `set_status:${taskId}:completed`)
            ]);
        } else if (currentStatus === 'completed') {
            buttons.push([
                Markup.button.callback('⏳ Siap Claim', `set_status:${taskId}:waiting_claim`)
            ]);
        } else if (currentStatus === 'waiting_claim') {
            buttons.push([
                Markup.button.callback('💰 Sudah Claim', `set_status:${taskId}:claimed`)
            ]);
        }
        
        buttons.push([
            Markup.button.callback('🔄 Pilih Status Lain', `change_status:${taskId}`),
            Markup.button.callback('🔙 Kembali', `view_task:${taskId}`)
        ]);

        return Markup.inlineKeyboard(buttons);
    }

    static confirmDelete(taskId) {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Ya, Hapus', `confirm_delete:${taskId}`),
                Markup.button.callback('❌ Batal', `view_task:${taskId}`)
            ]
        ]);
    }

    static editTaskMenu(taskId) {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('📝 Nama Project', `edit_field:${taskId}:projectName`),
                Markup.button.callback('🔗 URL Project', `edit_field:${taskId}:projectUrl`)
            ],
            [
                Markup.button.callback('💰 Wallet Address', `edit_field:${taskId}:walletAddress`),
                Markup.button.callback('📧 Email', `edit_field:${taskId}:email`)
            ],
            [
                Markup.button.callback('📱 Telegram', `edit_field:${taskId}:telegramHandle`),
                Markup.button.callback('🎮 Discord', `edit_field:${taskId}:discordHandle`)
            ],
            [
                Markup.button.callback('🐦 Twitter', `edit_field:${taskId}:twitterHandle`),
                Markup.button.callback('📅 Timeline', `edit_field:${taskId}:timeline`)
            ],
            [
                Markup.button.callback('📝 Catatan', `edit_field:${taskId}:notes`),
                Markup.button.callback('📊 Status', `change_status:${taskId}`)
            ],
            [
                Markup.button.callback('🔙 Kembali', `view_task:${taskId}`)
            ]
        ]);
    }

    static backToMenu() {
        return Markup.inlineKeyboard([
            [Markup.button.callback('🔙 Menu Utama', 'main_menu')]
        ]);
    }

    // Simplified donation keyboard with only Trakteer and EVM wallet
    static donation() {
        return Markup.inlineKeyboard([
            [
                Markup.button.url('🎁 Trakteer', require('../config/config').DONATION.TRAKTEER)
            ],
            [
                Markup.button.callback('💰 EVM Wallet', 'show_wallet')
            ],
            [
                Markup.button.callback('📞 Contact', 'contact_dev'),
                Markup.button.callback('📢 Channel', 'show_channel')
            ],
            [
                Markup.button.callback('🔙 Menu Utama', 'main_menu')
            ]
        ]);
    }

    // Wallet display keyboard
    static walletKeyboard() {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('📋 Copy Address', 'copy_wallet')
            ],
            [
                Markup.button.callback('🔙 Kembali Donasi', 'show_donation'),
                Markup.button.callback('🏠 Menu Utama', 'main_menu')
            ]
        ]);
    }

    // Developer info keyboard
    static developerInfo() {
        return Markup.inlineKeyboard([
            [
                Markup.button.url('📱 Telegram', `https://t.me/${require('../config/config').DEVELOPER.TELEGRAM.replace('@', '')}`),
                Markup.button.url('📢 Channel', 'https://t.me/CatatanAirdrop')
            ],
            [
                Markup.button.url('💻 GitHub', require('../config/config').DEVELOPER.GITHUB)
            ],
            [
                Markup.button.callback('💝 Donasi', 'show_donation'),
                Markup.button.callback('🔙 Menu Utama', 'main_menu')
            ]
        ]);
    }

    // Filter tasks by status
    static statusFilter() {
        return Markup.inlineKeyboard([
            [
                Markup.button.callback('🟢 Aktif', 'filter_status:active'),
                Markup.button.callback('✅ Selesai', 'filter_status:completed')
            ],
            [
                Markup.button.callback('⏳ Menunggu Claim', 'filter_status:waiting_claim'),
                Markup.button.callback('💰 Sudah Claim', 'filter_status:claimed')
            ],
            [
                Markup.button.callback('📋 Semua Tugas', 'list_tasks'),
                Markup.button.callback('🔙 Menu Utama', 'main_menu')
            ]
        ]);
    }
}

module.exports = Keyboards;
