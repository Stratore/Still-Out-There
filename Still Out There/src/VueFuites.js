export class VueFuites {
  constructor(zone) {
    this.zone = zone        // je crée une zone dans laquel je vais travailler
  }

  //methode que j'utiliserais plus tard pour la gestion 
  afficherChargement() {
    this.zone.textContent = 'recherche en cours'
  }

  afficherVide() {
    this.zone.textContent = 'Aucune fuite trouvée pour cette adresse'
  }

  afficherErreur() {
    this.zone.textContent = 'erreur'
  }

  afficherFuites(fuites) {                      //rajout du logo ici que je n'avais pas encore traité
    const cartes = fuites.map((fuite) => `
      <details>
        <summary>
          <img src="${fuite.logo}" alt="${fuite.nom}" width="32" height="32">   
          ${fuite.nom}
        </summary>
        <p>${fuite.secteur} · ${fuite.dateLisible}</p>
        <p>${fuite.domain}</p>
        <p>${fuite.comptes} comptes touchés</p>
        <p>données touchées : ${fuite.types.join(', ')}</p>
        <p>${fuite.description}</p>
      </details>
    `).join('')

    this.zone.innerHTML = fuites.length + ' fuites trouvées' + cartes

  }
}