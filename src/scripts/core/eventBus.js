// Event Bus Module - Handles communication between components
class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
        this.maxListeners = 100;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
        this.clear = this.clear.bind(this);
    }

    init() {
        console.log('🚌 EventBus initialized');
        
        // Setup default event handlers
        this.setupDefaultHandlers();
    }

    setupDefaultHandlers() {
        // Handle app-level events
        this.on('app:ready', () => {
            console.log('🎉 Application is ready');
        });

        this.on('app:error', (data) => {
            console.error('💥 Application error:', data);
        });

        // Handle navigation events
        this.on('navigation:change', (data) => {
            console.log('🧭 Navigation changed to:', data.section);
        });

        // Handle form events
        this.on('form:submit', (data) => {
            console.log('📋 Form submitted:', data.formType);
        });

        this.on('form:success', (data) => {
            console.log('✅ Form submission successful:', data.formType);
        });

        this.on('form:error', (data) => {
            console.log('❌ Form submission failed:', data.formType, data.error);
        });
    }

    /**
     * Subscribe to an event
     * @param {string} eventType - The event type to listen for
     * @param {function} callback - The callback function to execute
     * @param {object} options - Optional configuration
     */
    on(eventType, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        if (!this.events.has(eventType)) {
            this.events.set(eventType, []);
        }

        const listeners = this.events.get(eventType);
        
        // Check max listeners
        if (listeners.length >= this.maxListeners) {
            console.warn(`⚠️ Maximum listeners (${this.maxListeners}) exceeded for event: ${eventType}`);
        }

        const listener = {
            callback,
            options,
            id: this.generateId()
        };

        listeners.push(listener);
        
        // Return unsubscribe function
        return () => this.off(eventType, listener.id);
    }

    /**
     * Subscribe to an event once
     * @param {string} eventType - The event type to listen for
     * @param {function} callback - The callback function to execute
     */
    once(eventType, callback) {
        return new Promise((resolve) => {
            const unsubscribe = this.on(eventType, (data) => {
                unsubscribe();
                if (callback) callback(data);
                resolve(data);
            });
        });
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventType - The event type
     * @param {string|function} callbackOrId - The callback function or listener ID
     */
    off(eventType, callbackOrId) {
        if (!this.events.has(eventType)) {
            return false;
        }

        const listeners = this.events.get(eventType);
        let index = -1;

        if (typeof callbackOrId === 'string') {
            // Remove by ID
            index = listeners.findIndex(listener => listener.id === callbackOrId);
        } else if (typeof callbackOrId === 'function') {
            // Remove by callback reference
            index = listeners.findIndex(listener => listener.callback === callbackOrId);
        }

        if (index > -1) {
            listeners.splice(index, 1);
            
            // Clean up empty event arrays
            if (listeners.length === 0) {
                this.events.delete(eventType);
            }
            
            return true;
        }

        return false;
    }

    /**
     * Emit an event
     * @param {string} eventType - The event type to emit
     * @param {*} data - The data to pass to listeners
     * @param {object} options - Optional configuration
     */
    emit(eventType, data = null, options = {}) {
        const { async = false, timeout = 5000 } = options;

        if (!this.events.has(eventType)) {
            // No listeners for this event
            return Promise.resolve([]);
        }

        const listeners = this.events.get(eventType);
        const results = [];

        if (async) {
            // Execute listeners asynchronously
            return Promise.all(
                listeners.map(async (listener) => {
                    try {
                        const result = await this.executeListener(listener, data, timeout);
                        results.push({ success: true, result });
                        return result;
                    } catch (error) {
                        console.error(`❌ Error in event listener for ${eventType}:`, error);
                        results.push({ success: false, error });
                        return null;
                    }
                })
            );
        } else {
            // Execute listeners synchronously
            listeners.forEach((listener) => {
                try {
                    const result = listener.callback(data);
                    results.push({ success: true, result });
                } catch (error) {
                    console.error(`❌ Error in event listener for ${eventType}:`, error);
                    results.push({ success: false, error });
                }
            });

            return Promise.resolve(results);
        }
    }

    /**
     * Execute a listener with timeout support
     * @param {object} listener - The listener object
     * @param {*} data - The data to pass
     * @param {number} timeout - Timeout in milliseconds
     */
    executeListener(listener, data, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Listener timeout after ${timeout}ms`));
            }, timeout);

            try {
                const result = listener.callback(data);
                
                if (result && typeof result.then === 'function') {
                    // Handle promise-based listeners
                    result
                        .then(resolve)
                        .catch(reject)
                        .finally(() => clearTimeout(timer));
                } else {
                    // Handle synchronous listeners
                    clearTimeout(timer);
                    resolve(result);
                }
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }

    /**
     * Get all event types
     */
    getEventTypes() {
        return Array.from(this.events.keys());
    }

    /**
     * Get listener count for an event type
     * @param {string} eventType - The event type
     */
    getListenerCount(eventType) {
        return this.events.has(eventType) ? this.events.get(eventType).length : 0;
    }

    /**
     * Get total listener count
     */
    getTotalListenerCount() {
        let total = 0;
        for (const listeners of this.events.values()) {
            total += listeners.length;
        }
        return total;
    }

    /**
     * Clear all listeners for an event type or all events
     * @param {string} eventType - Optional event type to clear
     */
    clear(eventType = null) {
        if (eventType) {
            this.events.delete(eventType);
            console.log(`🧹 Cleared listeners for event: ${eventType}`);
        } else {
            this.events.clear();
            console.log('🧹 Cleared all event listeners');
        }
    }

    /**
     * Generate a unique ID for listeners
     */
    generateId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debug method to log all events and listeners
     */
    debug() {
        console.group('🚌 EventBus Debug Information');
        console.log('Total Events:', this.events.size);
        console.log('Total Listeners:', this.getTotalListenerCount());
        
        for (const [eventType, listeners] of this.events.entries()) {
            console.group(`📢 Event: ${eventType}`);
            console.log('Listeners:', listeners.length);
            listeners.forEach((listener, index) => {
                console.log(`  ${index + 1}. ID: ${listener.id}`, listener.options);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
    }

    /**
     * Create a namespaced event bus
     * @param {string} namespace - The namespace prefix
     */
    createNamespace(namespace) {
        return {
            on: (eventType, callback, options) => this.on(`${namespace}:${eventType}`, callback, options),
            once: (eventType, callback) => this.once(`${namespace}:${eventType}`, callback),
            off: (eventType, callbackOrId) => this.off(`${namespace}:${eventType}`, callbackOrId),
            emit: (eventType, data, options) => this.emit(`${namespace}:${eventType}`, data, options),
            clear: (eventType) => this.clear(eventType ? `${namespace}:${eventType}` : null),
        };
    }
}

// Create global event bus instance
window.EventBus = new EventBus();

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}
