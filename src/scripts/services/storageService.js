// Storage Service - Handles local storage and data persistence
class StorageService {
    constructor() {
        this.storagePrefix = 'invitation_app_';
        this.isAvailable = this.checkStorageAvailability();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.setItem = this.setItem.bind(this);
        this.getItem = this.getItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.clear = this.clear.bind(this);
    }

    init() {
        console.log('💾 Storage Service initialized, available:', this.isAvailable);
        
        // Clean up old data on init
        this.cleanupOldData();
    }

    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('⚠️ Local storage not available:', error.message);
            return false;
        }
    }

    setItem(key, value, options = {}) {
        if (!this.isAvailable) {
            console.warn('💾 Storage not available, cannot save:', key);
            return false;
        }

        try {
            const storageKey = this.storagePrefix + key;
            const data = {
                value,
                timestamp: Date.now(),
                expires: options.expires || null,
                version: options.version || '1.0'
            };

            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log('💾 Saved to storage:', key);
            return true;
        } catch (error) {
            console.error('❌ Failed to save to storage:', error);
            return false;
        }
    }

    getItem(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }

        try {
            const storageKey = this.storagePrefix + key;
            const stored = localStorage.getItem(storageKey);
            
            if (!stored) {
                return defaultValue;
            }

            const data = JSON.parse(stored);
            
            // Check expiration
            if (data.expires && Date.now() > data.expires) {
                this.removeItem(key);
                return defaultValue;
            }

            return data.value;
        } catch (error) {
            console.error('❌ Failed to read from storage:', error);
            return defaultValue;
        }
    }

    removeItem(key) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const storageKey = this.storagePrefix + key;
            localStorage.removeItem(storageKey);
            console.log('💾 Removed from storage:', key);
            return true;
        } catch (error) {
            console.error('❌ Failed to remove from storage:', error);
            return false;
        }
    }

    clear() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('💾 Cleared all app storage');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear storage:', error);
            return false;
        }
    }

    // Specialized methods for app data
    saveRSVP(rsvpData) {
        const key = `rsvp_${Date.now()}`;
        return this.setItem(key, rsvpData, {
            expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        });
    }

    getRSVPs() {
        const rsvps = [];
        if (!this.isAvailable) return rsvps;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix + 'rsvp_')) {
                    const rsvp = this.getStoredItem(key);
                    if (rsvp) {
                        rsvps.push(rsvp);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Failed to get RSVPs:', error);
        }

        return rsvps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    saveContactMessage(contactData) {
        const key = `contact_${Date.now()}`;
        return this.setItem(key, contactData, {
            expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        });
    }

    getContactMessages() {
        const messages = [];
        if (!this.isAvailable) return messages;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix + 'contact_')) {
                    const message = this.getStoredItem(key);
                    if (message) {
                        messages.push(message);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Failed to get contact messages:', error);
        }

        return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getStoredItem(fullKey) {
        try {
            const stored = localStorage.getItem(fullKey);
            if (!stored) return null;

            const data = JSON.parse(stored);
            
            // Check expiration
            if (data.expires && Date.now() > data.expires) {
                localStorage.removeItem(fullKey);
                return null;
            }

            return data.value;
        } catch (error) {
            console.error('❌ Failed to parse stored item:', error);
            return null;
        }
    }

    // User preferences
    saveUserPreferences(preferences) {
        return this.setItem('user_preferences', preferences);
    }

    getUserPreferences() {
        return this.getItem('user_preferences', {
            theme: 'default',
            language: 'en',
            notifications: true
        });
    }

    // App state
    saveAppState(state) {
        return this.setItem('app_state', state);
    }

    getAppState() {
        return this.getItem('app_state', {});
    }

    // Session data (expires when browser closes)
    setSessionItem(key, value) {
        try {
            sessionStorage.setItem(this.storagePrefix + key, JSON.stringify({
                value,
                timestamp: Date.now()
            }));
            return true;
        } catch (error) {
            console.error('❌ Failed to save session data:', error);
            return false;
        }
    }

    getSessionItem(key, defaultValue = null) {
        try {
            const stored = sessionStorage.getItem(this.storagePrefix + key);
            if (!stored) return defaultValue;

            const data = JSON.parse(stored);
            return data.value;
        } catch (error) {
            console.error('❌ Failed to read session data:', error);
            return defaultValue;
        }
    }

    removeSessionItem(key) {
        try {
            sessionStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error('❌ Failed to remove session data:', error);
            return false;
        }
    }

    // Data export/import
    exportData() {
        if (!this.isAvailable) {
            return null;
        }

        try {
            const data = {};
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    const shortKey = key.replace(this.storagePrefix, '');
                    data[shortKey] = this.getStoredItem(key);
                }
            });

            return {
                exported: new Date().toISOString(),
                version: '1.0',
                data
            };
        } catch (error) {
            console.error('❌ Failed to export data:', error);
            return null;
        }
    }

    importData(exportedData) {
        if (!this.isAvailable || !exportedData || !exportedData.data) {
            return false;
        }

        try {
            Object.keys(exportedData.data).forEach(key => {
                if (exportedData.data[key] !== null) {
                    this.setItem(key, exportedData.data[key]);
                }
            });

            console.log('💾 Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            return false;
        }
    }

    // Storage statistics
    getStorageStats() {
        if (!this.isAvailable) {
            return { available: false };
        }

        try {
            const keys = Object.keys(localStorage);
            const appKeys = keys.filter(key => key.startsWith(this.storagePrefix));
            
            let totalSize = 0;
            const itemCounts = {};

            appKeys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    totalSize += value.length;
                    
                    // Categorize by key prefix
                    const shortKey = key.replace(this.storagePrefix, '');
                    const category = shortKey.split('_')[0];
                    itemCounts[category] = (itemCounts[category] || 0) + 1;
                }
            });

            return {
                available: true,
                totalItems: appKeys.length,
                totalSize: totalSize,
                totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
                itemCounts,
                usage: this.getStorageUsage()
            };
        } catch (error) {
            console.error('❌ Failed to get storage stats:', error);
            return { available: false, error: error.message };
        }
    }

    getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length;
                }
            }
            
            // Estimate quota (varies by browser, typically 5-10MB)
            const estimatedQuota = 5 * 1024 * 1024; // 5MB
            const usagePercent = Math.round((total / estimatedQuota) * 100);
            
            return {
                used: total,
                usedKB: Math.round(total / 1024 * 100) / 100,
                estimatedQuota,
                usagePercent: Math.min(usagePercent, 100)
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    // Cleanup old data
    cleanupOldData() {
        if (!this.isAvailable) return;

        try {
            const keys = Object.keys(localStorage);
            let cleanedCount = 0;

            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        try {
                            const data = JSON.parse(stored);
                            
                            // Remove expired items
                            if (data.expires && Date.now() > data.expires) {
                                localStorage.removeItem(key);
                                cleanedCount++;
                            }
                            
                            // Remove items older than 90 days
                            const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
                            if (data.timestamp && data.timestamp < ninetyDaysAgo) {
                                localStorage.removeItem(key);
                                cleanedCount++;
                            }
                        } catch (parseError) {
                            // Remove corrupted items
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    }
                }
            });

            if (cleanedCount > 0) {
                console.log(`💾 Cleaned up ${cleanedCount} old storage items`);
            }
        } catch (error) {
            console.error('❌ Failed to cleanup old data:', error);
        }
    }

    // Check if storage is nearly full
    isStorageNearlyFull(threshold = 80) {
        const usage = this.getStorageUsage();
        return usage.usagePercent && usage.usagePercent > threshold;
    }

    // Storage event handling for cross-tab synchronization
    setupStorageSync() {
        if (!this.isAvailable) return;

        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith(this.storagePrefix)) {
                const shortKey = event.key.replace(this.storagePrefix, '');
                
                // Emit storage change event
                if (window.EventBus) {
                    window.EventBus.emit('storage:changed', {
                        key: shortKey,
                        oldValue: event.oldValue,
                        newValue: event.newValue,
                        storageArea: event.storageArea
                    });
                }
            }
        });

        console.log('💾 Storage synchronization enabled');
    }
}

// Create global instance
window.StorageService = new StorageService();

// Auto-initialize when app is ready
if (window.EventBus) {
    window.EventBus.on('app:ready', () => {
        window.StorageService.init();
        window.StorageService.setupStorageSync();
    });
}

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageService;
}
