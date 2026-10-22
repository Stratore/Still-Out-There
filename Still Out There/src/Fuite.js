export class Fuite {
  constructor(donnees) {    //constructeur avec toutes les données et les données par défault 
    this.nom = donnees.breachID;
    this.logo = donnees.logo || '';
    this.date = donnees.breachedDate || '';     // date au format ISO 8601
    this.secteur = donnees.industry || 'Inconnu';
    this.domain = donnees.domain || '';     // j'ai rajouter domain car c'est intéréssent de pourvoir aller sur le site pour reset ses mdp
    this.comptes = donnees.exposedRecords || 0;
    this.types = donnees.exposedData || [];
    this.description = donnees.exsposureDescription || '';
    this.timestamp = 0;
    this.dateLisible = 'Date inconnue';     // date au bon format

    if (this.date !== '') {
      const dateObjet = new Date(this.date);
      this.timestamp = dateObjet.getTime();
      this.dateLisible = dateObjet.toLocaleDateString('fr-FR');    // pour avoire le bon format
    }
  }
}