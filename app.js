/**
 * STATCOM Dashboard Router
 * Vanilla JavaScript client-side router with hash-based navigation
 */

(function() {
    'use strict';

    // Router configuration
    const routes = {
        '/config': 'view-config',
        '/module-overview': 'view-module-overview',
        '/diagnostics': 'view-diagnostics',
        '/trends': 'view-trends',
        '/alarms': 'view-alarms'
    };

    const defaultRoute = '/config';

    /**
     * Initialize the router
     */
    function initRouter() {
        // Set up event listeners
        window.addEventListener('hashchange', handleRouteChange);
        window.addEventListener('DOMContentLoaded', handleRouteChange);
        
        // Set up navigation click handlers
        setupNavigation();
        
        // Handle initial route
        handleRouteChange();
    }

    /**
     * Handle route changes
     */
    function handleRouteChange() {
        // Get the current hash (e.g., #/config)
        let hash = window.location.hash;
        
        // Remove the # symbol
        let route = hash.replace('#', '') || defaultRoute;
        
        // If route doesn't start with /, add it
        if (!route.startsWith('/')) {
            route = '/' + route;
        }
        
        // Navigate to the route
        navigateToRoute(route);
    }

    /**
     * Navigate to a specific route
     * @param {string} route - The route to navigate to
     */
    function navigateToRoute(route) {
        // Check if route exists
        let viewId = routes[route];
        
        if (!viewId) {
            // If route doesn't exist, redirect to default (with safety check)
            if (routes[defaultRoute]) {
                window.location.hash = '#' + defaultRoute;
            } else {
                // Fallback: show first available route
                const firstRoute = Object.keys(routes)[0];
                if (firstRoute) {
                    window.location.hash = '#' + firstRoute;
                }
            }
            return;
        }
        
        // Hide all views
        const allViews = document.querySelectorAll('.view');
        allViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show the selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update active navigation item
        updateActiveNavItem(route);
    }

    /**
     * Update the active state of navigation items
     * @param {string} route - The current active route
     */
    function updateActiveNavItem(route) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to the current nav item
        const activeNavItem = document.querySelector(`.nav-item[data-route="${route}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    /**
     * Set up navigation click handlers
     */
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Prevent default anchor behavior
                e.preventDefault();
                
                // Get the route from the href attribute
                const href = this.getAttribute('href');
                
                // Update the URL hash
                window.location.hash = href;
            });
        });
    }

    // Initialize the router when the script loads
    initRouter();

})();

/**
 * Module Overview Implementation
 * Extensible, data-driven architecture for monitoring module statuses
 */
(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION CONSTANTS - Easy to modify for future extensibility
    // ============================================================================
    
    /**
     * Grid size configuration
     * Change this to create different grid sizes (e.g., 10 for 10x10 grid)
     */
    const GRID_SIZE = 8; // 8x8 = 64 modules
    const TOTAL_MODULES = GRID_SIZE * GRID_SIZE;
    
    /**
     * Status types - Easy to extend by adding more status types
     * Each module will have all these status indicators
     */
    const STATUS_TYPES = [
        'Gating OK',
        'Overtemp',
        'Comm Lost',
        'Power Supply Error',
        'Fan Fail',
        'Vdc Fault',
        'Sync Fault',
        'Interlock',
        'Voltage Level',
        'Current Level',
        'Thermal Status',
        'Self Test'
    ];
    
    /**
     * Status values and their display properties
     * Priority: CRITICAL > WARNING > DEGRADED > OK
     */
    const STATUS_VALUES = {
        OK: { 
            label: 'OK', 
            class: 'status-ok',
            priority: 1,
            color: '#2d5f4d'
        },
        DEGRADED: { 
            label: 'DEGRADED', 
            class: 'status-degraded',
            priority: 2,
            color: '#d4a850'
        },
        WARNING: { 
            label: 'WARNING', 
            class: 'status-warning',
            priority: 3,
            color: '#e67e50'
        },
        CRITICAL: { 
            label: 'CRITICAL', 
            class: 'status-critical',
            priority: 4,
            color: '#c84848'
        }
    };

    // ============================================================================
    // DATA STRUCTURES
    // ============================================================================
    
    /**
     * Generate module list based on grid size
     * Modules are named M001, M002, ..., M064 (or up to TOTAL_MODULES)
     */
    function generateModules() {
        const modules = [];
        for (let i = 1; i <= TOTAL_MODULES; i++) {
            const moduleNumber = String(i).padStart(3, '0');
            modules.push({
                id: `M${moduleNumber}`,
                name: `M${i}`,
                displayName: `M${moduleNumber}`
            });
        }
        return modules;
    }
    
    const modules = generateModules();

    /**
     * Generate realistic mock data for all modules
     * Distribution: ~50-55 green (OK), ~4-6 red (CRITICAL), ~3-5 orange (WARNING), ~2-4 yellow (DEGRADED)
     */
    function generateModuleData() {
        const moduleData = {};
        
        // Define which modules should have errors/warnings for demonstration
        // These specific modules will show different error states
        const criticalModules = [7, 15, 23, 38, 47, 59]; // 6 modules with critical errors
        const warningModules = [3, 12, 29, 41, 53]; // 5 modules with warnings
        const degradedModules = [5, 19, 35]; // 3 modules with degraded status
        
        modules.forEach((module, moduleIndex) => {
            const statuses = {};
            const moduleNum = moduleIndex + 1;
            
            // Determine if this module has any issues
            const hasCritical = criticalModules.includes(moduleNum);
            const hasWarning = warningModules.includes(moduleNum);
            const hasDegraded = degradedModules.includes(moduleNum);
            
            STATUS_TYPES.forEach((statusType, statusIndex) => {
                let status = 'OK'; // Default to OK
                
                // Assign specific errors to specific modules for realistic demonstration
                // Using modulo to distribute errors across different status types within a module
                if (hasCritical) {
                    // Give critical modules 1-2 critical statuses
                    // The modulo operation ensures different status types fail for different modules
                    if (statusIndex === (moduleNum % STATUS_TYPES.length) || 
                        statusIndex === ((moduleNum + 1) % STATUS_TYPES.length)) {
                        status = 'CRITICAL';
                    }
                } else if (hasWarning) {
                    // Give warning modules 1 warning status
                    // Using modulo ensures each warning module fails on a different status type
                    if (statusIndex === (moduleNum % STATUS_TYPES.length)) {
                        status = 'WARNING';
                    }
                } else if (hasDegraded) {
                    // Give degraded modules 1 degraded status
                    // Using modulo ensures each degraded module fails on a different status type
                    if (statusIndex === (moduleNum % STATUS_TYPES.length)) {
                        status = 'DEGRADED';
                    }
                }
                
                statuses[statusType] = status;
            });
            
            moduleData[module.id] = statuses;
        });
        
        return moduleData;
    }

    /**
     * Calculate aggregate/overall module status based on worst individual status
     * 
     * This function ensures data consistency between module tile colors and their detail panel statuses.
     * The tile color MUST accurately reflect the worst status among all 12 status indicators.
     * 
     * Priority hierarchy (worst to best):
     *   CRITICAL (priority 4, red)    - Most severe, requires immediate attention
     *   WARNING  (priority 3, orange) - Attention needed
     *   DEGRADED (priority 2, yellow) - Performance degraded but operational
     *   OK       (priority 1, green)  - Normal operation
     * 
     * Algorithm:
     *   1. Start with OK status (lowest priority)
     *   2. Iterate through all 12 status indicators
     *   3. Track the status with highest priority number
     *   4. Return the worst status found
     * 
     * This ensures the module tile color always reflects the worst-case scenario,
     * maintaining consistency with the detail panel display.
     * 
     * @param {Object} moduleStatuses - Object containing all 12 status types and their values
     * @returns {string} The worst status value ('OK', 'DEGRADED', 'WARNING', or 'CRITICAL')
     */
    function getAggregateModuleStatus(moduleStatuses) {
        let worstStatus = 'OK';
        let highestPriority = 0;
        
        // Iterate through all status indicators to find the worst one
        Object.values(moduleStatuses).forEach(status => {
            const statusPriority = STATUS_VALUES[status].priority;
            if (statusPriority > highestPriority) {
                highestPriority = statusPriority;
                worstStatus = status;
            }
        });
        
        return worstStatus;
    }

    /**
     * Validate module data consistency
     * 
     * Checks that each module's tile color correctly reflects its worst status indicator.
     * Logs warnings to console if any inconsistencies are detected.
     * 
     * @param {Object} moduleData - The complete module data object
     * @returns {Array} Array of inconsistency reports (empty if all consistent)
     */
    function validateModuleConsistency(moduleData) {
        const inconsistencies = [];
        
        modules.forEach(module => {
            const moduleStatuses = moduleData[module.id];
            const calculatedStatus = getAggregateModuleStatus(moduleStatuses);
            
            // Count statuses by type for detailed reporting
            const statusCounts = { OK: 0, DEGRADED: 0, WARNING: 0, CRITICAL: 0 };
            Object.entries(moduleStatuses).forEach(([statusType, status]) => {
                statusCounts[status]++;
            });
            
            // Verify that the calculated aggregate matches what would be displayed
            const tile = document.querySelector(`[data-module-id="${module.id}"]`);
            if (tile) {
                let displayedStatus = 'OK';
                if (tile.classList.contains('status-critical')) displayedStatus = 'CRITICAL';
                else if (tile.classList.contains('status-warning')) displayedStatus = 'WARNING';
                else if (tile.classList.contains('status-degraded')) displayedStatus = 'DEGRADED';
                
                if (displayedStatus !== calculatedStatus) {
                    const issue = {
                        moduleId: module.id,
                        expected: calculatedStatus,
                        displayed: displayedStatus,
                        statusCounts: statusCounts,
                        message: `Module ${module.id}: Tile shows ${displayedStatus} but should show ${calculatedStatus}`
                    };
                    inconsistencies.push(issue);
                    console.warn('⚠️ Data Inconsistency Detected:', issue);
                }
            }
        });
        
        if (inconsistencies.length === 0) {
            console.log('✅ All modules validated: No data inconsistencies detected');
        } else {
            console.error(`❌ Found ${inconsistencies.length} data inconsistencies`);
        }
        
        return inconsistencies;
    }

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    
    let moduleData = {};
    let selectedModuleId = null;

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    /**
     * Initialize Module Overview
     */
    function initModuleOverview() {
        // Generate module data
        moduleData = generateModuleData();
        
        // Render module grid
        renderModuleGrid();
        
        // Render initial status legend
        renderStatusLegend();
        
        // Set up event delegation for module selection
        const moduleGrid = document.getElementById('module-grid');
        if (moduleGrid) {
            moduleGrid.addEventListener('click', handleModuleClick);
        }
        
        // Validate data consistency after initial render
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
            console.log('🔍 Running module data consistency validation...');
            validateModuleConsistency(moduleData);
        }, 100);
    }

    // ============================================================================
    // RENDERING FUNCTIONS
    // ============================================================================
    
    /**
     * Render the module grid
     * Creates a dynamic grid based on GRID_SIZE configuration
     */
    function renderModuleGrid() {
        const moduleGrid = document.getElementById('module-grid');
        if (!moduleGrid) return;
        
        // Set CSS Grid columns based on GRID_SIZE
        moduleGrid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
        
        moduleGrid.innerHTML = '';
        
        modules.forEach(module => {
            const moduleStatuses = moduleData[module.id];
            const aggregateStatus = getAggregateModuleStatus(moduleStatuses);
            const statusInfo = STATUS_VALUES[aggregateStatus];
            
            const moduleTile = document.createElement('div');
            moduleTile.className = `module-tile ${statusInfo.class}`;
            moduleTile.dataset.moduleId = module.id;
            
            moduleTile.innerHTML = `
                <div class="module-name">${module.name}</div>
            `;
            
            moduleGrid.appendChild(moduleTile);
        });
    }

    /**
     * Render status legend in the detail panel
     * Shown when no module is selected
     */
    function renderStatusLegend() {
        const detailPanel = document.getElementById('module-detail-panel');
        if (!detailPanel) return;
        
        // Create example status mapping for legend demonstration
        // Shows variety of statuses: OK, CRITICAL, DEGRADED, WARNING
        const exampleStatuses = ['OK', 'CRITICAL', 'DEGRADED', 'OK', 'WARNING'];
        
        let statusTypesHtml = '';
        STATUS_TYPES.forEach((statusType, index) => {
            // Cycle through example statuses to show variety in legend
            const exampleStatus = exampleStatuses[index % exampleStatuses.length];
            const statusInfo = STATUS_VALUES[exampleStatus];
            
            statusTypesHtml += `
                <div class="legend-item">
                    <span class="legend-status ${statusInfo.class}"></span>
                    <span class="legend-name">${statusType}</span>
                    <span class="legend-label">${statusInfo.label}</span>
                </div>
            `;
        });
        
        detailPanel.innerHTML = `
            <div class="detail-header">
                <h3>Status Legend</h3>
                <p>12 Status Indicators per Module</p>
            </div>
            <div class="legend-container">
                ${statusTypesHtml}
            </div>
            <div class="legend-footer">
                <h4>Color Meanings:</h4>
                <div class="color-meanings">
                    <div class="color-meaning">
                        <span class="color-box status-ok"></span>
                        <span>Green = OK/Normal</span>
                    </div>
                    <div class="color-meaning">
                        <span class="color-box status-critical"></span>
                        <span>Red = Critical Error</span>
                    </div>
                    <div class="color-meaning">
                        <span class="color-box status-warning"></span>
                        <span>Orange = Warning</span>
                    </div>
                    <div class="color-meaning">
                        <span class="color-box status-degraded"></span>
                        <span>Yellow = Degraded</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the detail panel for a selected module
     * Shows all 12 status indicators as colored cards
     */
    function renderDetailPanel(moduleId) {
        const detailPanel = document.getElementById('module-detail-panel');
        if (!detailPanel) return;
        
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;
        
        const moduleStatuses = moduleData[moduleId];
        
        let statusIndicatorsHtml = '';
        STATUS_TYPES.forEach(statusType => {
            const status = moduleStatuses[statusType];
            const statusInfo = STATUS_VALUES[status];
            
            statusIndicatorsHtml += `
                <div class="status-card ${statusInfo.class}">
                    <span class="status-card-name">${statusType}</span>
                    <span class="status-card-badge">${statusInfo.label}</span>
                </div>
            `;
        });
        
        detailPanel.innerHTML = `
            <div class="detail-header">
                <h3>Module ${module.displayName}</h3>
                <p>Status Indicators</p>
            </div>
            <div class="status-cards-container">
                ${statusIndicatorsHtml}
            </div>
        `;
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    /**
     * Handle module tile click
     */
    function handleModuleClick(event) {
        const moduleTile = event.target.closest('.module-tile');
        if (!moduleTile) return;
        
        const moduleId = moduleTile.dataset.moduleId;
        
        // Update selected module
        selectedModuleId = moduleId;
        
        // Update UI
        updateSelectedModule(moduleId);
        renderDetailPanel(moduleId);
    }

    /**
     * Update selected module visual state
     */
    function updateSelectedModule(moduleId) {
        const allTiles = document.querySelectorAll('.module-tile');
        allTiles.forEach(tile => {
            tile.classList.remove('selected');
        });
        
        const selectedTile = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (selectedTile) {
            selectedTile.classList.add('selected');
        }
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModuleOverview);
    } else {
        initModuleOverview();
    }
    
    // ============================================================================
    // GLOBAL API - Expose validation for testing and debugging
    // ============================================================================
    
    // Make validation and inspection functions available globally for manual testing
    window.STATCOM = window.STATCOM || {};
    window.STATCOM.validateModules = function() {
        console.log('🔍 Running manual module validation...');
        return validateModuleConsistency(moduleData);
    };
    window.STATCOM.getModuleData = function(moduleId) {
        if (moduleId) {
            return moduleData[moduleId];
        }
        return moduleData;
    };
    window.STATCOM.getModuleStatus = function(moduleId) {
        if (!moduleData[moduleId]) {
            console.error(`Module ${moduleId} not found`);
            return null;
        }
        const statuses = moduleData[moduleId];
        const aggregate = getAggregateModuleStatus(statuses);
        return {
            moduleId: moduleId,
            aggregateStatus: aggregate,
            individualStatuses: statuses
        };
    };

})();
