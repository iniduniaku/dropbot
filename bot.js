const { Telegraf } = require('telegraf');
const config = require('./config/config');

// Handlers
const AuthHandler = require('./handlers/auth');
const MenuHandler = require('./handlers/menu');
const TaskHandler = require('./handlers/tasks');
const StatsHandler = require('./handlers/stats');

// Initialize bot
const bot = new Telegraf(config.BOT_TOKEN);

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ Terjadi kesalahan sistem. Silakan coba lagi.');
});

// Middleware
bot.use(async (ctx, next) => {
    // Log all updates
    console.log(`Update from ${ctx.from?.first_name} (${ctx.from?.id}):`, 
                ctx.message?.text || ctx.callbackQuery?.data || 'Other update');
    return next();
});

// Commands
bot.command('start', AuthHandler.handleStart);
bot.command('menu', AuthHandler.ensureUser, MenuHandler.showMainMenu);
bot.command('help', MenuHandler.showHelp);
bot.command('donate', MenuHandler.showDonation);
bot.command('list', TaskHandler.handleListCommand);
bot.command('add', TaskHandler.handleAddCommand);
bot.command('stats', StatsHandler.handleStatsCommand);
bot.command('claim', TaskHandler.handleClaimCommand); // New command

// Callback query handlers
bot.action('main_menu', AuthHandler.ensureUser, MenuHandler.showMainMenu);
bot.action('show_help', AuthHandler.ensureUser, MenuHandler.showHelp);
bot.action('show_donation', AuthHandler.ensureUser, MenuHandler.showDonation);
bot.action('show_stats', AuthHandler.ensureUser, StatsHandler.showStats);

// Task actions
bot.action('add_task', AuthHandler.ensureUser, TaskHandler.startAddTask);
bot.action('list_tasks', AuthHandler.ensureUser, (ctx) => TaskHandler.listTasks(ctx));
bot.action('search_tasks', AuthHandler.ensureUser, TaskHandler.startSearch);

// New: Status filter actions
bot.action('show_status_filter', AuthHandler.ensureUser, TaskHandler.showStatusFilter);
bot.action(/filter_status:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const status = ctx.match[1];
    return TaskHandler.filterTasksByStatus(ctx, status);
});

// Task pagination
bot.action(/tasks_page:(\d+)/, AuthHandler.ensureUser, (ctx) => {
    const page = parseInt(ctx.match[1]);
    return TaskHandler.listTasks(ctx, page);
});

// View specific task
bot.action(/view_task:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    return TaskHandler.viewTask(ctx, taskId);
});

// Task management actions
bot.action(/delete_task:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    return TaskHandler.deleteTask(ctx, taskId);
});

bot.action(/confirm_delete:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    return TaskHandler.confirmDelete(ctx, taskId);
});

// Status management actions
bot.action(/toggle_status:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    return TaskHandler.toggleTaskStatus(ctx, taskId);
});

bot.action(/change_status:(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    return TaskHandler.changeTaskStatus(ctx, taskId);
});

bot.action(/set_status:(.+):(.+)/, AuthHandler.ensureUser, (ctx) => {
    const taskId = ctx.match[1];
    const status = ctx.match[2];
    return TaskHandler.setTaskStatus(ctx, taskId, status);
});

// Donation copy actions
bot.action('copy_btc', (ctx) => MenuHandler.handleDonationCopy(ctx, 'btc'));
bot.action('copy_eth', (ctx) => MenuHandler.handleDonationCopy(ctx, 'eth'));
bot.action('copy_bnb', (ctx) => MenuHandler.handleDonationCopy(ctx, 'bnb'));

// Text message handler
bot.on('text', TaskHandler.handleTextInput);

// Handle callback queries that don't match any pattern
bot.on('callback_query', async (ctx) => {
    console.log('Unhandled callback query:', ctx.callbackQuery.data);
    await ctx.answerCbQuery('❌ Aksi tidak dikenali.');
});

// Launch bot
async function startBot() {
    try {
        await bot.launch();
        console.log('🚀 Airdrop Tracker Bot started successfully!');
        console.log('Bot username:', bot.botInfo?.username);
        
        // Graceful shutdown
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
        
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();
