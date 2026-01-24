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
     * The 12 status indicators evaluated are:
     *   1. Gating OK         2. Overtemp           3. Comm Lost          4. Power Supply Error
     *   5. Fan Fail          6. Vdc Fault          7. Sync Fault         8. Interlock
     *   9. Voltage Level    10. Current Level     11. Thermal Status    12. Self Test
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
     * @param {Object} moduleData - The complete module data object containing status for all modules
     * @returns {Array} Array of inconsistency reports (empty if all consistent)
     */
    function validateModuleConsistency(moduleData) {
        const inconsistencies = [];

        // Iterate through all modules defined in the outer scope
        // 'modules' is accessible from the parent closure (defined at line 224)
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

/**
 * Trends Page Implementation
 * Interactive Chart.js visualizations for module data over time
 */
(function() {
    'use strict';

    // Chart instances
    let voltageChart = null;
    let currentChart = null;
    let temperatureChart = null;
    let powerFactorChart = null;

    // Current state
    let selectedModuleId = null;
    let currentTimeRange = '1h'; // '1h' or '24h'

    /**
     * Initialize Trends page
     */
    function initTrends() {
        // Populate module selector
        populateModuleSelector();

        // Set up event listeners
        setupEventListeners();

        // Initialize charts with default module (first module with issues)
        const defaultModule = getDefaultModule();
        if (defaultModule) {
            selectedModuleId = defaultModule;
            document.getElementById('module-selector').value = defaultModule;
            initializeCharts();
        }
    }

    /**
     * Show error message when Chart.js fails to load
     */
    function showChartLoadError() {
        const chartWrappers = document.querySelectorAll('.chart-wrapper');
        chartWrappers.forEach(wrapper => {
            wrapper.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #888; text-align: center; padding: 20px;">Chart.js library failed to load. Please check your internet connection.</div>';
        });
    }

    /**
     * Get default module to display (first module with issues, or M001)
     */
    function getDefaultModule() {
        // Get module data from the global STATCOM object
        const moduleData = window.STATCOM && window.STATCOM.getModuleData ? window.STATCOM.getModuleData() : {};

        // Find first module with non-OK status
        for (let i = 1; i <= 64; i++) {
            const moduleId = `M${String(i).padStart(3, '0')}`;
            const statuses = moduleData[moduleId];
            if (statuses) {
                const hasIssue = Object.values(statuses).some(status => status !== 'OK');
                if (hasIssue) {
                    return moduleId;
                }
            }
        }
        return 'M001'; // Default to first module
    }

    /**
     * Populate module selector dropdown
     */
    function populateModuleSelector() {
        const selector = document.getElementById('module-selector');
        if (!selector) return;

        selector.innerHTML = '';

        for (let i = 1; i <= 64; i++) {
            const moduleId = `M${String(i).padStart(3, '0')}`;
            const option = document.createElement('option');
            option.value = moduleId;
            option.textContent = moduleId;
            selector.appendChild(option);
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Module selector change
        const selector = document.getElementById('module-selector');
        if (selector) {
            selector.addEventListener('change', function() {
                selectedModuleId = this.value;
                updateCharts();
            });
        }

        // Time range buttons
        const timeRangeButtons = document.querySelectorAll('.time-range-btn');
        timeRangeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                timeRangeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Update time range and charts
                currentTimeRange = this.dataset.range;
                updateCharts();
            });
        });
    }

    /**
     * Initialize all charts
     */
    function initializeCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded. Charts will not be displayed.');
            showChartLoadError();
            return;
        }

        const chartConfig = getChartConfig();

        // Voltage Chart
        const voltageCtx = document.getElementById('voltage-chart');
        if (voltageCtx) {
            voltageChart = new Chart(voltageCtx, {
                ...chartConfig,
                data: generateTimeSeriesData('voltage')
            });
        }

        // Current Chart
        const currentCtx = document.getElementById('current-chart');
        if (currentCtx) {
            currentChart = new Chart(currentCtx, {
                ...chartConfig,
                data: generateTimeSeriesData('current')
            });
        }

        // Temperature Chart
        const temperatureCtx = document.getElementById('temperature-chart');
        if (temperatureCtx) {
            temperatureChart = new Chart(temperatureCtx, {
                ...chartConfig,
                data: generateTimeSeriesData('temperature')
            });
        }

        // Power Factor Chart
        const powerFactorCtx = document.getElementById('power-factor-chart');
        if (powerFactorCtx) {
            powerFactorChart = new Chart(powerFactorCtx, {
                ...chartConfig,
                data: generateTimeSeriesData('powerFactor')
            });
        }
    }

    /**
     * Update all charts with new data
     */
    function updateCharts() {
        if (voltageChart) {
            voltageChart.data = generateTimeSeriesData('voltage');
            voltageChart.update();
        }
        if (currentChart) {
            currentChart.data = generateTimeSeriesData('current');
            currentChart.update();
        }
        if (temperatureChart) {
            temperatureChart.data = generateTimeSeriesData('temperature');
            temperatureChart.update();
        }
        if (powerFactorChart) {
            powerFactorChart.data = generateTimeSeriesData('powerFactor');
            powerFactorChart.update();
        }
    }

    /**
     * Get base chart configuration
     */
    function getChartConfig() {
        return {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(26, 35, 50, 0.95)',
                        titleColor: '#4a9eff',
                        bodyColor: '#e0e0e0',
                        borderColor: '#2a3f5f',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: '#2a3f5f',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#888',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: '#2a3f5f',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#888',
                            font: {
                                size: 11
                            }
                        },
                        // Auto-zoom: Automatically adjust Y-axis range based on data
                        beginAtZero: false,
                        grace: 0.05  // Add 5% padding above and below data range
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };
    }

    /**
     * Generate mock time-series data based on module status
     */
    function generateTimeSeriesData(dataType) {
        const numPoints = currentTimeRange === '1h' ? 12 : 24; // 5-min intervals for 1h, 1-hour intervals for 24h
        const labels = [];
        const values = [];

        // Get module data from the global STATCOM object
        const moduleData = window.STATCOM && window.STATCOM.getModuleData ? window.STATCOM.getModuleData() : {};

        // Get module status
        const statuses = moduleData[selectedModuleId] || {};

        // Determine status for this metric
        let status = 'OK';
        if (dataType === 'voltage') {
            status = statuses['Voltage Level'] || 'OK';
        } else if (dataType === 'current') {
            status = statuses['Current Level'] || 'OK';
        } else if (dataType === 'temperature') {
            status = statuses['Thermal Status'] || 'OK';
        } else if (dataType === 'powerFactor') {
            // Power factor is derived, use average of voltage and current
            const voltageStatus = statuses['Voltage Level'] || 'OK';
            const currentStatus = statuses['Current Level'] || 'OK';
            const priorities = { 'OK': 0, 'DEGRADED': 1, 'WARNING': 2, 'CRITICAL': 3 };
            status = priorities[voltageStatus] > priorities[currentStatus] ? voltageStatus : currentStatus;
        }

        // Base values and thresholds for each metric
        const metricConfig = {
            voltage: { base: 11.0, threshold: 11.5, unit: 'kV', variance: 0.1 },
            current: { base: 150, threshold: 180, unit: 'A', variance: 5 },
            temperature: { base: 45, threshold: 70, unit: '°C', variance: 2 },
            powerFactor: { base: 0.95, threshold: 0.80, unit: '', variance: 0.02 }  // Lower threshold for power factor degradation
        };

        const config = metricConfig[dataType];
        const now = new Date();

        for (let i = numPoints - 1; i >= 0; i--) {
            // Calculate timestamp
            const timeOffset = currentTimeRange === '1h' ? i * 5 : i * 60; // minutes
            const timestamp = new Date(now.getTime() - timeOffset * 60 * 1000);

            // Format label
            const label = currentTimeRange === '1h'
                ? timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
            labels.push(label);

            // Generate value based on status
            let value;
            if (status === 'OK') {
                // Stable values with minor fluctuations
                value = config.base + (Math.random() - 0.5) * config.variance;
            } else if (status === 'DEGRADED') {
                // Trending toward threshold
                const progress = i / numPoints;
                value = config.base + (config.threshold - config.base) * 0.6 * progress + (Math.random() - 0.5) * config.variance;
            } else if (status === 'WARNING') {
                // Close to threshold, fluctuating
                const progress = i / numPoints;
                value = config.base + (config.threshold - config.base) * 0.85 * progress + (Math.random() - 0.5) * config.variance * 2;
            } else if (status === 'CRITICAL') {
                // Exceeding threshold
                const progress = i / numPoints;
                value = config.threshold + (config.threshold - config.base) * 0.1 * progress + Math.random() * config.variance * 2;
            }

            // Round to appropriate precision
            value = dataType === 'powerFactor' ? Math.round(value * 100) / 100 : Math.round(value * 10) / 10;
            values.push(value);
        }

        // Determine line color based on status
        const statusColors = {
            'OK': '#2d5f4d',
            'DEGRADED': '#d4a850',
            'WARNING': '#e67e50',
            'CRITICAL': '#c84848'
        };

        return {
            labels: labels,
            datasets: [{
                label: `${selectedModuleId} - ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`,
                data: values,
                borderColor: statusColors[status],
                backgroundColor: statusColors[status] + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        };
    }

    // Initialize when DOM is ready and when navigating to trends page
    function setupTrendsInitialization() {
        const trendsView = document.getElementById('view-trends');
        if (!trendsView) return;

        // Check if trends view is currently active
        if (trendsView.classList.contains('active')) {
            if (!voltageChart) {
                initTrends();
            }
        }

        // Set up observer for future navigation to trends
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (trendsView.classList.contains('active')) {
                    if (!voltageChart) {
                        initTrends();
                    }
                }
            });
        });

        observer.observe(trendsView, { attributes: true, attributeFilter: ['class'] });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupTrendsInitialization);
    } else {
        setupTrendsInitialization();
    }

})();

