// Classe pour gérer les filtres du tableau de bord
class FilterManager {
    constructor(chartManager) {
        this.chartManager = chartManager;
        this.currentFilters = {
            period: 'all',
            category: 'all',
            region: 'all'
        };
        
        this.initializeFilters();
        this.bindEvents();
    }

    // Initialisation des filtres
    initializeFilters() {
        this.periodFilter = document.getElementById('periodFilter');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.regionFilter = document.getElementById('regionFilter');
        this.resetButton = document.getElementById('resetFilters');
    }

    // Liaison des événements
    bindEvents() {
        // Événements de changement des filtres
        this.periodFilter.addEventListener('change', () => {
            this.currentFilters.period = this.periodFilter.value;
            this.applyFilters();
        });

        this.categoryFilter.addEventListener('change', () => {
            this.currentFilters.category = this.categoryFilter.value;
            this.applyFilters();
        });

        this.regionFilter.addEventListener('change', () => {
            this.currentFilters.region = this.regionFilter.value;
            this.applyFilters();
        });

        // Événement de réinitialisation
        this.resetButton.addEventListener('click', () => {
            this.resetFilters();
        });

        // Événements pour changer le type de graphique
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartName = e.target.dataset.chart;
                const chartType = e.target.dataset.type;
                
                // Mise à jour de l'état actif des boutons
                const parentControls = e.target.parentElement;
                parentControls.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Changement du type de graphique
                this.chartManager.changeChartType(chartName, chartType);
            });
        });
    }

    // Application des filtres
    applyFilters() {
        // Filtrage des données détaillées
        const filteredData = filterData(dashboardData.detailedData, this.currentFilters);
        
        // Mise à jour des graphiques
        this.chartManager.updateCharts(filteredData);
        
        // Mise à jour des statistiques du header
        this.updateHeaderStats(filteredData);
        
        // Animation des changements
        this.animateFilterChange();
    }

    // Réinitialisation des filtres
    resetFilters() {
        this.currentFilters = {
            period: 'all',
            category: 'all',
            region: 'all'
        };
        
        // Réinitialisation des sélecteurs
        this.periodFilter.value = 'all';
        this.categoryFilter.value = 'all';
        this.regionFilter.value = 'all';
        
        // Application des filtres réinitialisés
        this.applyFilters();
        
        // Animation de réinitialisation
        this.animateReset();
    }

    // Mise à jour des statistiques du header
    updateHeaderStats(filteredData) {
        // Calcul des totaux
        const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Mise à jour des éléments DOM avec animation
        this.animateStatUpdate('totalRevenue', formatCurrency(totalRevenue));
        this.animateStatUpdate('totalOrders', formatNumber(totalOrders));
        this.animateStatUpdate('avgOrderValue', formatCurrency(avgOrderValue));
    }

    // Animation de mise à jour des statistiques
    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Animation de fade out/in
        element.style.opacity = '0.5';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, 150);
    }

    // Animation lors du changement de filtre
    animateFilterChange() {
        // Animation subtile des conteneurs de graphiques
        document.querySelectorAll('.chart-container').forEach((container, index) => {
            container.style.transform = 'translateY(5px)';
            container.style.opacity = '0.8';
            
            setTimeout(() => {
                container.style.transform = 'translateY(0)';
                container.style.opacity = '1';
            }, index * 50 + 100);
        });
    }

    // Animation lors de la réinitialisation
    animateReset() {
        // Animation du bouton de réinitialisation
        this.resetButton.style.transform = 'scale(0.95)';
        this.resetButton.style.backgroundColor = '#059669';
        
        setTimeout(() => {
            this.resetButton.style.transform = 'scale(1)';
            this.resetButton.style.backgroundColor = '';
        }, 200);
        
        // Animation des filtres
        [this.periodFilter, this.categoryFilter, this.regionFilter].forEach((filter, index) => {
            setTimeout(() => {
                filter.style.borderColor = '#10b981';
                setTimeout(() => {
                    filter.style.borderColor = '';
                }, 300);
            }, index * 100);
        });
    }

    // Obtenir les filtres actuels
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    // Définir les filtres programmatiquement
    setFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        
        // Mise à jour des sélecteurs
        if (filters.period) this.periodFilter.value = filters.period;
        if (filters.category) this.categoryFilter.value = filters.category;
        if (filters.region) this.regionFilter.value = filters.region;
        
        this.applyFilters();
    }

    // Obtenir un résumé des données filtrées
    getFilteredDataSummary() {
        const filteredData = filterData(dashboardData.detailedData, this.currentFilters);
        
        return {
            totalRevenue: filteredData.reduce((sum, item) => sum + item.revenue, 0),
            totalOrders: filteredData.reduce((sum, item) => sum + item.orders, 0),
            dataPoints: filteredData.length,
            dateRange: this.getDateRange(filteredData),
            categories: [...new Set(filteredData.map(item => item.category))],
            regions: [...new Set(filteredData.map(item => item.region))]
        };
    }

    // Obtenir la plage de dates des données filtrées
    getDateRange(data) {
        if (data.length === 0) return null;
        
        const dates = data.map(item => item.month).sort();
        return {
            start: dates[0],
            end: dates[dates.length - 1]
        };
    }

    // Exporter les données filtrées (pour usage futur)
    exportFilteredData() {
        const filteredData = filterData(dashboardData.detailedData, this.currentFilters);
        const summary = this.getFilteredDataSummary();
        
        return {
            filters: this.getCurrentFilters(),
            data: filteredData,
            summary: summary,
            exportDate: new Date().toISOString()
        };
    }
}

// Export de la classe pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}