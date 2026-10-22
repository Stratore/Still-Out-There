import { Fuite } from './Fuite.js'

const API = 'https://api.xposedornot.com/v1'
const DUREE_CACHE = 30 * 60 * 1000   // 30 minutes en millisecondes
const CLE = 'catalogue'

export class ClientExposed {
 async chargerCatalogue() {
  const stocke = localStorage.getItem(CLE)    // je voulais faire un setinterval de base pour limiter les requet et faire un cash mais le problem c'est que si on ferme la page 
                                              // on qu'on la reouvre ca ce reset et ca refait une requettes donc posibilité que l'utilisateur spam les requettes donc localstorage
                                              // j'urais aussi pu passer par sessionStorage, ma m'ourais peris que ca se n'étoie tous suel a la fermeture de l'onglet mais je préfère garder local car 
                                              // comme ca si on ferme le naviguateur on n'as pas de demande suplémentaire ni si on ouvre un autre onglet 
  if (stocke !== null) {                       // car localStorage.getItem(CLE)  renvoie null si rien n'as jamais été socké (comme le premier chargement)
    const paquet = JSON.parse(stocke)         // plus d'info dans le readme
    const age = Date.now() - paquet.date

    if (age < DUREE_CACHE) {
      return paquet.donnees
    }

  }
  
  // donc si on rentre pas dans les deux conditions c'est que c'est la premier fois donc on intéroge l'api
    
  const reponse = await fetch(API + '/breaches')
  if (!reponse.ok) throw new Error('CHARGER_CATALOGUE')

  
  const json = await reponse.json()
  const donnees = json.exposedBreaches


  const paquet = { date: Date.now(), donnees: donnees } //création de l'objet
  localStorage.setItem(CLE, JSON.stringify(paquet))   //stringify pour mettre au format texte pour le fichier json

  return paquet.donnees
}

 trouverDansCatalogue(liste, nom) {
  for (const fuite of liste) {
    if (fuite.breachID === nom) return fuite
  }
  return null
}

async rechercher(mail) {
  try {
    const liste = await chargerCatalogue()

    const reponse = await fetch(API + '/check-email/' + encodeURIComponent(mail))   //encodeURIComponent transforme le texte en url

    // gestion des erreures 
    if (!reponse.ok) {
      return { etat: 'erreur' }
    }

    const donnees = await reponse.json()
    const noms = donnees.breaches[0]    // breaches[0] car il y a qu'une seule ligne 
    

    const fuites = []

    for (const nom of noms) {
      const brute = trouverDansCatalogue(liste, nom)
      if (brute === null) continue

      fuites.push(new Fuite(brute))   //dans cette version plus besoin de mettre toutes les infos dans des variables vu que j'ai crée un object
    
    }

    return { etat: 'resultats', fuites: fuites }
  } catch (erreur) {
    console.error(erreur)
    return { etat: 'erreur' }
  }
}
}
