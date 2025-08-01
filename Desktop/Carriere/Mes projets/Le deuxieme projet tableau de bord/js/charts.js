// Configuration globale pour Chart.js
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#64748b';

// Classe pour gérer tous les graphiques
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.initializeCharts();
    }

    // Initialisation de tous les graphiques
    initializeCharts() {
        this.createRevenueChart();
        this.createCategoryChart();
        this.createRegionChart();
        this.createOrdersChart();
        this.createProductsChart();
        this.createSegmentsChart();
    }

    // Graphique d'évolution du chiffre d'affaires
    createRevenueChart() {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        this.chartConfigs.revenue = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Chiffre d\'Affaires (€)',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Chiffre d'Affaires: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        };

        this.charts.revenue = new Chart(ctx, this.chartConfigs.revenue);
    }

    // Graphique de répartition par catégorie
    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        this.chartConfigs.category = {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.category = new Chart(ctx, this.chartConfigs.category);
    }

    // Graphique de performance par région
    createRegionChart() {
        const ctx = document.getElementById('regionChart').getContext('2d');
        
        this.chartConfigs.region = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Chiffre d\'Affaires (€)',
                    data: [],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Chiffre d'Affaires: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        };

        this.charts.region = new Chart(ctx, this.chartConfigs.region);
    }

    // Graphique de tendance des commandes
    createOrdersChart() {
        const ctx = document.getElementById('ordersChart').getContext('2d');
        
        this.chartConfigs.orders = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Nombre de Commandes',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Commandes: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    }
                }
            }
        };

        this.charts.orders = new Chart(ctx, this.chartConfigs.orders);
    }

    // Graphique des top produits
    createProductsChart() {
        const ctx = document.getElementById('productsChart').getContext('2d');
        
        this.chartConfigs.products = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Chiffre d\'Affaires (€)',
                    data: [],
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#f59e0b',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Chiffre d'Affaires: ${formatCurrency(context.parsed.x)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    }
                }
            }
        };

        this.charts.products = new Chart(ctx, this.chartConfigs.products);
    }

    // Graphique des segments clients
    createSegmentsChart() {
        const ctx = document.getElementById('segmentsChart').getContext('2d');
        
        this.chartConfigs.segments = {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        };

        this.charts.segments = new Chart(ctx, this.chartConfigs.segments);
    }

    // Mise à jour des données des graphiques
    updateCharts(filteredData) {
        this.updateRevenueChart(filteredData);
        this.updateCategoryChart(filteredData);
        this.updateRegionChart(filteredData);
        this.updateOrdersChart(filteredData);
        this.updateProductsChart(filteredData);
        this.updateSegmentsChart(filteredData);
    }

    updateRevenueChart(filteredData) {
        const monthlyData = this.aggregateByMonth(filteredData);
        
        this.charts.revenue.data.labels = monthlyData.map(item => formatMonth(item.month));
        this.charts.revenue.data.datasets[0].data = monthlyData.map(item => item.revenue);
        this.charts.revenue.update('active');
    }

    updateCategoryChart(filteredData) {
        const categoryData = this.aggregateByCategory(filteredData);
        
        this.charts.category.data.labels = categoryData.map(item => item.name);
        this.charts.category.data.datasets[0].data = categoryData.map(item => item.revenue);
        this.charts.category.data.datasets[0].backgroundColor = categoryData.map(item => item.color);
        this.charts.category.update('active');
    }

    updateRegionChart(filteredData) {
        const regionData = this.aggregateByRegion(filteredData);
        
        this.charts.region.data.labels = regionData.map(item => item.name);
        this.charts.region.data.datasets[0].data = regionData.map(item => item.revenue);
        this.charts.region.update('active');
    }

    updateOrdersChart(filteredData) {
        const monthlyData = this.aggregateByMonth(filteredData);
        
        this.charts.orders.data.labels = monthlyData.map(item => formatMonth(item.month));
        this.charts.orders.data.datasets[0].data = monthlyData.map(item => item.orders);
        this.charts.orders.update('active');
    }

    updateProductsChart(filteredData) {
        // Utiliser les données des top produits (non filtrées pour cet exemple)
        const topProducts = dashboardData.topProducts.slice(0, 10);
        
        this.charts.products.data.labels = topProducts.map(item => item.name);
        this.charts.products.data.datasets[0].data = topProducts.map(item => item.revenue);
        this.charts.products.update('active');
    }

    updateSegmentsChart(filteredData) {
        // Utiliser les données des segments clients (non filtrées pour cet exemple)
        const segments = dashboardData.customerSegments;
        
        this.charts.segments.data.labels = segments.map(item => item.name);
        this.charts.segments.data.datasets[0].data = segments.map(item => item.percentage);
        this.charts.segments.data.datasets[0].backgroundColor = segments.map(item => item.color);
        this.charts.segments.update('active');
    }

    // Fonctions d'agrégation des données
    aggregateByMonth(data) {
        const monthlyMap = new Map();
        
        data.forEach(item => {
            if (monthlyMap.has(item.month)) {
                monthlyMap.get(item.month).revenue += item.revenue;
                monthlyMap.get(item.month).orders += item.orders;
            } else {
                monthlyMap.set(item.month, {
                    month: item.month,
                    revenue: item.revenue,
                    orders: item.orders
                });
            }
        });
        
        return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    aggregateByCategory(data) {
        const categoryMap = new Map();
        
        data.forEach(item => {
            if (categoryMap.has(item.category)) {
                categoryMap.get(item.category).revenue += item.revenue;
                categoryMap.get(item.category).orders += item.orders;
            } else {
                const categoryInfo = dashboardData.categoryData.find(cat => cat.category === item.category);
                categoryMap.set(item.category, {
                    category: item.category,
                    name: categoryInfo ? categoryInfo.name : item.category,
                    color: categoryInfo ? categoryInfo.color : '#64748b',
                    revenue: item.revenue,
                    orders: item.orders
                });
            }
        });
        
        return Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
    }

    aggregateByRegion(data) {
        const regionMap = new Map();
        
        data.forEach(item => {
            if (regionMap.has(item.region)) {
                regionMap.get(item.region).revenue += item.revenue;
                regionMap.get(item.region).orders += item.orders;
            } else {
                const regionInfo = dashboardData.regionData.find(reg => reg.region === item.region);
                regionMap.set(item.region, {
                    region: item.region,
                    name: regionInfo ? regionInfo.name : item.region,
                    revenue: item.revenue,
                    orders: item.orders
                });
            }
        });
        
        return Array.from(regionMap.values()).sort((a, b) => b.revenue - a.revenue);
    }

    // Changer le type de graphique
    changeChartType(chartName, newType) {
        if (this.charts[chartName]) {
            this.charts[chartName].config.type = newType;
            this.charts[chartName].update('none');
        }
    }
}

// Export de la classe pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartManager;
}