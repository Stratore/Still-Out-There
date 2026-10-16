import './style.css'



const API = 'https://api.xposedornot.com/v1'

let catalogue = null

async function chargerCatalogue() {
  if (catalogue !== null) return catalogue

  const reponse = await fetch(API + '/breaches')
  if (!reponse.ok) throw new Error('CHARGER_CATALOGUE')

  const donnees = await reponse.json()
  catalogue = donnees.exposedBreaches
  //console.log(catalogue[0])   // test, parce que j'avais un bug et je voulais l'identifier 

  return catalogue
}

function trouverDansCatalogue(liste, nom) {
  for (const fuite of liste) {
    if (fuite.breachID === nom) return fuite
  }
  throw new Error('TROUVER_CATLOGUE');
  return null
}

async function rechercher(mail) {
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

      console.log(brute)
      let texte = brute.xposedData

      if (texte === undefined || texte === null) {
      texte = ''
      }

      const types = texte.split(';')

      fuites.push({
        nom: brute.breachID,
        logo: brute.logo,
        date: brute.breachedDate,
        secteur: brute.industry,
        comptes: brute.xposedRecords,
        types: types,
        description: brute.xposureDesc,
        motDePasseExpose: types.includes('Passwords')
      })
    }

    return fuites
  } catch (erreur) {
    console.error(erreur)
    return 0
  }
}

function afficherFuites(fuites) {
  return fuites.map((fuite) => `
      <details>
        <summary>${fuite.nom}</summary>
        <p>${fuite.secteur} · ${fuite.date}</p>
        <p>${fuite.comptes} comptes touchés</p>
        <p>${fuite.types.join(', ')}</p>
        <p>${fuite.description}</p>
      </details>
    `)
    .join('')
}

