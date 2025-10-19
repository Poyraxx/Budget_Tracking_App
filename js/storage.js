
class StorageManager {
    constructor() {
        this.storageKey = 'budgetbuddy_data';
        this.defaultData = {
            transactions: [],
            budgets: [],
            categories: {
                income: [],
                expense: []
            },
            settings: {
                currency: 'USD',
                theme: 'light',
                dateFormat: 'MM/DD/YYYY',
                notifications: true
            }
        };
        this.data = this.loadData();
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (this.hasDefaultCategories(parsed)) {
                    parsed.categories = {
                        income: parsed.categories.income.filter(cat => !this.isDefaultCategory(cat, 'income')),
                        expense: parsed.categories.expense.filter(cat => !this.isDefaultCategory(cat, 'expense'))
                    };
                    this.saveData(parsed);
                }
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        return { ...this.defaultData };
    }

    /**
     * Save data to localStorage
     */
    saveData(data = null) {
        try {
            const dataToSave = data || this.data;
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    /**
     * Check if data has default categories
     */
    hasDefaultCategories(data) {
        if (!data.categories) return false;
        
        const defaultIncomeNames = ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
        const defaultExpenseNames = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'];
        
        const hasDefaultIncome = data.categories.income && data.categories.income.some(cat => 
            defaultIncomeNames.includes(cat.name)
        );
        const hasDefaultExpense = data.categories.expense && data.categories.expense.some(cat => 
            defaultExpenseNames.includes(cat.name)
        );
        
        return hasDefaultIncome || hasDefaultExpense;
    }

    /**
     * Check if a category is a default category
     */
    isDefaultCategory(category, type) {
        const defaultIncomeNames = ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
        const defaultExpenseNames = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other'];
        
        if (type === 'income') {
            return defaultIncomeNames.includes(category.name);
        } else if (type === 'expense') {
            return defaultExpenseNames.includes(category.name);
        }
        return false;
    }

    /**
     * Merge stored data with defaults to ensure all properties exist
     */
    mergeWithDefaults(stored) {
        const merged = { ...this.defaultData };
        
        
        if (stored.transactions && Array.isArray(stored.transactions)) {
            merged.transactions = stored.transactions;
        }
        
        
        if (stored.budgets && Array.isArray(stored.budgets)) {
            merged.budgets = stored.budgets;
        }
        
        
        if (stored.categories) {
            if (stored.categories.income) {
                merged.categories.income = [...this.defaultData.categories.income, ...stored.categories.income.filter(cat => 
                    !this.defaultData.categories.income.some(defaultCat => defaultCat.name === cat.name)
                )];
            }
            if (stored.categories.expense) {
                merged.categories.expense = [...this.defaultData.categories.expense, ...stored.categories.expense.filter(cat => 
                    !this.defaultData.categories.expense.some(defaultCat => defaultCat.name === cat.name)
                )];
            }
        }
        
        
        if (stored.settings) {
            merged.settings = { ...this.defaultData.settings, ...stored.settings };
        }
        
        return merged;
    }

    /**
     * Get all transactions
     */
    getTransactions() {
        return this.data.transactions || [];
    }

    /**
     * Add a new transaction
     */
    addTransaction(transaction) {
        const newTransaction = {
            id: this.generateId(),
            ...transaction,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.transactions.push(newTransaction);
        this.saveData();
        return newTransaction;
    }

    /**
     * Update an existing transaction
     */
    updateTransaction(id, updates) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.data.transactions[index] = {
                ...this.data.transactions[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return this.data.transactions[index];
        }
        return null;
    }

    /**
     * Delete a transaction
     */
    deleteTransaction(id) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const deleted = this.data.transactions.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     * Get transactions filtered by date range
     */
    getTransactionsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.data.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= start && transactionDate <= end;
        });
    }

    /**
     * Get transactions by type
     */
    getTransactionsByType(type) {
        return this.data.transactions.filter(t => t.type === type);
    }

    /**
     * Get transactions by category
     */
    getTransactionsByCategory(category) {
        return this.data.transactions.filter(t => t.category === category);
    }

    /**
     * Get all budgets
     */
    getBudgets() {
        return this.data.budgets || [];
    }

