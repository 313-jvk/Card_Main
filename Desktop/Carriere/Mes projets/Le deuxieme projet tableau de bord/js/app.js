// Application principale du tableau de bord
class DashboardApp {
    constructor() {
        this.chartManager = null;
        this.filterManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    // Initialisation de l'application
    async init() {
        try {
            // Affichage du loader
            this.showLoader();
            
            // Attendre que le DOM soit complètement chargé
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'application:', error);
            this.showError('Erreur lors du chargement du tableau de bord');
        }
    }

    // Initialisation des composants de l'application
    initializeApp() {
        try {
            // Initialisation des gestionnaires
            this.chartManager = new ChartManager();
            this.filterManager = new FilterManager(this.chartManager);
            
            // Chargement initial des données
            this.loadInitialData();
            
            // Configuration des événements globaux
            this.setupGlobalEvents();
            
            // Marquer comme initialisé
            this.isInitialized = true;
            
            // Masquer le loader
            this.hideLoader();
            
            // Animation d'entrée
            this.animateEntry();
            
            console.log('Tableau de bord initialisé avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des composants:', error);
            this.showError('Erreur lors de l\'initialisation des composants');
        }
    }

    // Chargement des données initiales
    loadInitialData() {
        try {
            // Utilisation de toutes les données par défaut
            const allData = dashboardData.detailedData;
            
            // Mise à jour des graphiques
            this.chartManager.updateCharts(allData);
            
            // Mise à jour des statistiques du header
            this.updateHeaderStats(allData);
            
            console.log('Données initiales chargées:', allData.length, 'points de données');
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showError('Erreur lors du chargement des données');
        }
    }

    // Mise à jour des statistiques du header
    updateHeaderStats(data) {
        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Mise à jour des éléments DOM
        const revenueElement = document.getElementById('totalRevenue');
        const ordersElement = document.getElementById('totalOrders');
        const avgElement = document.getElementById('avgOrderValue');
        
        if (revenueElement) revenueElement.textContent = formatCurrency(totalRevenue);
        if (ordersElement) ordersElement.textContent = formatNumber(totalOrders);
        if (avgElement) avgElement.textContent = formatCurrency(avgOrderValue);
    }

    // Configuration des événements globaux
    setupGlobalEvents() {
        // Gestion du redimensionnement de la fenêtre
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            console.error('Erreur globale:', event.error);
        });

        // Gestion des erreurs de promesses non capturées
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesse rejetée non gérée:', event.reason);
        });

        // Gestion de la visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                this.refreshData();
            }
        });
    }

    // Gestion du redimensionnement
    handleResize() {
        if (this.chartManager && this.isInitialized) {
            // Redimensionnement des graphiques
            Object.values(this.chartManager.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
    }

    // Rafraîchissement des données
    refreshData() {
        if (this.filterManager) {
            // Réapplication des filtres actuels
            this.filterManager.applyFilters();
        }
    }

    // Affichage du loader
    showLoader() {
        const loaderHtml = `
            <div id="dashboard-loader" class="loading" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(248, 250, 252, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-size: 1.1rem;
                color: #64748b;
            ">
                Chargement du tableau de bord...
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loaderHtml);
    }

    // Masquage du loader
    hideLoader() {
        const loader = document.getElementById('dashboard-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 300);
        }
    }

    // Affichage d'une erreur
    showError(message) {
        const errorHtml = `
            <div id="dashboard-error" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee2e2;
                color: #dc2626;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                border: 1px solid #fecaca;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                z-index: 10000;
                max-width: 400px;
            ">
                <strong>Erreur:</strong> ${message}
                <button onclick="this.parentElement.remove()" style="
                    float: right;
                    background: none;
                    border: none;
                    color: #dc2626;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: 1rem;
                ">&times;</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHtml);
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            const errorElement = document.getElementById('dashboard-error');
            if (errorElement) {
                errorElement.remove();
            }
        }, 5000);
    }

    // Animation d'entrée
    animateEntry() {
        // Animation des conteneurs de graphiques
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach((container, index) => {
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, index * 100 + 200);
        });

        // Animation du header
        const header = document.querySelector('.dashboard-header');
        if (header) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                header.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                header.style.opacity = '1';
                header.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animation des filtres
        const filtersSection = document.querySelector('.filters-section');
        if (filtersSection) {
            filtersSection.style.opacity = '0';
            setTimeout(() => {
                filtersSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                filtersSection.style.opacity = '1';
            }, 150);
        }
    }

    // Méthodes publiques pour l'API
    getChartManager() {
        return this.chartManager;
    }

    getFilterManager() {
        return this.filterManager;
    }

    isReady() {
        return this.isInitialized;
    }

    // Méthode pour exporter les données (usage futur)
    exportDashboardData() {
        if (!this.filterManager) return null;
        
        return {
            timestamp: new Date().toISOString(),
            filters: this.filterManager.getCurrentFilters(),
            summary: this.filterManager.getFilteredDataSummary(),
            version: '1.0'
        };
    }
}

// Initialisation de l'application
let dashboardApp;

// Démarrage automatique de l'application
(() => {
    dashboardApp = new DashboardApp();
})();

// Export pour usage dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardApp;
}