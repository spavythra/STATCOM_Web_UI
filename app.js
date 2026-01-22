/**
 * STATCOM Dashboard Router
 * Vanilla JavaScript client-side router with hash-based navigation
 */

(function() {
    'use strict';

    // Router configuration
    const routes = {
        '/config': 'view-config',
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
        const viewId = routes[route];
        
        if (!viewId) {
            // If route doesn't exist, redirect to default
            route = defaultRoute;
            window.location.hash = '#' + route;
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
