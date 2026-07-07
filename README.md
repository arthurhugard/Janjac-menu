# Carte de restaurant — mise en ligne (Supabase + Vercel)

Ce dossier contient une application complète et fonctionnelle :
- `index.html` — l'application (carte client bilingue FR/EN + espace gérant)
- `config.js` — vos identifiants Supabase (à remplir, étape 1)
- `supabase-schema.sql` — le script à exécuter dans Supabase (étape 1)

Il n'y a **aucune installation ni build** à faire : ce sont des fichiers statiques.

---

## Étape 1 — Créer le projet Supabase (la base de données)

1. Allez sur [supabase.com](https://supabase.com), créez un compte gratuit, puis **New project**.
2. Une fois le projet créé, ouvrez **SQL Editor** (menu de gauche) → **New query**.
3. Collez tout le contenu du fichier `supabase-schema.sql` et cliquez **Run**.
   → Cela crée les tables, sécurise les écritures (RLS), active les mises à jour en direct, et ajoute 4 catégories de départ.
4. Créez votre compte gérant : allez dans **Authentication → Users → Add user**, entrez votre email et un mot de passe. C'est ce compte que vous utiliserez pour vous connecter à l'espace gérant (plus besoin de code PIN — c'est plus sûr).
5. Récupérez vos identifiants : **Project Settings (⚙️) → API** :
   - **Project URL**
   - **anon public key**

## Étape 2 — Remplir `config.js`

Ouvrez `config.js` et remplacez les deux valeurs par celles récupérées à l'étape 1 :

```js
export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

La clé "anon" est publique par nature (c'est comme ça que Supabase fonctionne côté navigateur) — elle est protégée par les règles de sécurité (RLS) définies dans le script SQL : n'importe qui peut lire la carte, mais seule une personne connectée avec le compte gérant peut la modifier.

## Étape 3 — Déployer sur Vercel

**Option la plus simple (sans ligne de commande) :**
1. Mettez ce dossier dans un dépôt GitHub (créez un nouveau repo, glissez les 3 fichiers dedans).
2. Allez sur [vercel.com](https://vercel.com) → **Add New → Project** → importez ce dépôt GitHub.
3. Vercel détecte un site statique automatiquement : laissez les réglages par défaut et cliquez **Deploy**.
4. Vous obtenez une adresse du type `https://votre-projet.vercel.app`.

**Option en ligne de commande :**
```bash
npm i -g vercel
cd menu-app
vercel
```
Suivez les instructions à l'écran (connexion, choix du projet). Vercel vous donne l'adresse finale.

## Étape 4 — Générer le QR code

Une fois le site en ligne :
1. Ouvrez `https://votre-projet.vercel.app/#gestion`, connectez-vous avec votre compte gérant.
2. Allez dans l'onglet **QR code** → imprimez-le sur vos tables.

Comme l'adresse Vercel est maintenant fixe, le QR code fonctionnera de façon permanente.

## Utilisation au quotidien

- **Espace gérant** (`/#gestion`) : ajoutez vos plats en français, remplissez les champs anglais quand vous avez le temps (ce n'est pas obligatoire — si un champ anglais est vide, le client verra la version française). Pendant le service, basculez "Disponible / Rupture de stock" en un tap.
- **Client** : scanne le QR code, voit la carte, peut basculer FR/EN en haut à droite. La carte se met à jour en direct, sans recharger la page.

## Mise à jour — Boissons, allergènes, pictogrammes

Si votre projet Supabase existait déjà avant cette mise à jour, exécutez en plus, une seule fois, le fichier `migration-boissons-allergenes.sql` (SQL Editor → New query → coller → Run). Il ajoute :
- les catégories de boissons (Cocktails, Bières, Softs, Vins, Cidres),
- la table des options du bar à mocktails signature,
- les champs allergènes et pictogramme sur chaque plat/boisson.

Si vous créez un tout nouveau projet Supabase, `supabase-schema.sql` seul suffit — il contient déjà tout.

## Mise à jour — Ordre personnalisé, Espagnol/Allemand, allergènes normalisés

Exécutez en plus, une seule fois, `migration-ordre-langues-allergenes.sql` dans Supabase (SQL Editor → New query → Run). Il ajoute :
- l'ordre personnalisé (glisser-déposer) des catégories et des plats/boissons,
- l'espagnol et l'allemand comme langues supplémentaires (en plus du FR/EN),
- la liste normalisée des 14 allergènes réglementaires UE (cases à cocher), en plus de la note libre déjà existante.

Si vous créez un tout nouveau projet Supabase, `supabase-schema.sql` seul suffit — il contient déjà tout, y compris cette mise à jour.

## Mise à jour — Bouton Afficher/Masquer les Coups de Cœur

Exécutez `migration-toggle-highlights.sql` une seule fois dans Supabase. Le bouton apparaît ensuite dans l'onglet **Réglages** de l'espace gérant.

## Mise à jour — Photos, recherche/filtres, mode clair/sombre

Exécutez `migration-photos.sql` une seule fois dans Supabase (ajoute juste le champ photo).
La recherche, les filtres par pictogramme/allergène, et le mode clair/sombre ne nécessitent aucune modification de base de données — ils fonctionnent dès que le nouveau `index.html` est en ligne.

Pour les photos : collez simplement un lien d'image (URL) dans le champ dédié sous chaque plat, dans l'onglet Carte de l'espace gérant — pas besoin d'héberger vous-même l'image (Imgur, Google Drive en partage public, etc. fonctionnent).

## Mise à jour — Appel serveur, Histoire du restaurant, Instagram

Exécutez `migration-appels-histoire-instagram.sql` une seule fois dans Supabase. Il ajoute :
- la table des appels serveur (bouton 🔔 côté client, onglet **Appels** côté gérant),
- les champs "Histoire du restaurant" (multilingue, onglet Réglages),
- le lien Instagram (onglet Réglages).

La fiche cuisine imprimable (bouton "🖨 Fiche cuisine" en haut de l'espace gérant) et la détection automatique de la langue du navigateur ne nécessitent aucune migration.

## Mise à jour — Stock cuisine, tablette, sections dépliantes

Exécutez `migration-stock-cuisine.sql` une seule fois dans Supabase (ajoute le compteur de stock).

- **Espace gérant adapté tablette** : sur écran ≥ 680px de large, boutons, textes et interrupteurs sont agrandis pour un usage tactile confortable.
- **Sections et plats dépliants** : dans l'onglet Carte, chaque catégorie et chaque plat est replié par défaut (flèche ▸/▾) pour réduire l'encombrement visuel. Le nombre d'articles est indiqué à côté du nom de la catégorie.
- **📦 Stock cuisine** (remplace l'ancienne fiche imprimable) : bouton en haut de l'espace gérant. Interface plein écran, noir et blanc, pensée pour tablette en service :
  - Pour activer le suivi d'un plat : dépliez-le dans l'onglet Carte et renseignez un nombre dans le champ **Stock**.
  - Chaque plat suivi apparaît comme une grande étiquette avec son compteur. Un tap sur l'étiquette = -1 (usage en service). Les boutons +/- permettent d'ajuster.
  - Un plat à 0 passe automatiquement en rupture sur la carte client ; il repasse disponible dès que le compteur remonte au-dessus de 0.
  - Bouton "🔄 Réinitialiser" : remet tous les compteurs suivis à 0 (à ressaisir en début de service).
  - Seuls les **plats** (pas les boissons) sont suivis dans cette version.

## Mise à jour — Réservations, écran Service, alertes push

Exécutez `migration-reservations-service-push.sql` une seule fois dans Supabase.

**Nouveaux fichiers à ajouter dans votre dépôt GitHub (à la racine, à côté de `index.html`) :**
- `sw.js` — nécessaire pour les alertes push.
- `supabase-functions-notify-call/index.ts` — à placer dans `supabase/functions/notify-call/index.ts` de votre projet Supabase local (pas sur Vercel), voir `INSTRUCTIONS-push-notifications.md`.

**Page de réservation** — séparée de la carte, à donner à la réception :
`https://votre-domaine/#reservation`. Formulaire client (date, créneau, couverts, nom,
téléphone, n° de chambre) + bouton "Voir la carte". Aucun lien vers cette page n'apparaît
sur la carte scannée en salle. Les horaires (18h-21h par tranches de 15 min par défaut)
se configurent dans Réglages → Créneaux de réservation.

**Écran 🛎 Service** (bouton dans l'espace gérant) — combine :
- les appels serveur en attente (avec bouton "Traité"),
- les réservations du jour (ou d'une date choisie), avec attribution de table,
  bouton "✓ Arrivé" (démarre un minuteur d'occupation), "Terminé" et "Annuler",
- un ajout rapide de réservation prise par téléphone,
- un historique du jour (terminées/annulées) replié par défaut.

**Alertes push (même tablette verrouillée)** — c'est la partie la plus technique :
suivez `INSTRUCTIONS-push-notifications.md` pas à pas (génération de clés VAPID,
déploiement d'une petite fonction Supabase, création d'un Database Webhook). Sur iPad,
le site doit être ajouté à l'écran d'accueil pour que ça fonctionne (limite d'Apple).

## Pour aller plus loin (optionnel)
- Traduction automatique : je peux ajouter un bouton "suggérer une traduction" côté gérant si vous voulez brancher une API de traduction plus tard (Google Translate, DeepL) — cela nécessite une clé API payante de votre côté.
- Nom de domaine personnalisé (ex. `carte.votrerestaurant.fr`) : se configure directement dans Vercel → Project Settings → Domains.
