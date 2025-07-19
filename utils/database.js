const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.usersFile = path.join(__dirname, '../data/users.json');
        this.tasksFile = path.join(__dirname, '../data/tasks.json');
        this.initializeFiles();
    }

    initializeFiles() {
        const dataDir = path.dirname(this.usersFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        if (!fs.existsSync(this.usersFile)) {
            fs.writeFileSync(this.usersFile, '[]');
        }

        if (!fs.existsSync(this.tasksFile)) {
            fs.writeFileSync(this.tasksFile, '[]');
        }
    }

    // User methods
    getUsers() {
        try {
            const data = fs.readFileSync(this.usersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    saveUsers(users) {
        fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2));
    }

    getUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.telegramId === userId);
    }

    createUser(userData) {
        const users = this.getUsers();
        const existingUser = users.find(user => user.telegramId === userData.telegramId);
        
        if (existingUser) {
            return existingUser;
        }

        const newUser = {
            id: require('uuid').v4(),
            telegramId: userData.telegramId,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    // Task methods
    getTasks() {
        try {
            const data = fs.readFileSync(this.tasksFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    saveTasks(tasks) {
        fs.writeFileSync(this.tasksFile, JSON.stringify(tasks, null, 2));
    }

    getUserTasks(userId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.userId === userId);
    }

    getUserTasksByStatus(userId, status) {
        const tasks = this.getUserTasks(userId);
        return tasks.filter(task => task.status === status);
    }

    getTaskById(taskId, userId) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === taskId && task.userId === userId);
    }

    createTask(taskData) {
        const tasks = this.getTasks();
        const newTask = {
            id: require('uuid').v4(),
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        tasks.push(newTask);
        this.saveTasks(tasks);
        return newTask;
    }

    updateTask(taskId, userId, updateData) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === userId);
        
        if (taskIndex === -1) {
            return null;
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks(tasks);
        return tasks[taskIndex];
    }

    deleteTask(taskId, userId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => !(task.id === taskId && task.userId === userId));
        
        if (filteredTasks.length === tasks.length) {
            return false;
        }

        this.saveTasks(filteredTasks);
        return true;
    }

    getTaskStats(userId) {
        const userTasks = this.getUserTasks(userId);
        return {
            total: userTasks.length,
            active: userTasks.filter(task => task.status === 'active').length,
            completed: userTasks.filter(task => task.status === 'completed').length,
            waiting_claim: userTasks.filter(task => task.status === 'waiting_claim').length,
            claimed: userTasks.filter(task => task.status === 'claimed').length
        };
    }

    // New methods for enhanced functionality
    getTasksReadyToClaim(userId) {
        return this.getUserTasksByStatus(userId, 'waiting_claim');
    }

    getClaimedTasks(userId) {
        return this.getUserTasksByStatus(userId, 'claimed');
    }

    getActiveTasks(userId) {
        return this.getUserTasksByStatus(userId, 'active');
    }

    getCompletedTasks(userId) {
        return this.getUserTasksByStatus(userId, 'completed');
    }

    // Bulk status update
    bulkUpdateStatus(userId, fromStatus, toStatus) {
        const tasks = this.getTasks();
        let updatedCount = 0;

        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].userId === userId && tasks[i].status === fromStatus) {
                tasks[i].status = toStatus;
                tasks[i].updatedAt = new Date().toISOString();
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            this.saveTasks(tasks);
        }

        return updatedCount;
    }

    // Get tasks by timeline (overdue, due soon, etc.)
    getTasksByTimeline(userId, days = 7) {
        const userTasks = this.getUserTasks(userId);
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + days);

        return userTasks.filter(task => {
            if (!task.timeline) return false;
            const taskDate = new Date(task.timeline);
            return taskDate >= now && taskDate <= targetDate && 
                   (task.status === 'active' || task.status === 'completed');
        });
    }

    getOverdueTasks(userId) {
        const userTasks = this.getUserTasks(userId);
        const now = new Date();

        return userTasks.filter(task => {
            if (!task.timeline) return false;
            const taskDate = new Date(task.timeline);
            return taskDate < now && task.status === 'active';
        });
    }
}

module.exports = new Database();
