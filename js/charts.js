/**
 * Charts Module
 * Handles all chart rendering using Chart.js
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#6366f1',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6',
            pink: '#ec4899',
            indigo: '#4f46e5',
            teal: '#14b8a6',
            orange: '#f97316'
        };
        this.defaultColors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#71717a'
        ];
    }

    /**
     * Initialize all charts
     */
    initializeCharts() {
        
        this.createExpenseChart();
        this.createTrendChart();
    }

    /**
     * Create expense categories pie chart
     */
    createExpenseChart() {
        const ctx = document.getElementById('expenseChart');
        
        if (!ctx) {
            return;
        }

        
        if (this.charts.expense) {
            this.charts.expense.destroy();
            this.charts.expense = null;
        }

        
        const context = ctx.getContext('2d');
        context.clearRect(0, 0, ctx.width, ctx.height);

        let data = this.getExpenseChartData();
        
        
        if (!data.labels || data.labels.length === 0) {
            data = {
                labels: ['No Expenses Yet'],
                values: [100],
                colors: ['#e5e7eb']
            };
        }

        
        ctx.style.display = 'block';
        ctx.style.visibility = 'visible';
        ctx.style.opacity = '1';
        ctx.style.width = '100%';
        ctx.style.height = '300px';
        ctx.style.position = 'relative';
        ctx.style.zIndex = '10';
        ctx.style.minWidth = '200px';
        ctx.style.minHeight = '200px';
        
        
        ctx.width = ctx.offsetWidth || 400;
        ctx.height = ctx.offsetHeight || 300;
        
        this.charts.expense = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
                    borderColor: 'var(--bg-primary)',
                    hoverBorderWidth: 3,
                    hoverBorderColor: 'var(--primary-color)'
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                resizeDelay: 0,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                layout: {
                    padding: 10
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            color: 'var(--text-primary)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'var(--bg-primary)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                
                                
                                if (label === 'No Expenses Yet') {
                                    return 'No expenses recorded yet';
                                }
                                
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${Utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
    }

    /**
     * Create income vs expenses trend chart
     */
    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        
        if (!ctx) {
            return;
        }

        
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.charts.trend = null;
        }

        
        const context = ctx.getContext('2d');
        context.clearRect(0, 0, ctx.width, ctx.height);

        let data = this.getTrendChartData();
        
        
        if (!data.labels || data.labels.length === 0) {
            data = {
                labels: ['No Transactions Yet'],
                income: [0],
                expenses: [0]
            };
        }

        
        ctx.style.display = 'block';
        ctx.style.visibility = 'visible';
        ctx.style.opacity = '1';
        ctx.style.width = '100%';
        ctx.style.height = '300px';
        ctx.style.position = 'relative';
        ctx.style.zIndex = '10';
        ctx.style.minWidth = '200px';
        ctx.style.minHeight = '200px';
        
        
        ctx.width = ctx.offsetWidth || 400;
        ctx.height = ctx.offsetHeight || 300;
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        borderColor: this.colors.success,
                        backgroundColor: this.colors.success + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: this.colors.success,
                        pointBorderColor: 'var(--bg-primary)',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Expenses',
                        data: data.expenses,
                        borderColor: this.colors.error,
                        backgroundColor: this.colors.error + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: this.colors.error,
                        pointBorderColor: 'var(--bg-primary)',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                resizeDelay: 0,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                layout: {
                    padding: 10
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            color: 'var(--text-primary)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'var(--bg-primary)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                
                                
                                if (context.label === 'No Transactions Yet') {
                                    return 'No transactions recorded yet';
                                }
                                
                                return `${label}: ${Utils.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    /**
     * Get expense chart data
     */
    getExpenseChartData() {
        const startDate = Utils.getDateRange('current').start;
        const endDate = Utils.getDateRange('current').end;
        
        const expenses = window.storageManager.getTransactionsByDateRange(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        ).filter(t => t.type === 'expense');


        const categoryTotals = {};
        expenses.forEach(transaction => {
            const category = transaction.category;
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }
            categoryTotals[category] += parseFloat(transaction.amount);
        });

        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        const colors = labels.map((_, index) => this.defaultColors[index % this.defaultColors.length]);


        return { labels, values, colors };
    }

    /**
     * Get trend chart data
     */
    getTrendChartData() {
        const startDate = Utils.getDateRange('current').start;
        const endDate = Utils.getDateRange('current').end;
        
        const monthlyData = window.storageManager.getMonthlyTrendData(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );


        return {
            labels: monthlyData.map(m => m.month),
            income: monthlyData.map(m => m.income),
            expenses: monthlyData.map(m => m.expenses)
        };
    }

    /**
     * Update all charts with new data
     */
    updateCharts() {
        
        this.createExpenseChart();
        this.createTrendChart();
    }


    /**
     * Create budget utilization chart
     */
    createBudgetChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        
        if (this.charts.budget) {
            this.charts.budget.destroy();
        }

        this.charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Budget Utilization (%)',
                    data: data.utilization,
                    backgroundColor: data.colors,
                    borderColor: data.colors,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'var(--bg-primary)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const category = context.label;
                                const utilization = context.parsed.y;
                                const budget = data.budgets[context.dataIndex];
                                return [
                                    `${category}: ${utilization.toFixed(1)}%`,
                                    `Budget: ${Utils.formatCurrency(budget.amount)}`,
                                    `Spent: ${Utils.formatCurrency(budget.spent)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Create savings rate chart
     */
    createSavingsChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        
        if (this.charts.savings) {
            this.charts.savings.destroy();
        }

        this.charts.savings = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Savings Rate (%)',
                    data: data.savingsRate,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: 'var(--bg-primary)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'var(--bg-primary)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const rate = context.parsed.y;
                                return `Savings Rate: ${rate.toFixed(1)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Create category comparison chart
     */
    createCategoryComparisonChart(containerId, data) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return;

        
        if (this.charts.categoryComparison) {
            this.charts.categoryComparison.destroy();
        }

        this.charts.categoryComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'This Month',
                        data: data.currentMonth,
                        backgroundColor: this.colors.primary + '80',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false
                    },
                    {
                        label: 'Last Month',
                        data: data.lastMonth,
                        backgroundColor: this.colors.secondary + '80',
                        borderColor: this.colors.secondary,
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            color: 'var(--text-primary)'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'var(--bg-primary)',
                        titleColor: 'var(--text-primary)',
                        bodyColor: 'var(--text-primary)',
                        borderColor: 'var(--border-color)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${Utils.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'var(--border-color)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter',
                                size: 11
                            },
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    /**
     * Get chart colors based on theme
     */
    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return isDark ? {
            ...this.colors,
            background: 'rgba(30, 41, 59, 0.8)',
            border: 'rgba(51, 65, 85, 0.3)',
            text: '#f1f5f9'
        } : {
            ...this.colors,
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'rgba(226, 232, 240, 0.3)',
            text: '#1e293b'
        };
    }
}


window.chartManager = new ChartManager();
