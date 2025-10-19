/**
 * Budget Management Module
 * Handles budget creation, tracking, and utilization
 */

class BudgetManager {
    constructor() {
        this.storage = window.storageManager;
        this.budgets = [];
        this.loadBudgets();
    }

    /**
     * Load budgets from storage
     */
    loadBudgets() {
        this.budgets = this.storage.getBudgets();
    }

    /**
     * Create a new budget
     */
    createBudget(category, amount, period = 'monthly') {
        const budget = {
            category,
            amount: parseFloat(amount),
            period,
            isActive: true
        };

        const newBudget = this.storage.addBudget(budget);
        this.budgets.push(newBudget);
        return newBudget;
    }

    /**
     * Update an existing budget
     */
    updateBudget(id, updates) {
        const updatedBudget = this.storage.updateBudget(id, updates);
        if (updatedBudget) {
            const index = this.budgets.findIndex(b => b.id === id);
            if (index !== -1) {
                this.budgets[index] = updatedBudget;
            }
        }
        return updatedBudget;
    }

    /**
     * Delete a budget
     */
    deleteBudget(id) {
        const deleted = this.storage.deleteBudget(id);
        if (deleted) {
            this.budgets = this.budgets.filter(b => b.id !== id);
        }
        return deleted;
    }

    /**
     * Get budget utilization for a specific period
     */
    getBudgetUtilization(startDate, endDate) {
        const budgets = this.storage.getBudgets();
        const expenses = this.storage.getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'expense');

