import './style.css'
import catalogue from './data/catalogue-exemple.json';






const formulaire = document.querySelector('#formulaire-recherche');

formulaire.addEventListener('submit', function (evenement) {
  evenement.preventDefault();
  const champ = document.querySelector('#champ-adresse');
  const submit = document.querySelector('#zone-resultat');





    const reponse = fetch('./data/catalogue-exemple.json');
    const catalogue = reponse.json();


    submit.textContent = catalogue


});






async function initialiser(mail) {
  try {
    const carte = creerCarte('carte')

      const [infos, etats] = await Promise.all([
      fetch('/api.xposedornot.com/v1/breaches').then(r => r.json()),
      fetch('https://api.xposedornot.com/v1/check-email/n' + mail).then(r => r.json())      // il faut continuer la 
    ])
    const etatsParId = new Map(
      etats.data.stations.map(s => [s.station_id, s])
    )

    const stations = []                                                                         //a tous changer pour traiter les données 

    for (const station of infos.data.stations) {
      const etat = etatsParId.get(station.station_id)

      stations.push({
        id: station.station_id,
        nom: station.name,
        lat: station.lat,
        lon: station.lon,
        capacite: station.capacity,
        velos: etat?.numBikesAvailable ?? 0,
        bornes: etat?.numDocksAvailable ?? 0
      })
    }


    stations.forEach((station) => {
      L.marker([station.lat, station.lon])
        .addTo(carte)
        .bindPopup(`<b>${station.nom}</b> <br> il reste ${station.velos} / ${station.capacite} places`)
    })
  } catch (erreur) {
  console.error('Échec du chargement', erreur)
} finally {
  setTimeout(initialiser, DELAI)
}
}

initialiser()








const [infos, etats] = await Promise.all([
      fetch('api.xposedornot.com/v1/breaches').then(r => r.json()),
      fetch('/api/opendata/Velib_Metropole/station_status.json').then(r => r.json())
    ])
    const etatsParId = new Map(
      etats.data.stations.map(s => [s.station_id, s])
    )

    const stations = []

    for (const station of infos.data.stations) {
      const etat = etatsParId.get(station.station_id)

      stations.push({
        id: station.station_id,
        nom: station.name,
        lat: station.lat,
        lon: station.lon,
        capacite: station.capacity,
        velos: etat?.numBikesAvailable ?? 0,
        bornes: etat?.numDocksAvailable ?? 0
      })
    }


    stations.forEach((station) => {
      L.marker([station.lat, station.lon])
        .addTo(carte)
        .bindPopup(`<b>${station.nom}</b> <br> il reste ${station.velos} / ${station.capacite} places`)
    })