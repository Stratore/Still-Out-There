export class Application {
  constructor(client, vue, formulaire, champMail, menuTri) {
    this.client = client
    this.vue = vue
    this.formulaire = formulaire
    this.champMail = champMail
    this.menuTri = menuTri

    this.fuites = []
  }

  demarrer() {
    this.client.chargerCatalogue().catch(() => {})

    this.formulaire.addEventListener('submit', async (evenement) => {
      evenement.preventDefault()
      await this.lancerRecherche()
    })

    this.menuTri.addEventListener('change', () => {
      this.afficherTriees()
    })
  }

  async lancerRecherche() {
    const mail = this.champMail.value.trim()

    this.vue.afficherChargement()

    const resultat = await this.client.rechercher(mail)

    if (resultat.etat === 'resultats') {
      this.fuites = resultat.fuites
      this.afficherTriees()     // utilisation de mes methodes de vueFuites
    } else if (resultat.etat === 'vide') {
      this.vue.afficherVide()
    } else {
      this.vue.afficherErreur()
    }
  }

afficherTriees() {              // je ne savais pas vraiment comment faire de sort en js j'ai trouver ce patron sur un stackoverflow que j'ai adapté a mon code
  if (this.menuTri.value === 'date') {
    this.fuites.sort(function (a, b) {
      return b.date - a.date
    })
  } else {
    this.fuites.sort(function (a, b) {
      return b.comptes - a.comptes
    })
  }

  this.vue.afficherFuites(this.fuites)
}
}