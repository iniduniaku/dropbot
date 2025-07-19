require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    ADMIN_ID: process.env.ADMIN_ID || '123456789',
    
    // Donation options
    DONATION: {
        TRAKTEER: 'https://trakteer.id/catatanairdrop/tip',
        EVM_WALLET: '0xEe44d7Ead8019d9115eC557823498b53Ff0Fd011'
    },

    // Developer info
    DEVELOPER: {
        NAME: 'Catatan Airdrop',
        TELEGRAM: '@catatanairdrop_bot'
    },

    // Messages
    MESSAGES: {
        WELCOME: `🚀 *Selamat datang di Catatan Airdrop!*

Bot ini membantu Anda mengelola dan melacak semua tugas airdrop cryptocurrency dalam satu tempat.

*Fitur utama:*
• 📝 Tambah tugas airdrop baru
• 📊 Lihat statistik tugas
• ✏️ Edit informasi tugas
• 🗑️ Hapus tugas yang sudah tidak diperlukan
• 🔍 Cari tugas berdasarkan nama project
• ⏳ Track status claim reward

*Status Tugas:*
🟢 Aktif - Sedang dikerjakan
✅ Selesai - Tugas telah diselesaikan
⏳ Menunggu Claim - Siap untuk di claim
💰 Telah di Claim - Reward sudah diterima

Gunakan /menu untuk melihat semua opsi yang tersedia.`,

        HELP: `🆘 *Bantuan Penggunaan Bot*

*Perintah Utama:*
/start - Memulai bot dan registrasi
/menu - Tampilkan menu utama
/add - Tambah tugas airdrop baru
/list - Lihat semua tugas
/stats - Lihat statistik tugas
/claim - Lihat tugas siap di claim
/help - Tampilkan bantuan ini
/donate - Info donasi pengembangan

*Status Tugas:*
🟢 *Aktif* - Tugas sedang dikerjakan
✅ *Selesai* - Tugas telah diselesaikan, belum bisa claim
⏳ *Menunggu Claim* - Siap untuk di claim
💰 *Telah di Claim* - Reward sudah berhasil diterima

*Cara Penggunaan:*
1. Mulai dengan /start untuk registrasi
2. Gunakan /add untuk menambah tugas airdrop
3. Gunakan /list untuk melihat semua tugas
4. Update status saat progress berubah
5. Gunakan /claim untuk cek tugas siap claim

*Tips:*
• Update status secara berkala
• Gunakan filter untuk melihat tugas berdasarkan status
• Pantau /claim untuk tidak melewatkan reward
• Set timeline untuk reminder

*Developer:* ${module.exports.DEVELOPER.TELEGRAM}
*Channel:* @CatatanAirdrop

Butuh bantuan lebih lanjut? Hubungi developer melalui link di atas.`
    }
};