/**
 * Alarms Page Implementation
 * Display active and cleared alarms with filtering and CSV export
 */
(function() {
    'use strict';

    // Constants
    const NOTIFICATION_DURATION_MS = 3000;
    const NOTIFICATION_FADEOUT_MS = 300;
    const MAX_DISPLAYED_CLEARED_ALARMS = 15;
    const DEFAULT_TIME_RANGE_HOURS = 24;

    let alarmsData = { active: [], cleared: [] };
    let filteredAlarmsData = { active: [], cleared: [] };
    let currentFilters = {
        severity: 'ALL',
        timeRange: '24h',
        module: 'ALL'
    };

    // Alarm message templates based on status type
    const ALARM_MESSAGES = {
        'Overtemp': 'Overtemp threshold exceeded',
        'Comm Lost': 'Communication timeout',
        'Voltage Level': 'Voltage out of range',
        'Fan Fail': 'Fan failure detected',
        'Power Supply Error': 'Power supply error',
        'Vdc Fault': 'DC voltage fault',
        'Current Level': 'Current level abnormal',
        'Thermal Status': 'Thermal status warning',
        'Gating OK': 'Gating signal error',
        'Sync Fault': 'Synchronization fault',
        'Interlock': 'Interlock triggered',
        'Self Test': 'Self test failure'
    };

    /**
     * Initialize Alarms page
     */
    function initAlarms() {
        // Populate module filter dropdown
        populateModuleFilter();

        // Generate alarm data from module statuses
        alarmsData = generateAlarmsFromModuleData();

        // Apply initial filters
        applyFilters();

        // Set up event listeners
        setupEventListeners();

        // Render alarms
        renderAlarms();
    }

    /**
     * Populate module filter dropdown
     */
    function populateModuleFilter() {
        const moduleFilter = document.getElementById('module-filter');
        if (!moduleFilter) return;

        // Keep "All Modules" option
        moduleFilter.innerHTML = '<option value="ALL">All Modules</option>';

        // Add individual modules
        for (let i = 1; i <= 64; i++) {
            const moduleId = `M${String(i).padStart(3, '0')}`;
            const option = document.createElement('option');
            option.value = moduleId;
            option.textContent = moduleId;
            moduleFilter.appendChild(option);
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Apply filters button
        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                currentFilters.severity = document.getElementById('severity-filter').value;
                currentFilters.timeRange = document.getElementById('time-range-filter').value;
                currentFilters.module = document.getElementById('module-filter').value;
                applyFilters();
                renderAlarms();
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                // Reset filter values
                document.getElementById('severity-filter').value = 'ALL';
                document.getElementById('time-range-filter').value = '24h';
                document.getElementById('module-filter').value = 'ALL';

                // Reset current filters
                currentFilters = {
                    severity: 'ALL',
                    timeRange: '24h',
                    module: 'ALL'
                };

                applyFilters();
                renderAlarms();
            });
        }

        // Export CSV button
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportToCSV);
        }
    }

    /**
     * Apply current filters to alarm data
     */
    function applyFilters() {
        const now = new Date();

        // Calculate time range cutoff
        let timeCutoff = null;
        if (currentFilters.timeRange !== 'all') {
            const hours = {
                '1h': 1,
                '6h': 6,
                '24h': DEFAULT_TIME_RANGE_HOURS,
                '7d': 168
            };
            const hoursAgo = hours[currentFilters.timeRange] || DEFAULT_TIME_RANGE_HOURS;
            timeCutoff = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        }

        // Filter active alarms
        filteredAlarmsData.active = alarmsData.active.filter(alarm => {
            // Severity filter
            if (currentFilters.severity !== 'ALL' && alarm.severity !== currentFilters.severity) {
                return false;
            }

            // Module filter
            if (currentFilters.module !== 'ALL' && alarm.moduleId !== currentFilters.module) {
                return false;
            }

            // Time range filter
            if (timeCutoff && alarm.activatedAt < timeCutoff) {
                return false;
            }

            return true;
        });

        // Filter cleared alarms
        filteredAlarmsData.cleared = alarmsData.cleared.filter(alarm => {
            // Severity filter
            if (currentFilters.severity !== 'ALL' && alarm.severity !== currentFilters.severity) {
                return false;
            }

            // Module filter
            if (currentFilters.module !== 'ALL' && alarm.moduleId !== currentFilters.module) {
                return false;
            }

            // Time range filter (based on cleared time)
            if (timeCutoff && alarm.clearedAt < timeCutoff) {
                return false;
            }

            return true;
        });
    }

    /**
     * Export alarms to CSV
     */
    function exportToCSV() {
        // Combine active and cleared alarms
        const allAlarms = [
            ...filteredAlarmsData.active.map(a => ({ ...a, status: 'Active', clearedAt: null })),
            ...filteredAlarmsData.cleared.map(a => ({ ...a, status: 'Cleared' }))
        ];

        if (allAlarms.length === 0) {
            showNotification('No alarms to export with current filters');
            return;
        }

        // CSV header
        let csv = 'Severity,Module,Status,Triggered Time,Cleared Time,Duration,Message\n';

        // CSV rows
        allAlarms.forEach(alarm => {
            const severity = escapeCSV(alarm.severity);
            const module = escapeCSV(alarm.moduleId);
            const status = escapeCSV(alarm.status);
            const triggeredTime = escapeCSV(formatTimestamp(alarm.activatedAt));
            const clearedTime = alarm.clearedAt ? escapeCSV(formatTimestamp(alarm.clearedAt)) : '';

            // Calculate duration for CSV export
            let duration = '';
            if (alarm.duration) {
                duration = escapeCSV(alarm.duration);
            } else if (alarm.status === 'Active') {
                duration = escapeCSV(getActiveDuration(alarm.activatedAt));
            }

            const message = escapeCSV(getAlarmMessage(alarm.type));

            csv += `${severity},${module},${status},${triggeredTime},${clearedTime},${duration},${message}\n`;
        });

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Generate timestamp for filename (format: YYYY-MM-DD_HH-MM-SS)
        // Removes milliseconds and 'Z' suffix by slicing off last 5 characters
        const timestamp = new Date().toISOString().replace('T', '_').replace(/[:.]/g, '-').slice(0, -5);
        const filename = `STATCOM_Alarms_${timestamp}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show success notification
        showNotification('CSV exported successfully!');
    }

    /**
     * Escape CSV field
     */
    function escapeCSV(field) {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    /**
     * Show notification message
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4a9eff;
            color: white;
            padding: 15px 25px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                try {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                } catch (error) {
                    // Notification may have been removed externally, safe to ignore
                    console.debug('Notification removal error (safe to ignore):', error);
                }
            }, NOTIFICATION_FADEOUT_MS);
        }, NOTIFICATION_DURATION_MS);
    }

    /**
     * Get alarm message based on status type
     */
    function getAlarmMessage(statusType) {
        return ALARM_MESSAGES[statusType] || statusType;
    }

    /**
     * Generate alarms from module status data
     */
    function generateAlarmsFromModuleData() {
        const activeAlarms = [];
        const clearedAlarms = [];
        const now = new Date();

        // Get module data from the global STATCOM object
        const moduleData = window.STATCOM && window.STATCOM.getModuleData ? window.STATCOM.getModuleData() : {};

        // Iterate through all modules
        for (let i = 1; i <= 64; i++) {
            const moduleId = `M${String(i).padStart(3, '0')}`;
            const statuses = moduleData[moduleId];

            if (!statuses) continue;

            // Check each status indicator
            Object.entries(statuses).forEach(([statusType, statusValue]) => {
                if (statusValue !== 'OK') {
                    // Generate alarm for non-OK status
                    const alarm = {
                        moduleId: moduleId,
                        type: statusType,
                        severity: statusValue,
                        activatedAt: new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000) // Random time in last 6 hours for active
                    };

                    // Randomly decide if alarm is cleared (40% probability when random > 0.6)
                    if (Math.random() > 0.6) {
                        // Cleared alarm (40% of alarms)
                        const activationTime = alarm.activatedAt.getTime();
                        const clearTime = activationTime + Math.random() * 4 * 60 * 60 * 1000; // Cleared within 4 hours

                        if (clearTime < now.getTime()) {
                            alarm.clearedAt = new Date(clearTime);
                            alarm.duration = formatDuration(clearTime - activationTime);
                            clearedAlarms.push(alarm);
                        } else {
                            activeAlarms.push(alarm);
                        }
                    } else {
                        // Active alarm (60% of alarms)
                        activeAlarms.push(alarm);
                    }
                }
            });
        }

        // Generate additional cleared alarms spanning 7 days for testing filters
        // Generate 20-30 additional cleared alarms
        const additionalClearedCount = 20 + Math.floor(Math.random() * 11); // 20-30
        const statusTypes = Object.keys(ALARM_MESSAGES);
        const severities = ['CRITICAL', 'WARNING', 'DEGRADED'];

        for (let i = 0; i < additionalClearedCount; i++) {
            const moduleNum = Math.floor(Math.random() * 64) + 1;
            const moduleId = `M${String(moduleNum).padStart(3, '0')}`;
            const statusType = statusTypes[Math.floor(Math.random() * statusTypes.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];

            // Random time within last 7 days
            const activatedAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const clearedAt = new Date(activatedAt.getTime() + Math.random() * 12 * 60 * 60 * 1000);

            // Only add if cleared time is in the past
            if (clearedAt < now) {
                const alarm = {
                    moduleId: moduleId,
                    type: statusType,
                    severity: severity,
                    activatedAt: activatedAt,
                    clearedAt: clearedAt,
                    duration: formatDuration(clearedAt.getTime() - activatedAt.getTime())
                };
                clearedAlarms.push(alarm);
            }
        }

        // Sort active alarms by severity (CRITICAL > WARNING > DEGRADED) then by time
        const severityPriority = { 'CRITICAL': 3, 'WARNING': 2, 'DEGRADED': 1 };
        activeAlarms.sort((a, b) => {
            const severityDiff = severityPriority[b.severity] - severityPriority[a.severity];
            if (severityDiff !== 0) return severityDiff;
            return b.activatedAt - a.activatedAt;
        });

        // Sort cleared alarms by cleared time (most recent first)
        clearedAlarms.sort((a, b) => b.clearedAt - a.clearedAt);

        return { active: activeAlarms, cleared: clearedAlarms };
    }

    /**
     * Format duration in human-readable format
     */
    function formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }

    /**
     * Get active duration for an active alarm
     */
    function getActiveDuration(activatedAt) {
        const now = new Date();
        const duration = now.getTime() - activatedAt.getTime();
        return 'Active for ' + formatDuration(duration);
    }

    /**
     * Format timestamp
     */
    function formatTimestamp(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Render alarms to the page
     */
    function renderAlarms() {
        renderActiveAlarms();
        renderClearedAlarms();
    }

    /**
     * Render active alarms
     */
    function renderActiveAlarms() {
        const container = document.getElementById('active-alarms-list');
        const countElement = document.getElementById('active-alarm-count');

        if (!container) return;

        // Update count
        if (countElement) {
            countElement.textContent = filteredAlarmsData.active.length;
        }

        // Clear container
        container.innerHTML = '';

        if (filteredAlarmsData.active.length === 0) {
            container.innerHTML = '<div class="no-alarms-message">No active alarms matching filters</div>';
            return;
        }

        // Get current time once for all alarms
        const now = new Date();

        // Render each alarm
        filteredAlarmsData.active.forEach(alarm => {
            const alarmRow = document.createElement('div');
            alarmRow.className = `alarm-row severity-${alarm.severity.toLowerCase()}`;

            // Calculate active duration
            const alarmMessage = getAlarmMessage(alarm.type);
            const activeDuration = getActiveDuration(alarm.activatedAt);

            alarmRow.innerHTML = `
                <div class="alarm-severity-badge ${alarm.severity.toLowerCase()}">${alarm.severity === 'CRITICAL' ? '🔴' : alarm.severity === 'WARNING' ? '⚠️' : 'ℹ️'} ${alarm.severity}</div>
                <div class="alarm-info">
                    <div class="alarm-module">${alarm.moduleId}</div>
                    <div class="alarm-type">${alarmMessage}</div>
                </div>
                <div class="alarm-timestamps">
                    <div class="alarm-timestamp active-time">${formatTimestamp(alarm.activatedAt)}</div>
                    <div class="alarm-duration">Active for ${activeDuration}</div>
                </div>
            `;

            container.appendChild(alarmRow);
        });
    }

    /**
     * Render cleared alarms
     */
    function renderClearedAlarms() {
        const container = document.getElementById('cleared-alarms-list');
        const countElement = document.getElementById('cleared-alarm-count');

        if (!container) return;

        // Update count
        if (countElement) {
            countElement.textContent = filteredAlarmsData.cleared.length;
        }

        // Clear container
        container.innerHTML = '';

        if (filteredAlarmsData.cleared.length === 0) {
            container.innerHTML = '<div class="no-alarms-message">No cleared alarms matching filters</div>';
            return;
        }

        // Limit to most recent cleared alarms
        const displayedAlarms = filteredAlarmsData.cleared.slice(0, MAX_DISPLAYED_CLEARED_ALARMS);

        // Render each alarm
        displayedAlarms.forEach(alarm => {
            const alarmRow = document.createElement('div');
            alarmRow.className = `alarm-row severity-${alarm.severity.toLowerCase()}`;

            const alarmMessage = getAlarmMessage(alarm.type);

            alarmRow.innerHTML = `
                <div class="alarm-severity-badge ${alarm.severity.toLowerCase()}">${alarm.severity === 'CRITICAL' ? '🔴' : alarm.severity === 'WARNING' ? '⚠️' : 'ℹ️'} ${alarm.severity}</div>
                <div class="alarm-info">
                    <div class="alarm-module">${alarm.moduleId}</div>
                    <div class="alarm-type">${alarm.type} - Cleared</div>
                </div>
                <div class="alarm-timestamps">
                    <div class="alarm-timestamp">Triggered: ${formatTimestamp(alarm.activatedAt)}</div>
                    <div class="alarm-timestamp">Cleared: ${formatTimestamp(alarm.clearedAt)}</div>
                    <div class="alarm-duration">Duration: ${alarm.duration}</div>
                </div>
            `;

            container.appendChild(alarmRow);
        });

        // Show message if more alarms exist
        if (filteredAlarmsData.cleared.length > MAX_DISPLAYED_CLEARED_ALARMS) {
            const moreMessage = document.createElement('div');
            moreMessage.className = 'no-alarms-message';
            moreMessage.textContent = `Showing ${MAX_DISPLAYED_CLEARED_ALARMS} of ${filteredAlarmsData.cleared.length} cleared alarms`;
            container.appendChild(moreMessage);
        }
    }

    // Initialize when DOM is ready and when navigating to alarms page
    function setupAlarmsInitialization() {
        const alarmsView = document.getElementById('view-alarms');
        if (!alarmsView) return;

        // Function to try initialization
        function tryInit() {
            // Check if module data is available
            if (!window.STATCOM || !window.STATCOM.getModuleData) {
                // Wait for module data to be available
                setTimeout(tryInit, 100);
                return;
            }

            const moduleData = window.STATCOM.getModuleData();
            if (!moduleData || Object.keys(moduleData).length === 0) {
                // Wait for module data to be populated
                setTimeout(tryInit, 100);
                return;
            }

            // Initialize alarms if view is active and alarms haven't been generated yet
            if (alarmsView.classList.contains('active')) {
                if (alarmsData.active.length === 0 && alarmsData.cleared.length === 0) {
                    initAlarms();
                }
            }
        }

        // Check if alarms view is currently active
        tryInit();

        // Set up observer for future navigation to alarms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (alarmsView.classList.contains('active')) {
                    tryInit();
                }
            });
        });

        observer.observe(alarmsView, { attributes: true, attributeFilter: ['class'] });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAlarmsInitialization);
    } else {
        setupAlarmsInitialization();
    }

})();

/**
 * Connection Manager
 * Handles STATCOM device connection and status
 */
(function() {
    'use strict';
    
    // Configuration constants
    const MIN_PASSWORD_LENGTH = 4;
    
    // Connection state
    let connectionState = {
        isConnected: false,
        ipAddress: '192.168.1.100',
        port: '502',
        lastConnected: null,
        connectionAttempts: 0
    };
    
    // Initialize connection form
    function initConnectionForm() {
        const connectBtn = document.getElementById('connect-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const ipInput = document.getElementById('ip-address-input');
        const portInput = document.getElementById('port-input');
        const passwordInput = document.getElementById('password-input');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', handleConnect);
        }
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', handleDisconnect);
        }
    }
    
    // Handle connection attempt
    function handleConnect() {
        const ipInput = document.getElementById('ip-address-input');
        const portInput = document.getElementById('port-input');
        const passwordInput = document.getElementById('password-input');
        
        // Validate inputs
        if (!validateConnectionInputs(ipInput.value, portInput.value, passwordInput.value)) {
            showConnectionError('Invalid connection parameters');
            return;
        }
        
        // Update button to connecting state
        setConnectionState('connecting');
        
        // Simulate connection attempt (replace with actual API call)
        simulateConnection(ipInput.value, portInput.value, passwordInput.value)
            .then(() => {
                // Success
                connectionState.isConnected = true;
                connectionState.ipAddress = ipInput.value;
                connectionState.port = portInput.value;
                connectionState.lastConnected = new Date();
                
                setConnectionState('connected');
                showConnectionSuccess();
            })
            .catch((error) => {
                // Failure
                connectionState.connectionAttempts++;
                setConnectionState('error');
                showConnectionError(error.message);
                
                // Auto-revert to default after 3 seconds
                setTimeout(() => {
                    setConnectionState('disconnected');
                }, 3000);
            });
    }
    
    // Handle disconnect
    function handleDisconnect() {
        connectionState.isConnected = false;
        connectionState.lastConnected = null;
        setConnectionState('disconnected');
    }
    
    // Simulate connection (replace with actual API)
    function simulateConnection(ip, port, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simple validation: password must meet minimum length
                if (password.length >= MIN_PASSWORD_LENGTH) {
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 2000); // 2 second delay to simulate network
        });
    }
    
    // Set connection UI state
    function setConnectionState(state) {
        const connectBtn = document.getElementById('connect-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const statusBadge = document.getElementById('status-badge');
        const statusText = document.getElementById('status-text');
        
        // Remove all state classes
        connectBtn.classList.remove('connecting', 'connected', 'error');
        
        switch(state) {
            case 'connecting':
                connectBtn.classList.add('connecting');
                connectBtn.innerHTML = '<span class="spinner"></span> Connecting...';
                connectBtn.disabled = true;
                statusBadge.className = 'status-badge status-connecting';
                statusText.textContent = 'Connecting...';
                break;
                
            case 'connected':
                connectBtn.classList.add('connected');
                connectBtn.innerHTML = '✓ Connected';
                connectBtn.disabled = true;
                connectBtn.style.display = 'none';
                disconnectBtn.style.display = 'inline-block';
                statusBadge.className = 'status-badge status-connected';
                statusText.textContent = 'Connected';
                updateLastConnectedTime();
                break;
                
            case 'error':
                connectBtn.classList.add('error');
                connectBtn.innerHTML = '✗ Connection Failed - Retry';
                connectBtn.disabled = false;
                statusBadge.className = 'status-badge status-error';
                statusText.textContent = 'Connection Failed';
                break;
                
            case 'disconnected':
            default:
                connectBtn.innerHTML = 'Connect';
                connectBtn.disabled = false;
                connectBtn.style.display = 'inline-block';
                disconnectBtn.style.display = 'none';
                statusBadge.className = 'status-badge status-disconnected';
                statusText.textContent = 'Disconnected';
                updateLastConnectedTime();
                break;
        }
    }
    
    // Update last connected timestamp
    function updateLastConnectedTime() {
        const lastConnectedEl = document.getElementById('last-connected-time');
        if (lastConnectedEl) {
            if (connectionState.lastConnected) {
                const timeStr = connectionState.lastConnected.toLocaleTimeString();
                const dateStr = connectionState.lastConnected.toLocaleDateString();
                lastConnectedEl.textContent = `Last connected: ${dateStr} ${timeStr}`;
            } else {
                lastConnectedEl.textContent = 'Never connected';
            }
        }
    }
    
    // Validate connection inputs
    function validateConnectionInputs(ip, port, password) {
        // IP validation - check format and octet ranges (0-255)
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) return false;
        
        const octets = ip.split('.');
        for (let i = 0; i < octets.length; i++) {
            const octet = parseInt(octets[i], 10);
            if (octet < 0 || octet > 255) return false;
        }
        
        // Port validation
        const portNum = parseInt(port);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) return false;
        
        // Password validation
        if (!password || password.length < MIN_PASSWORD_LENGTH) return false;
        
        return true;
    }
    
    // Show connection success message
    function showConnectionSuccess() {
        console.log('Connection successful');
        // Could add a toast notification here
    }
    
    // Show connection error message
    function showConnectionError(message) {
        console.error('Connection error:', message);
        // Could add a toast notification here
    }
    
    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initConnectionForm);
    } else {
        initConnectionForm();
    }
})();
