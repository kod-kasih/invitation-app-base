// YAML Configuration Service
// This service loads and parses YAML configuration files
class YamlConfigService {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load YAML configuration from the specified file
     * @param {string} yamlPath - Path to the YAML configuration file
     * @returns {Promise<Object>} Parsed configuration object
     */
    async loadConfig(yamlPath = 'config.yaml') {
        // Return existing promise if already loading
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Return cached config if already loaded
        if (this.isLoaded && this.config) {
            return this.config;
        }

        this.loadPromise = this._fetchAndParseYaml(yamlPath);
        
        try {
            this.config = await this.loadPromise;
            this.isLoaded = true;
            console.log('✅ YAML configuration loaded successfully');
            return this.config;
        } catch (error) {
            console.error('❌ Failed to load YAML configuration:', error);
            this.loadPromise = null;
            throw error;
        }
    }

    /**
     * Get the current configuration
     * @returns {Object|null} Current configuration or null if not loaded
     */
    getConfig() {
        return this.config;
    }

    /**
     * Check if configuration is loaded
     * @returns {boolean} True if configuration is loaded
     */
    isConfigLoaded() {
        return this.isLoaded && this.config !== null;
    }

    /**
     * Get a specific configuration value by path with intelligent fallbacks
     * @param {string} path - Dot-separated path to the configuration value
     * @param {*} fallback - Fallback value if path is not found
     * @returns {*} Configuration value, fallback, or user-friendly default
     */
    get(path, fallback = null) {
        if (!this.config) {
            return this._getGracefulFallback(path, fallback);
        }

        const keys = path.split('.');
        let current = this.config;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return this._getGracefulFallback(path, fallback);
            }
        }

        // Return empty string for missing text content instead of null
        if (current === null || current === undefined) {
            return this._getGracefulFallback(path, fallback);
        }

        return current;
    }

    /**
     * Provide graceful fallbacks for missing configuration values
     * @private
     * @param {string} path - Configuration path
     * @param {*} fallback - Provided fallback
     * @returns {*} User-friendly fallback value
     */
    _getGracefulFallback(path, fallback) {
        // If explicit fallback provided, use it
        if (fallback !== null) {
            return fallback;
        }

        // Provide contextual defaults based on path
        const pathLower = path.toLowerCase();
        
        if (pathLower.includes('title')) {
            return "Event Title - Please Update Config";
        }
        if (pathLower.includes('subtitle')) {
            return "Please update your event details in config.yaml";
        }
        if (pathLower.includes('date')) {
            return "Date TBD - Please Update Config";
        }
        if (pathLower.includes('location')) {
            return "Location TBD - Please Update Config";
        }
        if (pathLower.includes('name')) {
            return "Name TBD";
        }
        if (pathLower.includes('email')) {
            return "email@example.com";
        }
        if (pathLower.includes('phone')) {
            return "+1 (555) 000-0000";
        }
        if (pathLower.includes('dresscode')) {
            return "Dress code TBD";
        }
        if (pathLower.includes('dining')) {
            return "Dining details TBD";
        }
        if (pathLower.includes('heroimage')) {
            return "placeholder-hero.svg";
        }

        // Default fallback
        return "Please update config.yaml";
    }

    /**
     * Merge YAML configuration with JavaScript configuration
     * @param {Object} jsConfig - JavaScript configuration object
     * @returns {Object} Merged configuration
     */
    mergeWithJsConfig(jsConfig) {
        if (!this.config) {
            return jsConfig;
        }

        return this._deepMerge(jsConfig, this.config);
    }

    /**
     * Fetch and parse YAML file
     * @private
     * @param {string} yamlPath - Path to YAML file
     * @returns {Promise<Object>} Parsed YAML object
     */
    async _fetchAndParseYaml(yamlPath) {
        try {
            // Fetch the YAML file
            const response = await fetch(yamlPath);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch YAML file: ${response.status} ${response.statusText}`);
            }

            const yamlText = await response.text();

            // Check if jsyaml is available
            if (typeof jsyaml === 'undefined') {
                throw new Error('js-yaml library is not loaded. Please include js-yaml library.');
            }

            // Parse YAML
            const parsedConfig = jsyaml.load(yamlText);
            
            if (!parsedConfig || typeof parsedConfig !== 'object') {
                throw new Error('Invalid YAML configuration: Expected an object');
            }

            return parsedConfig;

        } catch (error) {
            if (error.name === 'YAMLException') {
                throw new Error(`YAML parsing error: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Deep merge two objects
     * @private
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    _deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (
                    source[key] && 
                    typeof source[key] === 'object' && 
                    !Array.isArray(source[key]) &&
                    result[key] && 
                    typeof result[key] === 'object' && 
                    !Array.isArray(result[key])
                ) {
                    // Recursively merge nested objects
                    result[key] = this._deepMerge(result[key], source[key]);
                } else {
                    // Override with source value
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * Validate required configuration fields
     * @param {Array<string>} requiredFields - Array of required field paths
     * @returns {Array<string>} Array of missing fields
     */
    validateConfig(requiredFields = []) {
        const missingFields = [];

        for (const field of requiredFields) {
            if (this.get(field) === null) {
                missingFields.push(field);
            }
        }

        return missingFields;
    }

    /**
     * Reload configuration from YAML file
     * @param {string} yamlPath - Path to YAML file
     * @returns {Promise<Object>} New configuration
     */
    async reloadConfig(yamlPath = 'config.yaml') {
        this.config = null;
        this.isLoaded = false;
        this.loadPromise = null;
        
        return this.loadConfig(yamlPath);
    }
}

// Export for use in other modules
window.YamlConfigService = YamlConfigService;
