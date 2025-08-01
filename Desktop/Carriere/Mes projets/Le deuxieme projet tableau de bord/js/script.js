// js/script.js

// Attendre que tout le contenu de la page soit chargé
document.addEventListener('DOMContentLoaded', () => {

    // 1. Trouver l'élément canvas dans HTML par son ID
    const salesCanvas = document.getElementById('salesByCategoryChart');

    // Vérifier que le canvas existe bien avant de tenter de créer le graphique
    if (salesCanvas) {
        // 2. Créer le graphique à barres
        new Chart(salesCanvas, {
            type: 'bar', // Type de graphique : 'bar' pour un graphique à barres
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], // Les étiquettes sur l'axe X (les mois)
                datasets: [{
                    label: 'Ventes Mensuelles (DZD)', // Nom de la série de données
                    data: [12000, 13500, 14000, 15000, 16000, 17000], // Les données de ventes pour chaque mois
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Couleur des barres
                    borderColor: 'rgba(75, 192, 192, 1)',     // Couleur des bordures des barres
                    borderWidth: 1                           // Largeur des bordures
                }]
            },
            options: {
                responsive: true, // Le graphique s'adaptera à la taille de son conteneur
                scales: {
                    y: {
                        beginAtZero: true // L'axe Y commencera à zéro
                    }
                }
            }
        }); 
    } 
    
    // ... code du graphique à barres (salesByCategoryChart) ...

    // 3. Trouver l'élément canvas pour le deuxième graphique
    const unitsCanvas = document.getElementById('unitsByMonthChart');

    if (unitsCanvas) {
        // 4. Créer le graphique en courbes
        new Chart(unitsCanvas, {
            type: 'line', // Type de graphique : 'line' pour un graphique en courbes
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], // Les mois sur l'axe X
                datasets: [{
                    label: 'Unités Vendues', // Nom de la série de données
                    data: [150, 160, 170, 180, 190, 200], // Les données d'unités vendues par mois
                    borderColor: 'rgba(153, 102, 255, 1)', // Couleur de la ligne
                    backgroundColor: 'rgba(153, 102, 255, 0.2)', // Couleur de la zone sous la ligne
                    fill: true // Remplir la zone sous la ligne
                }]
            },
            options: {
                responsive: true, // Le graphique s'adaptera à la taille de son conteneur
                scales: {
                    y: {
                        beginAtZero: true // L'axe Y commencera à zéro
                    }
                }
            }
        });
    }
}); 


