import { Fuite } from './Fuite.js'

const API = 'https://api.xposedornot.com/v1'
const DUREE_CACHE = 30 * 60 * 1000   // 30 minutes en millisecondes
const CLE = 'catalogue'

export class ClientExposed {
 async chargerCatalogue() {
  const stocke = localStorage.getItem(CLE)    // plus d'info dans le readme

  if (stocke !== null) {  
    const paquet = JSON.parse(stocke)         
    const age = Date.now() - paquet.date

    if (age < DUREE_CACHE) {
      return paquet.donnees
    }

  }
  
  // donc si on rentre pas dans les deux conditions c'est que c'est la premier fois ou que le cache est trop vieux donc on intéroge l'api
    
  const reponse = await fetch(API + '/breaches')
  if (!reponse.ok) throw new Error('Impossible de charger le catalogue')

  
  const json = await reponse.json()
  const donnees = json.exposedBreaches


  const paquet = { date: Date.now(), donnees: donnees } //création de l'objet
  localStorage.setItem(CLE, JSON.stringify(paquet))   // stringify met l'objet au format texte car localStorage ne stocke que du texte

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
    const liste = await this.chargerCatalogue()

    const reponse = await fetch(API + '/check-email/' + encodeURIComponent(mail))   //encodeURIComponent transforme le texte en url


    //une adresse qui n'a jamais fuité peut renvoyer un 404 ce n'est pas une erreur mais pas de fuite
    if (reponse.status === 404) {     
      return { etat: 'vide' }
    }

    if (!reponse.ok) {
      return { etat: 'erreur' }
    }

    const donnees = await reponse.json()
    const noms = donnees.breaches[0]    // breaches[0] car il y a qu'une seule ligne 
    

    const fuites = []

    for (const nom of noms) {
      const brute = this.trouverDansCatalogue(liste, nom)
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