    /**
     * Add a new budget
     */
    addBudget(budget) {
        const newBudget = {
            id: this.generateId(),
            ...budget,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.budgets.push(newBudget);
        this.saveData();
        return newBudget;
    }

    /**
     * Update an existing budget
     */
    updateBudget(id, updates) {
        const index = this.data.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            this.data.budgets[index] = {
                ...this.data.budgets[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return this.data.budgets[index];
        }
        return null;
    }

    /**
     * Delete a budget
     */
    deleteBudget(id) {
        const index = this.data.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            const deleted = this.data.budgets.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     * Get categories by type
     */
    getCategories(type) {
        return this.data.categories[type] || [];
    }

    /**
     * Add a new category
     */
    addCategory(type, category) {
        if (!this.data.categories[type]) {
            this.data.categories[type] = [];
        }
        
        const newCategory = {
            id: this.generateId(),
            ...category,
            createdAt: new Date().toISOString()
        };
        
        this.data.categories[type].push(newCategory);
        this.saveData();
        return newCategory;
    }

    /**
     * Delete a category
     */
    deleteCategory(type, categoryId) {
        if (!this.data.categories[type]) {
            return null;
        }
        
        const index = this.data.categories[type].findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            const deleted = this.data.categories[type].splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     * Update a category
     */
    updateCategory(type, categoryId, updates) {
        if (!this.data.categories[type]) {
            return null;
        }
        
        const index = this.data.categories[type].findIndex(cat => cat.id === categoryId);
        if (index !== -1) {
            this.data.categories[type][index] = {
                ...this.data.categories[type][index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return this.data.categories[type][index];
        }
        return null;
    }

    /**
     * Get settings
     */
    getSettings() {
        return this.data.settings || this.defaultData.settings;
    }

    /**
     * Update settings
     */
    updateSettings(updates) {
        this.data.settings = { ...this.data.settings, ...updates };
        this.saveData();
        return this.data.settings;
    }

    /**
     * Export all data
     */
    exportData() {
        return {
            ...this.data,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import data
     */
    importData(importedData) {
        try {
            
            if (this.validateImportedData(importedData)) {
                this.data = this.mergeWithDefaults(importedData);
                this.saveData();
                return true;
            }
        } catch (error) {
            console.error('Error importing data:', error);
        }
        return false;
    }

    /**
     * Validate imported data structure
     */
    validateImportedData(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.transactions) &&
               Array.isArray(data.budgets) &&
               data.categories &&
               data.settings;
    }

    /**
     * Clear all data
     */
    clearAllData() {
        this.data = { ...this.defaultData };
        this.saveData();
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Get statistics for dashboard
     */
    getStatistics(startDate, endDate) {
        const transactions = this.getTransactionsByDateRange(startDate, endDate);
        const income = transactions.filter(t => t.type === 'income');
        const expenses = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
        
        
        const categoryBreakdown = {};
        expenses.forEach(transaction => {
            const category = transaction.category;
            if (!categoryBreakdown[category]) {
                categoryBreakdown[category] = 0;
            }
            categoryBreakdown[category] += parseFloat(transaction.amount);
        });
        
        
        const monthlyData = this.getMonthlyTrendData(startDate, endDate);
        
        return {
            totalIncome,
            totalExpenses,
            balance,
            savingsRate,
            categoryBreakdown,
            monthlyData,
            transactionCount: transactions.length
        };
    }

    /**
     * Get monthly trend data
     */
    getMonthlyTrendData(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = [];
        
        for (let d = new Date(start.getFullYear(), start.getMonth(), 1); 
             d <= end; 
             d.setMonth(d.getMonth() + 1)) {
            
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            
            const monthTransactions = this.getTransactionsByDateRange(
                monthStart.toISOString().split('T')[0],
                monthEnd.toISOString().split('T')[0]
            );
            
            
            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            months.push({
                month: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                income,
                expenses,
                balance: income - expenses
            });
        }
        
        return months;
    }

    /**
     * Get budget utilization
     */
    getBudgetUtilization(startDate, endDate) {
        const budgets = this.getBudgets();
        const expenses = this.getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'expense');
        
        return budgets.map(budget => {
            const categoryExpenses = expenses
                .filter(t => t.category === budget.category)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            const utilization = (categoryExpenses / budget.amount) * 100;
            
            return {
                ...budget,
                spent: categoryExpenses,
                remaining: budget.amount - categoryExpenses,
                utilization: Math.min(utilization, 100),
                isOverBudget: categoryExpenses > budget.amount
            };
        });
    }
}


window.storageManager = new StorageManager();
