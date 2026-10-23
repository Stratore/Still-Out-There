# still out there

Le nom est un jeu de mots : ce qu'on met sur internet y reste, et continue de
circuler quelque part sans qu'on le sache.

Site qui permet de savoir si une adresse mail apparaît dans des fuites de
données connues. On tape une adresse, le site affiche la liste des fuites avec
le logo de l'entreprise, la date, le secteur, le nombre de comptes touchés, le
type de données exposées et la description de l'incident.

## Installation

Installer les dépendances :

    npm install

Lancer le serveur de développement :

    npm start

Le site est accessible sur http://localhost:8080 et se recharge tout seul quand
on modifie un fichier.

Construire la version finale :

    npm run build

Le résultat est mis dans le dossier dist.

## Les données

J'utilise l'API XposedOrNot (https://xposedornot.com/api_doc). Elle est
gratuite, sans clé, et accepte les requêtes depuis le navigateur.

J'appelle deux adresses :

- /v1/breaches donne le catalogue de toutes les fuites connues
- /v1/check-email/{email} donne les noms des fuites qui contiennent l'adresse

Le lien entre les deux se fait par le breachID. Les noms renvoyés par
check-email correspondent aux identifiants du catalogue.

Il y a des quotas : 50 appels par jour sur breaches, 100 sur check-email, et 2
requêtes par seconde maximum.

## Choix de conception

### Découpage en classes

## Architecture et choix de conception

À la base, j'avais tout écrit dans un seul fichier 'index.js', avec des fonctions. Quand j'ai voulu
ajouter un menu pour trier les résultats, j'ai naïvement créé une classe 'Trie'. En me penchant
vraiment sur le découpage en classes, je me suis vite rendu compte que ce n'était pas la bonne
manière de faire. 'Trie' correspond à une action (trier) et non à un élément du site, et elle
n'avait ni données ni état propres.

Je me suis renseigné sur la façon de découper des classes et j'ai compris que, pour trouver
l'arborescence, il faut se dire que ce qui change pour la même raison doit rester ensemble, et que
ce qui change pour des raisons différentes doit être séparé. C'est le principe de responsabilité
unique, chaque classe n'a qu'une seule raison d'être modifiée.

J'ai donc découpé selon ce que le site manipule et ce qui peut évoluer.

- **'Fuite'** représente une fuite de données. Elle regroupe ses informations (nom, logo, date,
  secteur, nombre de comptes, types de données, description) et prépare les formats dont on a
  besoin, un timestamp pour le tri et une date lisible pour l'affichage.
- **'ClientExposed'** regroupe tout ce qui parle à l'API, c'est-à-dire le cache du catalogue dans
  'localStorage', les deux requêtes 'fetch' dépendantes et le croisement par 'breachID'. Si
  l'API change, c'est le seul fichier à modifier.
- **'VueFuites'** regroupe tout l'affichage (cartes, logos avec repli, messages). Si le design
  change, c'est le seul fichier à modifier.
- **'Application'** coordonne le tout. Elle écoute le formulaire et le menu de tri, et garde
  en mémoire la liste des fuites du dernier résultat. Cet état permet de retrier sans
  refaire de requête, ce qui était impossible quand la liste n'existait que dans l'écouteur du
  formulaire.

Le tri est devenu une méthode de 'Application' ('afficherTriees') et non une classe. C'est une
action qui s'appuie sur l'état de l'application, pas un objet à part entière.

### Enchaînement des deux requêtes

La première requête va chercher le catalogue complet des fuites connues sur
/v1/breaches. Je le mets en cache, et il contient toutes les infos de chaque
fuite : la date, le secteur, le logo, le type de données qui ont fuité.

La deuxième requête part quand l'utilisateur valide son adresse. J'appelle
/v1/check-email avec le mail de l'utilisateur à la fin de l'URL, et ça me
renvoie juste une liste de noms d'entreprises.

C'est là que les deux se croisent : chaque nom renvoyé correspond à un
breachID du catalogue. Je vais donc rechercher l'entrée complète dans ce que
j'ai chargé au départ, et c'est comme ça que je récupère les détails à
afficher. Sans la première requête, les noms renvoyés par la deuxième ne me
servent à rien.

### Mise en cache du catalogue

L'API est gratuite et sans clé, du coup elle limite le nombre d'appels : 50
par jour sur /v1/breaches. Et comme le catalogue est chargé à chaque ouverture
de la page, j'aurais utilisé le quota très vite, surtout en développement où le
serveur recharge la page à chaque sauvegarde.

J'ai donc mis le catalogue dans le localStorage avec la date du moment où je
l'ai enregistré. Au chargement suivant, je compare cette date à maintenant :
si ça fait moins de 30 minutes, je réutilise ce que j'ai, sinon je rappelle
l'API.

J'avais d'abord pensé à un setInterval mais ça ne marche que tant que la page
reste ouverte : dès qu'on recharge, le minuteur disparaît et on refait un
appel. J'ai aussi hésité avec sessionStorage, qui se nettoie tout seul à la
fermeture de l'onglet, mais j'ai gardé localStorage pour que le cache survive
aussi quand on ferme le navigateur ou qu'on ouvre un autre onglet.

### Difficulté principale

Ce qui m'a pris le plus de temps, ce sont les formats de données renvoyés par
l'API. Je supposais ce qu'ils contenaient au lieu d'aller vérifier.

Le premier cas : au lieu de renvoyer le tableau du catalogue, je renvoyais
l'objet complet de la réponse. Du coup ma boucle for...of plantait avec
"liste is not iterable" et je ne comprenais pas pourquoi, puisque le fetch
marchait.

Le deuxième, le plus long : je traitais le champ exposedData comme une chaîne
de caractères et je faisais un split dessus pour séparer les types de données.
Sauf que l'API renvoie déjà un tableau. J'avais même les deux versions dans
mon code sans m'en rendre compte, un split d'un côté et un join de l'autre sur
le même champ, ce qui affichait la même information deux fois.

Ce qui m'a débloqué à chaque fois, c'est le console.log. Au lieu de deviner
d'après la documentation, j'ai affiché une entrée complète dans la console et
j'ai regardé ce qu'elle contenait vraiment. Les deux bugs se sont réglés en
quelques secondes une fois que j'ai vu les données.

L'autre chose que je ne savais pas faire du tout, c'était la mise en cache :
voir la section plus haut pour le détail.

## Usage de l'IA

J'ai utilisé Claude.

Je ne code pas encore très bien en JavaScript, donc je m'en suis servi pour
apprendre, pas pour produire. Je ne lui ai jamais demandé d'écrire mon code à
ma place, c'est ce que j'ai précisé dans le prompt de départ.

Ce que je lui ai demandé :

- m'expliquer des notions que je ne connaissais pas, comme les promesses,
  async et await, ou le fonctionnement de webpack
- m'expliquer des messages d'erreur quand je ne comprenais pas d'où ils
  venaient
- m'aider à trouver et à comprendre de la documentation
- me dire quelles sont les bonnes pratiques du développement web, pour que mon
  rendu ressemble à ce qui se fait vraiment (notamment le découpage du code)
- relire du code que j'avais écrit et me dire ce qui n'allait pas
- générer le CSS : le sujet évalue la conception et le code, j'ai donc préféré
  concentrer mon temps dessus et déléguer la mise en forme pour avoir un rendu
  présentable
- corriger l'orthographe et les tournures de ce README : si vous avez lu mes
  commentaires dans le code, vous avez vu que ce n'est pas mon point fort

Quand j'étais bloqué, je ne demandais pas la solution pour mon projet. Je
demandais un exemple sur un sujet qui n'a rien à voir avec mon travail. Je
l'analysais, je comprenais comment ça marchait, et ensuite je l'écrivais
moi-même dans mon code en l'adaptant à mon cas. Ça m'a obligé à comprendre
avant d'écrire au lieu de recopier quelque chose qui marche sans savoir
pourquoi.

### Parties du code concernées

- La configuration webpack : je suis parti d'une correction de TP fournie en
  cours et je l'ai adaptée à ce projet. Claude m'a expliqué à quoi servait
  chaque bloc et ce que je devais retirer (le proxy et dotenv, dont je n'avais
  pas besoin).
- La mise en cache : je n'en avais jamais fait. Claude m'a montré le principe
  sur un exemple qui n'avait rien à voir, et m'a aidé à comprendre la
  différence entre localStorage et sessionStorage pour choisir.
- Le fichier style.css.
- Des fonctions JavaScript que je ne connaissais pas : toLocaDéveloppement webleDateString,
  encodeURIComponent, JSON.stringify et JSON.parse. Claude m'a expliqué ce
  qu'elles font et pourquoi elles étaient nécessaires ici.
- Les bonnes pratiques de découpage du code : plutôt que de me donner une
  architecture, Claude m'a posé des questions et montré des exemples sur
  d'autres projets, ce qui m'a aidé à décider moi-même.

## Contraintes du sujet

- Programmation orientée objet : À COMPLÉTER
- Application empaquetée par webpack : fait
- Compatible avec les 3 derniers navigateurs : fait
- Toutes les dépendances passent par webpack, pas de CDN ni de balise script
  dans le HTML, les images sont des dépendances : fait
- Deux requêtes fetch dépendantes l'une de l'autre : fait
- Versionnement git avec des commits réguliers : fait

## Auteur

Pierre Puget, BUT Informatique 2e année, IUT d'Arles.