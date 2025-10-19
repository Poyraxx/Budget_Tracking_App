
class BudgetBuddyApp {
    constructor() {
        this.storage = window.storageManager;
        this.budgetManager = window.budgetManager;
        this.chartManager = window.chartManager;
        this.currentFilter = 'current';
        this.editingTransactionId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.setupTheme();
        
        setTimeout(() => {
            this.chartManager.initializeCharts();
        }, 200);
        
        this.loadDashboard();
        this.loadTransactions();
        this.loadBudgets();
        
        setInterval(() => {
            const expenseChart = document.getElementById('expenseChart');
            const trendChart = document.getElementById('trendChart');
            const transactionTable = document.getElementById('transactionsTableBody');
            
            if (expenseChart && (!this.chartManager.charts.expense || this.chartManager.charts.expense.destroyed)) {
                this.chartManager.createExpenseChart();
            }
            
            if (trendChart && (!this.chartManager.charts.trend || this.chartManager.charts.trend.destroyed)) {
                this.chartManager.createTrendChart();
            }
            
            if (transactionTable && transactionTable.children.length === 0) {
                this.loadTransactions();
            }
        }, 5000);
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        
        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            const dateRange = Utils.getDateRange(this.currentFilter);
            const stats = this.storage.getStatistics(
                dateRange.start.toISOString().split('T')[0],
                dateRange.end.toISOString().split('T')[0]
            );
            this.updateSummaryCards(stats);
            
            this.chartManager.updateCharts();
            this.budgetManager.renderBudgetCards(
                document.getElementById('budgetCards'),
                dateRange.start,
                dateRange.end
            );
        });

        
        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.showTransactionModal();
        });

        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideTransactionModal();
        });

        document.getElementById('cancelTransaction').addEventListener('click', () => {
            this.hideTransactionModal();
        });

        
        document.getElementById('searchTransactions').addEventListener('input', 
            Utils.debounce((e) => {
                this.filterTransactions(e.target.value);
            }, 300)
        );

        
        document.getElementById('addBudgetBtn').addEventListener('click', () => {
            this.budgetManager.showAddBudgetModal();
        });

        
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showCategoryModal();
        });

        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('cancelCategory').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });

        
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('printReportBtn').addEventListener('click', () => {
            this.printReport();
        });

        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideTransactionModal();
            }
        });

        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showTransactionModal();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportData();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.importData();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.hideTransactionModal();
            }
        });

        
        window.addEventListener('resize', Utils.throttle(() => {
            setTimeout(() => {
                this.chartManager.resizeCharts();
            }, 100);
        }, 250));

        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    this.chartManager.updateCharts();
                }, 200);
            }
        });

        
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        this.populateCategoryOptions();
        this.setupDateInputs();
        this.setupTransactionTable();
    }

    /**
     * Setup theme
     */
    setupTheme() {
        const savedTheme = this.storage.getSettings().theme || 'light';
        this.setTheme(savedTheme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.storage.updateSettings({ theme });
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        
    }

    /**
     * Load dashboard data
     */
    loadDashboard() {
        const dateRange = Utils.getDateRange(this.currentFilter);
        const stats = this.storage.getStatistics(
            dateRange.start.toISOString().split('T')[0],
            dateRange.end.toISOString().split('T')[0]
        );

        this.updateSummaryCards(stats);
    }

    /**
     * Update summary cards
     */
    updateSummaryCards(stats) {
        
        const balanceElement = document.getElementById('totalBalance');
        const balanceChange = document.getElementById('balanceChange');
        Utils.animateNumber(balanceElement, 0, stats.balance);
        this.updateChangeIndicator(balanceChange, stats.balance, 0);

        
        const incomeElement = document.getElementById('totalIncome');
        const incomeChange = document.getElementById('incomeChange');
        Utils.animateNumber(incomeElement, 0, stats.totalIncome);
        this.updateChangeIndicator(incomeChange, stats.totalIncome, 0);

        
        const expensesElement = document.getElementById('totalExpenses');
        const expenseChange = document.getElementById('expenseChange');
        Utils.animateNumber(expensesElement, 0, stats.totalExpenses);
        this.updateChangeIndicator(expenseChange, stats.totalExpenses, 0);

        
        const savingsElement = document.getElementById('savingsRate');
        const savingsChange = document.getElementById('savingsChange');
        savingsElement.textContent = `${stats.savingsRate.toFixed(1)}%`;
        this.updateChangeIndicator(savingsChange, stats.savingsRate, 0);
    }

    /**
     * Update change indicator
     */
    updateChangeIndicator(element, current, previous) {
        const change = Utils.calculatePercentageChange(current, previous);
        const icon = element.querySelector('i');
        const text = element.querySelector('span');
        
        icon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
        text.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        
        element.className = `change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    /**
     * Load transactions
     */
    loadTransactions() {
        try {
            const transactions = this.storage.getTransactions();
            
            
            const tbody = document.getElementById('transactionsTableBody');
            if (!tbody) {
                return;
            }
            
            this.renderTransactionsTable(transactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
            Utils.showNotification('Error loading transactions', 'error');
        }
    }

    /**
     * Render transactions table
     */
    renderTransactionsTable(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        
        if (!tbody) {
            return;
        }
        
        
        tbody.innerHTML = '';
        
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-receipt"></i>
                            <h3>No Transactions</h3>
                            <p>Add your first transaction to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        try {
            const sortedTransactions = transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            tbody.innerHTML = sortedTransactions
                .map(transaction => this.createTransactionRow(transaction))
                .join('');
            
            
            tbody.style.display = 'table-row-group';
            tbody.style.visibility = 'visible';
            tbody.style.opacity = '1';
            
        } catch (error) {
            console.error('Error rendering transactions:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Error Loading Transactions</h3>
                            <p>Please refresh the page to try again.</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Create transaction row HTML
     */
    createTransactionRow(transaction) {
        const typeClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
        
        return `
            <tr class="stagger-item">
                <td>${Utils.formatDate(transaction.date)}</td>
                <td>
                    <span class="type-badge ${typeClass}">
                        <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
                        ${transaction.type}
                    </span>
                </td>
                <td>
                    <span class="category-badge">
                        <i class="fas fa-tag"></i>
                        ${transaction.category}
                    </span>
                </td>
                <td>${Utils.sanitizeHTML(transaction.description || '')}</td>
                <td class="${amountClass}">
                    ${transaction.type === 'income' ? '+' : '-'}${Utils.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editTransaction('${transaction.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteTransaction('${transaction.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Filter transactions
     */
    filterTransactions(searchTerm) {
        const allTransactions = this.storage.getTransactions();
        const filtered = allTransactions.filter(transaction => {
            const searchLower = searchTerm.toLowerCase();
            return transaction.description.toLowerCase().includes(searchLower) ||
                   transaction.category.toLowerCase().includes(searchLower) ||
                   transaction.type.toLowerCase().includes(searchLower) ||
                   transaction.amount.toString().includes(searchLower);
        });
        
        this.renderTransactionsTable(filtered);
    }

    /**
     * Show transaction modal
     */
    showTransactionModal() {
        const modal = document.getElementById('transactionModal');
        modal.classList.add('active');
        document.getElementById('transactionDate').value = Utils.formatDateForInput(new Date());
        this.editingTransactionId = null;
    }

    /**
     * Hide transaction modal
     */
    hideTransactionModal() {
        const modal = document.getElementById('transactionModal');
        modal.classList.remove('active');
        document.getElementById('transactionForm').reset();
        this.editingTransactionId = null;
    }

    /**
     * Handle transaction form submission
     */
    handleTransactionSubmit() {
        const formData = {
            type: document.getElementById('transactionType').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            description: document.getElementById('transactionDescription').value,
            date: document.getElementById('transactionDate').value
        };

        if (!this.validateTransactionForm(formData)) {
            return;
        }

        if (this.editingTransactionId) {
            this.storage.updateTransaction(this.editingTransactionId, formData);
            Utils.showNotification('Transaction updated successfully', 'success');
        } else {
            this.storage.addTransaction(formData);
            Utils.showNotification('Transaction added successfully', 'success');
        }

        this.hideTransactionModal();
        this.loadTransactions();
        this.updateSummaryCards(this.storage.getStatistics(
            Utils.getDateRange(this.currentFilter).start.toISOString().split('T')[0],
            Utils.getDateRange(this.currentFilter).end.toISOString().split('T')[0]
        ));
        
        this.chartManager.updateCharts();
    }

    /**
     * Validate transaction form
     */
    validateTransactionForm(data) {
        if (!data.type) {
            Utils.showNotification('Please select transaction type', 'error');
            return false;
        }
        if (!data.amount || data.amount <= 0) {
            Utils.showNotification('Please enter a valid amount', 'error');
            return false;
        }
        if (!data.category) {
            Utils.showNotification('Please select a category', 'error');
            return false;
        }
        if (!data.date) {
            Utils.showNotification('Please select a date', 'error');
            return false;
        }
        return true;
    }

    /**
     * Edit transaction
     */
    editTransaction(id) {
        const transaction = this.storage.getTransactions().find(t => t.id === id);
        if (!transaction) return;

        this.editingTransactionId = id;
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description || '';
        document.getElementById('transactionDate').value = transaction.date;

        document.getElementById('transactionModal').classList.add('active');
    }

    /**
     * Delete transaction
     */
    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.storage.deleteTransaction(id);
            Utils.showNotification('Transaction deleted successfully', 'success');
            this.loadTransactions();
        this.updateSummaryCards(this.storage.getStatistics(
            Utils.getDateRange(this.currentFilter).start.toISOString().split('T')[0],
            Utils.getDateRange(this.currentFilter).end.toISOString().split('T')[0]
        ));
        
        this.chartManager.updateCharts();
        }
    }

    /**
     * Populate category options
     */
    populateCategoryOptions() {
        const categorySelect = document.getElementById('transactionCategory');
        const incomeCategories = this.storage.getCategories('income');
        const expenseCategories = this.storage.getCategories('expense');

        
        categorySelect.innerHTML = '<option value="">Select Category</option>';

        
        const currentType = document.getElementById('transactionType').value;
        const categories = currentType === 'income' ? incomeCategories : expenseCategories;
        
        
        if (categories.length === 0) {
            categorySelect.innerHTML = '<option value="">No categories - Click + to add one</option>';
        } else {
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
        }

        
        document.getElementById('transactionType').addEventListener('change', (e) => {
            this.updateCategoryDropdown();
        });
    }

    /**
     * Setup date inputs
     */
    setupDateInputs() {
        const today = Utils.formatDateForInput(new Date());
        document.getElementById('transactionDate').value = today;
        
        
        const dateRange = Utils.getDateRange('current');
        document.getElementById('reportStartDate').value = Utils.formatDateForInput(dateRange.start);
        document.getElementById('reportEndDate').value = Utils.formatDateForInput(dateRange.end);
    }

    /**
     * Setup transaction table
     */
    setupTransactionTable() {
        
        const headers = document.querySelectorAll('.transactions-table th');
        headers.forEach((header, index) => {
            if (index < 5) { 
                header.classList.add('sortable');
                header.addEventListener('click', () => {
                    this.sortTransactions(index);
                });
            }
        });
    }

    /**
     * Sort transactions
     */
    sortTransactions(columnIndex) {
        const transactions = this.storage.getTransactions();
        const columns = ['date', 'type', 'category', 'description', 'amount'];
        const column = columns[columnIndex];
        
        transactions.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (column === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (column === 'amount') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            } else {
                aVal = aVal.toString().toLowerCase();
                bVal = bVal.toString().toLowerCase();
            }
            
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
        
        this.renderTransactionsTable(transactions);
    }

    /**
     * Load budgets
     */
    loadBudgets() {
        const dateRange = Utils.getDateRange(this.currentFilter);
        this.budgetManager.renderBudgetCards(
            document.getElementById('budgetCards'),
            dateRange.start,
            dateRange.end
        );
    }

    /**
     * Export data
     */
    exportData() {
        const data = this.storage.exportData();
        const filename = `budgetbuddy-export-${new Date().toISOString().split('T')[0]}.json`;
        Utils.downloadFile(JSON.stringify(data, null, 2), filename);
        Utils.showNotification('Data exported successfully', 'success');
    }

    /**
     * Import data
     */
    importData() {
        const fileInput = document.getElementById('fileInput');
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            Utils.readFileAsText(file).then(content => {
                try {
                    const data = JSON.parse(content);
                    if (this.storage.importData(data)) {
                        Utils.showNotification('Data imported successfully', 'success');
                        this.loadDashboard();
                        this.loadTransactions();
                        this.loadBudgets();
                    } else {
                        Utils.showNotification('Invalid data format', 'error');
                    }
                } catch (error) {
                    Utils.showNotification('Error reading file', 'error');
                }
            });
        };
        
        fileInput.click();
    }

    /**
     * Generate report
     */
    generateReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        if (!startDate || !endDate) {
            Utils.showNotification('Please select date range', 'error');
            return;
        }

        const stats = this.storage.getStatistics(startDate, endDate);
        const budgetUtilization = this.budgetManager.getBudgetUtilization(startDate, endDate);
        
        this.renderReport(stats, budgetUtilization, startDate, endDate);
    }

    /**
     * Render report
     */
    renderReport(stats, budgetUtilization, startDate, endDate) {
        const container = document.getElementById('reportResults');
        
        container.innerHTML = `
            <div class="report-header">
                <h3>Financial Report</h3>
                <p>${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <h4>Total Income</h4>
                        <p>${Utils.formatCurrency(stats.totalIncome)}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Total Expenses</h4>
                        <p>${Utils.formatCurrency(stats.totalExpenses)}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Net Balance</h4>
                        <p class="${stats.balance >= 0 ? 'positive' : 'negative'}">${Utils.formatCurrency(stats.balance)}</p>
                    </div>
                    <div class="summary-item">
                        <h4>Savings Rate</h4>
                        <p>${stats.savingsRate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
            
            <div class="report-categories">
                <h4>Expense Categories</h4>
                <div class="category-list">
                    ${Object.entries(stats.categoryBreakdown).map(([category, amount]) => `
                        <div class="category-item">
                            <span>${category}</span>
                            <span>${Utils.formatCurrency(amount)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${budgetUtilization.length > 0 ? `
                <div class="report-budgets">
                    <h4>Budget Performance</h4>
                    <div class="budget-list">
                        ${budgetUtilization.map(budget => `
                            <div class="budget-item">
                                <div class="budget-info">
                                    <span>${budget.category}</span>
                                    <span>${Utils.formatCurrency(budget.spent)} / ${Utils.formatCurrency(budget.amount)}</span>
                                </div>
                                <div class="budget-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${budget.utilization}%"></div>
                                    </div>
                                    <span>${budget.utilization.toFixed(1)}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    /**
     * Print report
     */
    printReport() {
        const reportContent = document.getElementById('reportResults').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>BudgetBuddy Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                        .summary-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                        .category-list, .budget-list { margin: 20px 0; }
                        .category-item, .budget-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                        .positive { color: #10b981; }
                        .negative { color: #ef4444; }
                    </style>
                </head>
                <body>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Export report as CSV
     */
    exportReport() {
        const startDate = document.getElementById('reportStartDate').value;
        const endDate = document.getElementById('reportEndDate').value;
        
        if (!startDate || !endDate) {
            Utils.showNotification('Please generate report first', 'error');
            return;
        }

        const transactions = this.storage.getTransactionsByDateRange(startDate, endDate);
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const data = transactions.map(t => ({
            'Date': Utils.formatDate(t.date),
            'Type': t.type,
            'Category': t.category,
            'Description': t.description || '',
            'Amount': t.amount
        }));

        const csv = Utils.generateCSV(data, headers);
        const filename = `poyrax-finans-report-${startDate}-to-${endDate}.csv`;
        Utils.downloadFile(csv, filename, 'text/csv');
        Utils.showNotification('Report exported successfully', 'success');
    }

    /**
     * Show category modal
     */
    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.add('active');
        document.getElementById('categoryForm').reset();
        this.setupColorPresets();
    }

    /**
     * Hide category modal
     */
    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('active');
        document.getElementById('categoryForm').reset();
    }

    /**
     * Setup color presets
     */
    setupColorPresets() {
        const colorInput = document.getElementById('categoryColor');
        const presets = document.querySelectorAll('.color-preset');
        
        presets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                colorInput.value = color;
                
                
                presets.forEach(p => p.classList.remove('selected'));
                preset.classList.add('selected');
            });
        });
    }

    /**
     * Handle category form submission
     */
    handleCategorySubmit() {
        const name = document.getElementById('categoryName').value.trim();
        const type = document.getElementById('categoryType').value;
        const color = document.getElementById('categoryColor').value;
        const icon = document.getElementById('categoryIcon').value;

        if (!name || !type) {
            Utils.showNotification('Please fill in all required fields', 'error');
            return;
        }

        
        const existingCategories = this.storage.getCategories(type);
        const exists = existingCategories.some(cat => 
            cat.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            Utils.showNotification('Category already exists', 'error');
            return;
        }

        
        const newCategory = {
            name,
            color,
            icon
        };

        this.storage.addCategory(type, newCategory);
        Utils.showNotification('Category added successfully', 'success');
        
        this.hideCategoryModal();
        
        
        this.updateCategoryDropdown();
        
        
        if (document.getElementById('budgetCategory')) {
            this.budgetManager.updateBudgetCategories();
        }
        
        
        this.chartManager.updateCharts();
    }

    /**
     * Update category dropdown with latest categories
     */
    updateCategoryDropdown() {
        const categorySelect = document.getElementById('transactionCategory');
        const currentType = document.getElementById('transactionType').value;
        const categories = this.storage.getCategories(currentType);
        
        
        if (categories.length === 0) {
            categorySelect.innerHTML = '<option value="">No categories - Click + to add one</option>';
        } else {
            categorySelect.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
        }
    }


}


document.addEventListener('DOMContentLoaded', () => {
    
    setTimeout(() => {
        
        window.storageManager = new StorageManager();
        window.budgetManager = new BudgetManager();
        window.chartManager = new ChartManager();
        
        
        window.app = new BudgetBuddyApp();
    }, 100);
});
