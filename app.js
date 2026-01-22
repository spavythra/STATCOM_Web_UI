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
 */
(function() {
    'use strict';

    // Module data structure with 13 modules
    const modules = [
        { id: 'pump1', name: 'Pump1' },
        { id: 'pump2', name: 'Pump2' },
        { id: 'pump3', name: 'Pump3' },
        { id: 'pump4', name: 'Pump4' },
        { id: 'valveA', name: 'ValveA' },
        { id: 'valveB', name: 'ValveB' },
        { id: 'valveC', name: 'ValveC' },
        { id: 'valveD', name: 'ValveD' },
        { id: 'sensorTemp', name: 'SensorTemp' },
        { id: 'sensorPress', name: 'SensorPress' },
        { id: 'cpu', name: 'CPU' },
        { id: 'mem', name: 'Mem' },
        { id: 'disk', name: 'Disk' }
    ];

    // Status indicators for each module
    const statusTypes = [
        { id: 'gatingOk', name: 'Gating OK' },
        { id: 'overtemp', name: 'Overtemp' },
        { id: 'commLost', name: 'Comm Lost' },
        { id: 'powerSupplyError', name: 'Power Supply Error' },
        { id: 'fanFail', name: 'Fan Fail' },
        { id: 'vdcFault', name: 'Vdc Fault' },
        { id: 'syncFault', name: 'Sync Fault' },
        { id: 'interlock', name: 'Interlock' },
        { id: 'voltageLevel', name: 'Voltage Level' },
        { id: 'currentLevel', name: 'Current Level' },
        { id: 'thermalStatus', name: 'Thermal Status' },
        { id: 'selfTest', name: 'Self Test' }
    ];

    // Status values
    const statusValues = {
        OK: { label: 'OK', class: 'status-ok' },
        FAILED: { label: 'FAILED', class: 'status-error' },
        WARNING: { label: 'WARNING', class: 'status-warning' },
        CAUTION: { label: 'CAUTION', class: 'status-caution' }
    };

    // Generate mock data for modules with realistic statuses
    function generateModuleData() {
        const moduleData = {};
        
        modules.forEach((module, moduleIndex) => {
            const statuses = {};
            
            statusTypes.forEach((statusType, statusIndex) => {
                // Generate realistic status distribution
                // Most statuses should be OK, with some warnings and errors for demonstration
                let status;
                const rand = Math.random();
                
                // Special cases for specific modules/statuses to show variety
                if (module.id === 'pump2' && statusType.id === 'overtemp') {
                    status = 'WARNING';
                } else if (module.id === 'valveC' && statusType.id === 'commLost') {
                    status = 'FAILED';
                } else if (module.id === 'cpu' && statusType.id === 'thermalStatus') {
                    status = 'CAUTION';
                } else if (module.id === 'disk' && statusType.id === 'voltageLevel') {
                    status = 'WARNING';
                } else if (module.id === 'sensorPress' && statusType.id === 'powerSupplyError') {
                    status = 'FAILED';
                } else {
                    // Random distribution with high probability of OK status
                    if (rand < 0.85) {
                        status = 'OK';
                    } else if (rand < 0.92) {
                        status = 'CAUTION';
                    } else if (rand < 0.97) {
                        status = 'WARNING';
                    } else {
                        status = 'FAILED';
                    }
                }
                
                statuses[statusType.id] = status;
            });
            
            moduleData[module.id] = statuses;
        });
        
        return moduleData;
    }

    // Calculate overall module status based on individual statuses
    function getOverallModuleStatus(moduleStatuses) {
        const statusPriority = { FAILED: 4, WARNING: 3, CAUTION: 2, OK: 1 };
        let highestPriority = 0;
        let overallStatus = 'OK';
        
        Object.values(moduleStatuses).forEach(status => {
            if (statusPriority[status] > highestPriority) {
                highestPriority = statusPriority[status];
                overallStatus = status;
            }
        });
        
        return overallStatus;
    }

    // Store module data
    let moduleData = {};
    let selectedModuleId = null;

    /**
     * Initialize Module Overview
     */
    function initModuleOverview() {
        // Generate module data
        moduleData = generateModuleData();
        
        // Render module grid
        renderModuleGrid();
        
        // Set up event delegation for module selection
        const moduleGrid = document.getElementById('module-grid');
        if (moduleGrid) {
            moduleGrid.addEventListener('click', handleModuleClick);
        }
    }

    /**
     * Render the module grid
     */
    function renderModuleGrid() {
        const moduleGrid = document.getElementById('module-grid');
        if (!moduleGrid) return;
        
        moduleGrid.innerHTML = '';
        
        modules.forEach(module => {
            const moduleStatuses = moduleData[module.id];
            const overallStatus = getOverallModuleStatus(moduleStatuses);
            const statusClass = statusValues[overallStatus].class;
            
            const moduleTile = document.createElement('div');
            moduleTile.className = 'module-tile';
            moduleTile.dataset.moduleId = module.id;
            
            moduleTile.innerHTML = `
                <div class="module-tile-header">
                    <div class="module-name">${module.name}</div>
                    <div class="module-status-indicator ${statusClass}"></div>
                </div>
            `;
            
            moduleGrid.appendChild(moduleTile);
        });
    }

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

    /**
     * Render the detail panel for a selected module
     */
    function renderDetailPanel(moduleId) {
        const detailPanel = document.getElementById('module-detail-panel');
        if (!detailPanel) return;
        
        const module = modules.find(m => m.id === moduleId);
        if (!module) return;
        
        const moduleStatuses = moduleData[moduleId];
        
        let statusIndicatorsHtml = '';
        statusTypes.forEach(statusType => {
            const status = moduleStatuses[statusType.id];
            const statusInfo = statusValues[status];
            
            statusIndicatorsHtml += `
                <div class="status-indicator-item ${statusInfo.class}">
                    <span class="status-indicator-name">${statusType.name}</span>
                    <span class="status-indicator-badge">${statusInfo.label}</span>
                </div>
            `;
        });
        
        detailPanel.innerHTML = `
            <div class="detail-header">
                <h3>Module ${module.name}</h3>
                <p>Status Indicators</p>
            </div>
            <div class="status-indicators">
                ${statusIndicatorsHtml}
            </div>
        `;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModuleOverview);
    } else {
        initModuleOverview();
    }

})();
