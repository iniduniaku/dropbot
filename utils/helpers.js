const moment = require('moment');

class Helpers {
    static getStatusInfo(status) {
        const statusMap = {
            'active': {
                icon: '🟢',
                text: 'Aktif',
                description: 'Sedang dikerjakan'
            },
            'completed': {
                icon: '✅',
                text: 'Selesai',
                description: 'Tugas telah diselesaikan'
            },
            'waiting_claim': {
                icon: '⏳',
                text: 'Menunggu Claim',
                description: 'Siap untuk di claim'
            },
            'claimed': {
                icon: '💰',
                text: 'Telah di Claim',
                description: 'Reward sudah diterima'
            }
        };
        
        return statusMap[status] || statusMap['active'];
    }

    static formatTaskMessage(task) {
        const statusInfo = this.getStatusInfo(task.status);
        const timeline = task.timeline ? moment(task.timeline).format('DD/MM/YYYY') : 'Tidak diset';
        
        let message = `*📋 ${task.projectName}*\n\n`;
        message += `*Status:* ${statusInfo.icon} ${statusInfo.text}\n`;
        message += `*URL:* [Link Project](${task.projectUrl})\n`;
        
        if (task.walletAddress) {
            message += `*Wallet:* \`${task.walletAddress}\`\n`;
        }
        
        if (task.email) {
            message += `*Email:* ${task.email}\n`;
        }
        
        if (task.telegramHandle) {
            message += `*Telegram:* ${task.telegramHandle}\n`;
        }
        
        if (task.discordHandle) {
            message += `*Discord:* ${task.discordHandle}\n`;
        }
        
        if (task.twitterHandle) {
            message += `*Twitter:* ${task.twitterHandle}\n`;
        }
        
        message += `*Timeline:* ${timeline}\n`;
        
        if (task.notes) {
            message += `*Catatan:* ${task.notes}\n`;
        }

        // Add claim information for relevant statuses
        if (task.status === 'waiting_claim') {
            message += `\n⏳ *Info:* Tugas selesai, siap untuk di claim`;
        } else if (task.status === 'claimed') {
            message += `\n💰 *Info:* Reward telah berhasil di claim`;
        }
        
        message += `\n*Dibuat:* ${moment(task.createdAt).format('DD/MM/YYYY HH:mm')}`;
        
        if (task.updatedAt !== task.createdAt) {
            message += `\n*Diupdate:* ${moment(task.updatedAt).format('DD/MM/YYYY HH:mm')}`;
        }
        
        return message;
    }

    static formatTasksList(tasks) {
        if (tasks.length === 0) {
            return '📝 *Belum ada tugas airdrop*\n\nKlik "Tambah Tugas" untuk menambahkan project airdrop pertama Anda!';
        }

        let message = `📋 *Daftar Tugas Airdrop (${tasks.length})*\n\n`;
        
        tasks.forEach((task, index) => {
            const statusInfo = this.getStatusInfo(task.status);
            const timeline = task.timeline ? moment(task.timeline).format('DD/MM') : 'No deadline';
            message += `${index + 1}. ${statusInfo.icon} *${task.projectName}*\n`;
            message += `   📅 ${timeline} • ${statusInfo.text}\n\n`;
        });

        return message;
    }

    static formatStats(stats) {
        const totalTasks = stats.total;
        const progressPercentage = totalTasks > 0 ? 
            Math.round(((stats.completed + stats.claimed) / totalTasks) * 100) : 0;

        return `📊 *Statistik Tugas Airdrop*\n\n` +
               `📝 *Total Tugas:* ${stats.total}\n` +
               `🟢 *Aktif:* ${stats.active}\n` +
               `✅ *Selesai:* ${stats.completed}\n` +
               `⏳ *Menunggu Claim:* ${stats.waiting_claim}\n` +
               `💰 *Telah di Claim:* ${stats.claimed}\n\n` +
               `📈 *Progress:* ${progressPercentage}% selesai\n` +
               `💎 *Potensi Reward:* ${stats.waiting_claim + stats.claimed} project\n\n` +
               `💡 *Tips:* Pantau status "Menunggu Claim" untuk tidak melewatkan reward!`;
    }

    static formatStatusFilter(status, tasks) {
        const statusInfo = this.getStatusInfo(status);
        const count = tasks.length;
        
        let message = `${statusInfo.icon} *Tugas ${statusInfo.text}*\n\n`;
        
        if (count === 0) {
            message += `Belum ada tugas dengan status "${statusInfo.text}".`;
            return message;
        }
        
        message += `Ditemukan ${count} tugas:\n\n`;
        
        tasks.forEach((task, index) => {
            const timeline = task.timeline ? moment(task.timeline).format('DD/MM') : 'No deadline';
            message += `${index + 1}. *${task.projectName}*\n`;
            message += `   📅 ${timeline}\n\n`;
        });

        return message;
    }

    static validateUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    static validateDate(dateString) {
        const date = moment(dateString, 'DD/MM/YYYY', true);
        return date.isValid();
    }

    static parseDate(dateString) {
        return moment(dateString, 'DD/MM/YYYY').toISOString();
    }

    static escapeMarkdown(text) {
        return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    }

    static truncateText(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    static getNextStatusSuggestion(currentStatus) {
        const statusFlow = {
            'active': 'completed',
            'completed': 'waiting_claim',
            'waiting_claim': 'claimed',
            'claimed': 'claimed' // Already final status
        };
        
        return statusFlow[currentStatus] || 'active';
    }

    static getStatusProgress(status) {
        const progressMap = {
            'active': 25,
            'completed': 50,
            'waiting_claim': 75,
            'claimed': 100
        };
        
        return progressMap[status] || 0;
    }
}

module.exports = Helpers;