        return budgets.map(budget => {
            const categoryExpenses = expenses
                .filter(t => t.category === budget.category)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const utilization = (categoryExpenses / budget.amount) * 100;
            const remaining = budget.amount - categoryExpenses;
            const isOverBudget = categoryExpenses > budget.amount;

            return {
                ...budget,
                spent: categoryExpenses,
                remaining: Math.max(remaining, 0),
                utilization: Math.min(utilization, 100),
                isOverBudget,
                status: this.getBudgetStatus(utilization, isOverBudget)
            };
        });
    }

    /**
     * Get budget status based on utilization
     */
    getBudgetStatus(utilization, isOverBudget) {
        if (isOverBudget) return 'over';
        if (utilization >= 90) return 'warning';
        if (utilization >= 75) return 'caution';
        return 'good';
    }

    /**
     * Get budget alerts
     */
    getBudgetAlerts(startDate, endDate) {
        const utilizations = this.getBudgetUtilization(startDate, endDate);
        const alerts = [];

        utilizations.forEach(budget => {
            if (budget.isOverBudget) {
                alerts.push({
                    type: 'error',
                    category: budget.category,
                    message: `Over budget by ${Utils.formatCurrency(budget.spent - budget.amount)}`,
                    amount: budget.spent - budget.amount
                });
            } else if (budget.utilization >= 90) {
                alerts.push({
                    type: 'warning',
                    category: budget.category,
                    message: `90% of budget used (${Utils.formatCurrency(budget.remaining)} remaining)`,
                    amount: budget.remaining
                });
            } else if (budget.utilization >= 75) {
                alerts.push({
                    type: 'info',
                    category: budget.category,
                    message: `75% of budget used (${Utils.formatCurrency(budget.remaining)} remaining)`,
                    amount: budget.remaining
                });
            }
        });

        return alerts;
    }

    /**
     * Get budget recommendations
     */
    getBudgetRecommendations(startDate, endDate) {
        const utilizations = this.getBudgetUtilization(startDate, endDate);
        const recommendations = [];

        
        const allExpenses = this.storage.getTransactionsByDateRange(startDate, endDate)
            .filter(t => t.type === 'expense');
        
        const categorySpending = {};
        allExpenses.forEach(transaction => {
            const category = transaction.category;
            if (!categorySpending[category]) {
                categorySpending[category] = 0;
            }
            categorySpending[category] += parseFloat(transaction.amount);
        });

        Object.entries(categorySpending).forEach(([category, amount]) => {
            const hasBudget = utilizations.some(b => b.category === category);
            if (!hasBudget && amount > 100) { 
                recommendations.push({
                    type: 'suggestion',
                    category,
                    message: `Consider setting a budget for ${category} (spent ${Utils.formatCurrency(amount)})`,
                    suggestedAmount: Math.round(amount * 1.2) 
                });
            }
        });

        
        utilizations.forEach(budget => {
            if (budget.utilization < 50 && budget.amount > 200) {
                recommendations.push({
                    type: 'optimization',
                    category: budget.category,
                    message: `${budget.category} budget is only ${budget.utilization.toFixed(1)}% utilized`,
                    suggestedAmount: Math.round(budget.spent * 1.1) 
                });
            }
        });

        return recommendations;
    }

    /**
     * Calculate total budgeted amount
     */
    getTotalBudgeted() {
        return this.budgets
            .filter(b => b.isActive)
            .reduce((sum, b) => sum + b.amount, 0);
    }

    /**
     * Calculate total spent against budgets
     */
    getTotalSpentAgainstBudgets(startDate, endDate) {
        const utilizations = this.getBudgetUtilization(startDate, endDate);
        return utilizations.reduce((sum, b) => sum + b.spent, 0);
    }

    /**
     * Get budget performance metrics
     */
    getBudgetPerformance(startDate, endDate) {
        const utilizations = this.getBudgetUtilization(startDate, endDate);
        const totalBudgeted = this.getTotalBudgeted();
        const totalSpent = this.getTotalSpentAgainstBudgets(startDate, endDate);
        const averageUtilization = utilizations.length > 0 
            ? utilizations.reduce((sum, b) => sum + b.utilization, 0) / utilizations.length 
            : 0;

        const overBudgetCount = utilizations.filter(b => b.isOverBudget).length;
        const warningCount = utilizations.filter(b => b.utilization >= 90 && !b.isOverBudget).length;

        return {
            totalBudgeted,
            totalSpent,
            averageUtilization,
            overBudgetCount,
            warningCount,
            budgetCount: utilizations.length,
            performance: this.calculatePerformanceScore(utilizations)
        };
    }

    /**
     * Calculate overall budget performance score
     */
    calculatePerformanceScore(utilizations) {
        if (utilizations.length === 0) return 100;

        const scores = utilizations.map(budget => {
            if (budget.isOverBudget) return 0;
            if (budget.utilization >= 100) return 0;
            if (budget.utilization >= 90) return 25;
            if (budget.utilization >= 75) return 50;
            if (budget.utilization >= 50) return 75;
            return 100;
        });

        return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }

    /**
     * Render budget cards
     */
    renderBudgetCards(container, startDate, endDate) {
        const utilizations = this.getBudgetUtilization(startDate, endDate);
        
        if (utilizations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>No Budgets Set</h3>
                    <p>Create your first budget to start tracking your spending goals.</p>
                    <button class="btn btn-primary" onclick="budgetManager.showAddBudgetModal()">
                        <i class="fas fa-plus"></i>
                        Set Budget
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = utilizations.map(budget => {
            const statusClass = budget.status === 'over' ? 'over-budget' : 
                               budget.status === 'warning' ? 'warning' : 
                               budget.status === 'caution' ? 'caution' : 'good';
            
            return `
                <div class="budget-card ${statusClass}">
                    <div class="budget-header">
                        <div class="budget-category">${budget.category}</div>
                        <div class="budget-amount">${Utils.formatCurrency(budget.amount)}</div>
                    </div>
                    <div class="budget-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${budget.utilization}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>${Utils.formatCurrency(budget.spent)} spent</span>
                            <span>${budget.utilization.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="budget-details">
                        <div class="budget-remaining">
                            <i class="fas fa-${budget.isOverBudget ? 'exclamation-triangle' : 'check-circle'}"></i>
                            <span>${budget.isOverBudget ? 
                                `Over by ${Utils.formatCurrency(budget.spent - budget.amount)}` : 
                                `${Utils.formatCurrency(budget.remaining)} remaining`}
                            </span>
                        </div>
                        <div class="budget-actions">
                            <button class="action-btn edit" onclick="budgetManager.editBudget('${budget.id}')" title="Edit Budget">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="budgetManager.deleteBudget('${budget.id}')" title="Delete Budget">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Show add budget modal
     */
    showAddBudgetModal() {
        const modal = document.getElementById('budgetModal');
        if (!modal) {
            this.createBudgetModal();
        }
        
        const modalElement = document.getElementById('budgetModal');
        modalElement.classList.add('active');
        document.getElementById('budgetForm').reset();
        document.getElementById('modalTitle').textContent = 'Set Budget';
    }

    /**
     * Create budget modal
     */
    createBudgetModal() {
        const modalHTML = `
            <div class="modal" id="budgetModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Set Budget</h3>
                        <button class="close-btn" onclick="this.closest('.modal').classList.remove('active')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="budgetForm">
                        <div class="form-group">
                            <label for="budgetCategory">Category</label>
                            <select id="budgetCategory" required>
                                <option value="">Select Category</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="budgetAmount">Amount</label>
                            <input type="number" id="budgetAmount" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="budgetPeriod">Period</label>
                            <select id="budgetPeriod">
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').classList.remove('active')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Budget</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.populateBudgetCategories();
        this.setupBudgetFormHandlers();
    }

    /**
     * Populate budget categories
     */
    populateBudgetCategories() {
        const select = document.getElementById('budgetCategory');
        const expenseCategories = this.storage.getCategories('expense');
        
        select.innerHTML = '<option value="">Select Category</option>' +
            expenseCategories.map(cat => 
                `<option value="${cat.name}">${cat.name}</option>`
            ).join('');
    }

    /**
     * Update budget categories dropdown
     */
    updateBudgetCategories() {
        const select = document.getElementById('budgetCategory');
        const expenseCategories = this.storage.getCategories('expense');
        
        if (expenseCategories.length === 0) {
            select.innerHTML = '<option value="">No expense categories - Add some first</option>';
        } else {
            select.innerHTML = '<option value="">Select Category</option>' +
                expenseCategories.map(cat => 
                    `<option value="${cat.name}">${cat.name}</option>`
                ).join('');
        }
    }

    /**
     * Setup budget form handlers
     */
    setupBudgetFormHandlers() {
        const form = document.getElementById('budgetForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });
    }

    /**
     * Handle budget form submission
     */
    handleBudgetSubmit() {
        const category = document.getElementById('budgetCategory').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const period = document.getElementById('budgetPeriod').value;

        if (!category || !amount) {
            Utils.showNotification('Please fill in all required fields', 'error');
            return;
        }

        
        const existingBudget = this.budgets.find(b => b.category === category);
        if (existingBudget) {
            if (confirm(`A budget already exists for ${category}. Do you want to update it?`)) {
                this.updateBudget(existingBudget.id, { amount, period });
                Utils.showNotification('Budget updated successfully', 'success');
            } else {
                return;
            }
        } else {
            this.createBudget(category, amount, period);
            Utils.showNotification('Budget created successfully', 'success');
        }

        document.getElementById('budgetModal').classList.remove('active');
        
        
        this.updateBudgetCategories();
        
        this.renderBudgetCards(document.getElementById('budgetCards'), 
            Utils.getDateRange('current').start, 
            Utils.getDateRange('current').end);
        
        
        if (window.chartManager) {
            window.chartManager.updateCharts();
        }
    }

    /**
     * Edit budget
     */
    editBudget(id) {
        const budget = this.budgets.find(b => b.id === id);
        if (!budget) return;

        this.showAddBudgetModal();
        document.getElementById('budgetCategory').value = budget.category;
        document.getElementById('budgetAmount').value = budget.amount;
        document.getElementById('budgetPeriod').value = budget.period;
        document.getElementById('budgetCategory').disabled = true;
    }

    /**
     * Delete budget with confirmation
     */
    deleteBudget(id) {
        const budget = this.budgets.find(b => b.id === id);
        if (!budget) return;

        if (confirm(`Are you sure you want to delete the budget for ${budget.category}?`)) {
            const deleted = this.storage.deleteBudget(id);
            if (deleted) {
                this.budgets = this.budgets.filter(b => b.id !== id);
                Utils.showNotification('Budget deleted successfully', 'success');
                this.renderBudgetCards(document.getElementById('budgetCards'), 
                    Utils.getDateRange('current').start, 
                    Utils.getDateRange('current').end);
                
                if (window.chartManager) {
                    window.chartManager.updateCharts();
                }
            }
        }
    }
}


window.budgetManager = new BudgetManager();
