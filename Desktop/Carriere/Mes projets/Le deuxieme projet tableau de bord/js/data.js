// Données simulées pour le tableau de bord
const dashboardData = {
    // Données de revenus mensuels
    revenueData: [
        { month: '2024-07', revenue: 45000, orders: 320, category: 'all', region: 'all' },
        { month: '2024-08', revenue: 52000, orders: 380, category: 'all', region: 'all' },
        { month: '2024-09', revenue: 48000, orders: 350, category: 'all', region: 'all' },
        { month: '2024-10', revenue: 58000, orders: 420, category: 'all', region: 'all' },
        { month: '2024-11', revenue: 62000, orders: 450, category: 'all', region: 'all' },
        { month: '2024-12', revenue: 75000, orders: 520, category: 'all', region: 'all' },
        { month: '2025-01', revenue: 68000, orders: 480, category: 'all', region: 'all' }
    ],

    // Répartition par catégories
    categoryData: [
        { category: 'electronics', name: 'Électronique', revenue: 125000, orders: 850, color: '#3b82f6' },
        { category: 'clothing', name: 'Vêtements', revenue: 98000, orders: 1200, color: '#ef4444' },
        { category: 'books', name: 'Livres', revenue: 45000, orders: 650, color: '#10b981' },
        { category: 'home', name: 'Maison & Jardin', revenue: 78000, orders: 420, color: '#f59e0b' },
        { category: 'sports', name: 'Sports', revenue: 62000, orders: 380, color: '#8b5cf6' }
    ],

    // Performance par région
    regionData: [
        { region: 'paris', name: 'Île-de-France', revenue: 145000, orders: 980, color: '#3b82f6' },
        { region: 'lyon', name: 'Auvergne-Rhône-Alpes', revenue: 89000, orders: 620, color: '#ef4444' },
        { region: 'marseille', name: 'Provence-Alpes-Côte d\'Azur', revenue: 76000, orders: 540, color: '#10b981' },
        { region: 'toulouse', name: 'Occitanie', revenue: 65000, orders: 450, color: '#f59e0b' },
        { region: 'lille', name: 'Hauts-de-France', revenue: 53000, orders: 380, color: '#8b5cf6' }
    ],

    // Top produits
    topProducts: [
        { name: 'iPhone 15 Pro', revenue: 45000, orders: 150, category: 'electronics' },
        { name: 'MacBook Air M3', revenue: 38000, orders: 95, category: 'electronics' },
        { name: 'Nike Air Max', revenue: 28000, orders: 280, category: 'sports' },
        { name: 'Samsung Galaxy S24', revenue: 32000, orders: 160, category: 'electronics' },
        { name: 'Adidas Ultraboost', revenue: 22000, orders: 220, category: 'sports' },
        { name: 'Zara Jacket', revenue: 18000, orders: 300, category: 'clothing' },
        { name: 'Dyson V15', revenue: 25000, orders: 125, category: 'home' },
        { name: 'AirPods Pro', revenue: 21000, orders: 210, category: 'electronics' },
        { name: 'H&M Dress', revenue: 15000, orders: 375, category: 'clothing' },
        { name: 'Kindle Oasis', revenue: 12000, orders: 200, category: 'books' }
    ],

    // Segments clients
    customerSegments: [
        { segment: 'premium', name: 'Premium', percentage: 25, revenue: 180000, color: '#fbbf24' },
        { segment: 'regular', name: 'Régulier', percentage: 45, revenue: 162000, color: '#3b82f6' },
        { segment: 'occasional', name: 'Occasionnel', percentage: 30, revenue: 66000, color: '#10b981' }
    ],

    // Données détaillées par mois et catégorie
    detailedData: [
        // Juillet 2024
        { month: '2024-07', category: 'electronics', region: 'paris', revenue: 12000, orders: 80 },
        { month: '2024-07', category: 'clothing', region: 'paris', revenue: 8000, orders: 120 },
        { month: '2024-07', category: 'books', region: 'lyon', revenue: 3000, orders: 45 },
        { month: '2024-07', category: 'home', region: 'marseille', revenue: 6000, orders: 35 },
        { month: '2024-07', category: 'sports', region: 'toulouse', revenue: 4500, orders: 40 },
        
        // Août 2024
        { month: '2024-08', category: 'electronics', region: 'paris', revenue: 15000, orders: 95 },
        { month: '2024-08', category: 'clothing', region: 'lyon', revenue: 9500, orders: 140 },
        { month: '2024-08', category: 'books', region: 'marseille', revenue: 3500, orders: 50 },
        { month: '2024-08', category: 'home', region: 'toulouse', revenue: 7000, orders: 40 },
        { month: '2024-08', category: 'sports', region: 'lille', revenue: 5200, orders: 45 },
        
        // Septembre 2024
        { month: '2024-09', category: 'electronics', region: 'lyon', revenue: 13500, orders: 85 },
        { month: '2024-09', category: 'clothing', region: 'paris', revenue: 8800, orders: 130 },
        { month: '2024-09', category: 'books', region: 'toulouse', revenue: 3200, orders: 48 },
        { month: '2024-09', category: 'home', region: 'marseille', revenue: 6500, orders: 38 },
        { month: '2024-09', category: 'sports', region: 'lille', revenue: 4800, orders: 42 },
        
        // Octobre 2024
        { month: '2024-10', category: 'electronics', region: 'paris', revenue: 18000, orders: 110 },
        { month: '2024-10', category: 'clothing', region: 'lyon', revenue: 11000, orders: 160 },
        { month: '2024-10', category: 'books', region: 'marseille', revenue: 4000, orders: 55 },
        { month: '2024-10', category: 'home', region: 'toulouse', revenue: 8000, orders: 45 },
        { month: '2024-10', category: 'sports', region: 'lille', revenue: 5500, orders: 50 },
        
        // Novembre 2024
        { month: '2024-11', category: 'electronics', region: 'lyon', revenue: 19500, orders: 120 },
        { month: '2024-11', category: 'clothing', region: 'paris', revenue: 12500, orders: 180 },
        { month: '2024-11', category: 'books', region: 'toulouse', revenue: 4200, orders: 60 },
        { month: '2024-11', category: 'home', region: 'marseille', revenue: 8500, orders: 48 },
        { month: '2024-11', category: 'sports', region: 'lille', revenue: 6000, orders: 55 },
        
        // Décembre 2024
        { month: '2024-12', category: 'electronics', region: 'paris', revenue: 25000, orders: 150 },
        { month: '2024-12', category: 'clothing', region: 'lyon', revenue: 15000, orders: 220 },
        { month: '2024-12', category: 'books', region: 'marseille', revenue: 5500, orders: 75 },
        { month: '2024-12', category: 'home', region: 'toulouse', revenue: 10000, orders: 55 },
        { month: '2024-12', category: 'sports', region: 'lille', revenue: 7200, orders: 65 },
        
        // Janvier 2025
        { month: '2025-01', category: 'electronics', region: 'lyon', revenue: 22000, orders: 135 },
        { month: '2025-01', category: 'clothing', region: 'paris', revenue: 13500, orders: 195 },
        { month: '2025-01', category: 'books', region: 'toulouse', revenue: 4800, orders: 65 },
        { month: '2025-01', category: 'home', region: 'marseille', revenue: 9000, orders: 50 },
        { month: '2025-01', category: 'sports', region: 'lille', revenue: 6500, orders: 58 }
    ]
};

// Fonction utilitaire pour formater les nombres
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Fonction utilitaire pour formater les nombres
function formatNumber(number) {
    return new Intl.NumberFormat('fr-FR').format(number);
}

// Fonction utilitaire pour formater les dates
function formatMonth(monthString) {
    const date = new Date(monthString + '-01');
    return new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}

// Fonction pour filtrer les données selon les critères
function filterData(data, filters) {
    return data.filter(item => {
        // Filtre par période
        if (filters.period !== 'all') {
            const itemDate = new Date(item.month + '-01');
            const now = new Date();
            let cutoffDate = new Date();
            
            switch (filters.period) {
                case 'lastmonth':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'last3months':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case 'last6months':
                    cutoffDate.setMonth(now.getMonth() - 6);
                    break;
            }
            
            if (itemDate < cutoffDate) return false;
        }
        
        // Filtre par catégorie
        if (filters.category !== 'all' && item.category !== filters.category) {
            return false;
        }
        
        // Filtre par région
        if (filters.region !== 'all' && item.region !== filters.region) {
            return false;
        }
        
        return true;
    });
}

// Export des données pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dashboardData, formatCurrency, formatNumber, formatMonth, filterData };
}