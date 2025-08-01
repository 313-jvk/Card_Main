// js/script.js

// Déclaration des variables globales pour les graphiques
// Ceci permet de les contrôler (détruire/recréer) depuis n'importe où.
let salesChart;
let unitsChart;

// Fonction pour préparer et afficher/mettre à jour les graphiques
// Elle prend en paramètre les données à utiliser pour cette mise à jour.
function renderCharts(dataToDisplay) {
    // --- GRAPHIQUE À BARRES : Ventes Mensuelles par Catégorie ---
    const salesCanvas = document.getElementById('salesByCategoryChart');
    if (salesCanvas) {
        // Prépare les données pour le graphique à barres : regroupe les ventes par catégorie.
        const salesByCategory = dataToDisplay.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.sales;
            return acc;
        }, {});

        const categories = Object.keys(salesByCategory);
        const salesData = Object.values(salesByCategory);

        // Si un graphique de ventes existe déjà, on le supprime (détruit)
        // avant d'en créer un nouveau pour éviter les superpositions.
        if (salesChart) {
            salesChart.destroy();
        }

        // Crée le nouveau graphique à barres.
        salesChart = new Chart(salesCanvas, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Ventes Totales (DZD)',
                    data: salesData,
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
        // Prépare les données pour le graphique en courbes : regroupe les unités par mois.
        const unitsByMonth = dataToDisplay.reduce((acc, item) => {
            acc[item.month] = (acc[item.month] || 0) + item.units;
            return acc;
        }, {});

        // Assure que l'ordre des mois est correct.
        const orderedMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
        const unitsData = orderedMonths.map(month => unitsByMonth[month] || 0);

        // Si un graphique d'unités existe déjà, on le supprime.
        if (unitsChart) {
            unitsChart.destroy();
        }

        // Crée le nouveau graphique en courbes.
        unitsChart = new Chart(unitsCanvas, {
            type: 'line',
            data: {
                labels: orderedMonths,
                datasets: [{
                    label: 'Unités Vendues',
                    data: unitsData,
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


// Quand le contenu de la page est entièrement chargé (DOM Ready)
document.addEventListener('DOMContentLoaded', () => {
    // Au démarrage, on affiche les graphiques avec TOUTES les données.
    // dashboardData vient du fichier js/data.js (vérifier s'il est bien chargé).
    if (typeof dashboardData !== 'undefined' && dashboardData.length > 0) {
        renderCharts(dashboardData);
    } else {
        console.error("Erreur : Les données 'dashboardData' n'ont pas été trouvées ou sont vides.");
    }

    // --- DÉBUT DU NOUVEAU CODE POUR LE FILTRE DES MOIS (Tâche 3.2) ---
    const monthSelect = document.getElementById('month-select'); // Trouve la liste déroulante des mois

    if (monthSelect) { // S'assure que la liste déroulante existe dans le HTML
        // Ajoute un "écouteur d'événement" : quand la valeur de la liste change...
        monthSelect.addEventListener('change', (event) => {
            const selectedMonth = event.target.value; // Récupère le mois sélectionné (ex: "Jan", "all")
            let filteredData = dashboardData; // Par défaut, on garde toutes les données

            // Si un mois spécifique est choisi (pas "Tous les mois")...
            if (selectedMonth !== 'all') {
                // ... on filtre les données pour ne garder que ce mois.
                filteredData = dashboardData.filter(item => item.month === selectedMonth);
            }
            // Ensuite, on appelle notre fonction pour mettre à jour les graphiques
            // avec les données (filtrées ou non).
            renderCharts(filteredData);
        });
    }
    // --- FIN DU NOUVEAU CODE POUR LE FILTRE DES MOIS ---
}); 