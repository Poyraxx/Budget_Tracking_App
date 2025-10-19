/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

class Utils {
    /**
     * Format currency based on settings
     */
    static formatCurrency(amount, currency = 'USD') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return formatter.format(amount);
    }

    /**
     * Format date based on settings
     */
    static formatDate(date, format = 'MM/DD/YYYY') {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return d.toLocaleDateString('en-US', options);
    }

    /**
     * Format date for input fields
     */
    static formatDateForInput(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    /**
     * Get date range based on filter
     */
    static getDateRange(filter) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        switch (filter) {
            case 'current':
                return {
                    start: new Date(currentYear, currentMonth, 1),
                    end: new Date(currentYear, currentMonth + 1, 0)
                };
            case 'last':
                return {
                    start: new Date(currentYear, currentMonth - 1, 1),
                    end: new Date(currentYear, currentMonth, 0)
                };
            case 'year':
                return {
                    start: new Date(currentYear, 0, 1),
                    end: new Date(currentYear, 11, 31)
                };
            default:
                return {
                    start: new Date(currentYear, currentMonth, 1),
                    end: new Date(currentYear, currentMonth + 1, 0)
                };
        }
    }

    /**
     * Calculate percentage change
     */
    static calculatePercentageChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Generate random color
     */
    static generateColor() {
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
            '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#71717a'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Debounce function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Show notification
     */
    static showNotification(message, type = 'info', duration = 3000) {
        
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: var(--radius-sm);
            transition: var(--transition);
        `;

        
        const typeColors = {
            success: 'var(--success-color)',
            error: 'var(--error-color)',
            warning: 'var(--warning-color)',
            info: 'var(--primary-color)'
        };

        notification.style.borderLeftColor = typeColors[type] || typeColors.info;
        notification.querySelector('i').style.color = typeColors[type] || typeColors.info;

        document.body.appendChild(notification);

        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease-in reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * Get notification icon based on type
     */
    static getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show loading state
     */
    static showLoading(element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
    }

    /**
     * Hide loading state
     */
    static hideLoading(element) {
        element.classList.remove('loading');
        element.style.pointerEvents = 'auto';
    }

    /**
     * Validate email
     */
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate amount
     */
    static isValidAmount(amount) {
        return !isNaN(amount) && parseFloat(amount) >= 0;
    }

    /**
     * Sanitize HTML
     */
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showNotification('Failed to copy to clipboard', 'error');
            return false;
        }
    }

    /**
     * Download file
     */
    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Read file as text
     */
    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Get file size in human readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate CSV from data
     */
    static generateCSV(data, headers) {
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    /**
     * Parse CSV to data
     */
    static parseCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
        return { headers, data };
    }

    /**
     * Get contrast color (black or white) for background
     */
    static getContrastColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    /**
     * Animate number counting
     */
    static animateNumber(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (difference * this.easeOutCubic(progress));
            element.textContent = this.formatCurrency(current);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    /**
     * Easing function
     */
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Get relative time (e.g., "2 hours ago")
     */
    static getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    /**
     * Check if device is mobile
     */
    static isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Get device type
     */
    static getDeviceType() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        if (width <= 1024) return 'laptop';
        return 'desktop';
    }

    /**
     * Local storage with expiration
     */
    static setWithExpiry(key, value, ttl) {
        const item = {
            value: value,
            expiry: new Date().getTime() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    static getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        if (new Date().getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * Deep clone object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Merge objects deeply
     */
    static deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Generate UUID
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Parse number from string
     */
    static parseNumber(str) {
        return parseFloat(str.replace(/,/g, '')) || 0;
    }

    /**
     * Check if value is empty
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Capitalize first letter
     */
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Convert string to slug
     */
    static slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}


window.Utils = Utils;
