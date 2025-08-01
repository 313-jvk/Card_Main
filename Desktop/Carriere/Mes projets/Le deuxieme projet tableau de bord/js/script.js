// js/script.js

// Déclaration des variables globales pour les graphiques
// Ces variables les rendront accessibles pour les mettre à jour plus tard
let salesChart;
let unitsChart;

// Fonction pour préparer et afficher/mettre à jour les graphiques
function renderCharts(dataToDisplay) {
    // --- GRAPHIQUE À BARRES : Ventes Mensuelles par Catégorie ---
    const salesCanvas = document.getElementById('salesByCategoryChart');
    if (salesCanvas) {
        // Préparer les données pour le graphique à barres
        // Ici, nous allons regrouper les ventes par catégorie sur l'ensemble des données
        const salesByCategory = dataToDisplay.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.sales;
            return acc;
        }, {});

        const categories = Object.keys(salesByCategory);
        const salesData = Object.values(salesByCategory);

        // Si le graphique existe déjà, le détruire avant d'en créer un nouveau
        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(salesCanvas, {
            type: 'bar',
            data: {
                labels: categories, // Utilisez les catégories de vos données
                datasets: [{
                    label: 'Ventes Totales (DZD)',
                    data: salesData, // Utilisez les données de ventes préparées
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // --- GRAPHIQUE EN COURBES : Unités Vendues par Mois ---
    const unitsCanvas = document.getElementById('unitsByMonthChart');
    if (unitsCanvas) {
        // Préparer les données pour le graphique en courbes
        // Ici, nous allons regrouper les unités par mois (en prenant la somme si plusieurs catégories par mois)
        const unitsByMonth = dataToDisplay.reduce((acc, item) => {
            acc[item.month] = (acc[item.month] || 0) + item.units;
            return acc;
        }, {});

        // Assurez-vous que l'ordre des mois est correct (même si nos données sont déjà ordonnées)
        const orderedMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
        const unitsData = orderedMonths.map(month => unitsByMonth[month] || 0);

        // Si le graphique existe déjà, le détruire avant d'en créer un nouveau
        if (unitsChart) {
            unitsChart.destroy();
        }

        unitsChart = new Chart(unitsCanvas, {
            type: 'line',
            data: {
                labels: orderedMonths, // Utilisez les mois ordonnés
                datasets: [{
                    label: 'Unités Vendues',
                    data: unitsData, // Utilisez les données d'unités préparées
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


// Quand le contenu de la page est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    // Appeler la fonction pour afficher les graphiques avec TOUTES les données initiales
    // dashboardData vient du fichier js/data.js
    if (typeof dashboardData !== 'undefined' && dashboardData.length > 0) {
        renderCharts(dashboardData);
    } else {
        console.error("Les données 'dashboardData' n'ont pas été trouvées ou sont vides.");
    }
}); 