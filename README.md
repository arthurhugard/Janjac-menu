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

## Pour aller plus loin (optionnel)
- Traduction automatique : je peux ajouter un bouton "suggérer une traduction" côté gérant si vous voulez brancher une API de traduction plus tard (Google Translate, DeepL) — cela nécessite une clé API payante de votre côté.
- Nom de domaine personnalisé (ex. `carte.votrerestaurant.fr`) : se configure directement dans Vercel → Project Settings → Domains.
