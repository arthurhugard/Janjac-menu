# Alertes push "même tablette verrouillée" — installation

C'est la partie la plus technique de tout ce qu'on a construit. Elle nécessite d'utiliser
la ligne de commande une fois pour déployer une petite fonction sur Supabase. Suivez les
étapes dans l'ordre ; si une erreur apparaît à une étape, copiez-la moi telle quelle.

⚠️ Limite importante à connaître avant de commencer : sur iPad/iPhone (Safari), les
notifications push ne fonctionnent QUE si la tablette a "ajouté le site à l'écran d'accueil"
(comme une app). Depuis un onglet Safari classique, ça ne fonctionnera pas. Sur tablette
Android (Chrome), ça fonctionne directement depuis le navigateur, sans rien ajouter.

## Étape 1 — Installer l'outil Supabase (une seule fois sur votre ordinateur)

```bash
npm install -g supabase
supabase login
```

Une fenêtre de navigateur s'ouvre pour vous connecter à votre compte Supabase.

## Étape 2 — Relier ce projet à votre base Supabase

Récupérez votre "Project Ref" : Supabase Dashboard → Project Settings → General →
"Reference ID" (ex. `dptapivncwuffdevptrq`, visible aussi dans l'URL de votre projet).

```bash
supabase link --project-ref VOTRE_PROJECT_REF
```

## Étape 3 — Générer les clés VAPID (identité de votre serveur de notifications)

```bash
npx web-push generate-vapid-keys
```

Ça affiche deux clés : **Public Key** et **Private Key**. Gardez les deux de côté.

## Étape 4 — Enregistrer les clés comme secrets Supabase

```bash
supabase secrets set VAPID_PUBLIC_KEY="collez_la_clé_publique_ici"
supabase secrets set VAPID_PRIVATE_KEY="collez_la_clé_privée_ici"
```

## Étape 5 — Déployer la fonction

Le dossier `supabase-functions-notify-call` fourni contient le fichier `index.ts`.
Placez-le dans votre projet local à l'emplacement `supabase/functions/notify-call/index.ts`
(créez les dossiers si besoin), puis :

```bash
supabase functions deploy notify-call --no-verify-jwt
```

## Étape 6 — Coller la clé publique dans le site

Ouvrez `index.html`, cherchez la ligne :
```js
const VAPID_PUBLIC_KEY = 'REPLACE_ME';
```
Remplacez `REPLACE_ME` par votre **Public Key** de l'étape 3, puis redéployez le site
(commit + push sur GitHub, Vercel redéploie automatiquement).

## Étape 7 — Créer le déclencheur (Database Webhook)

1. Supabase Dashboard → **Database → Webhooks** → **Create a new webhook**.
2. Nom : `notify-server-call` (libre).
3. Table : `server_calls`.
4. Événements : cochez uniquement **Insert**.
5. Type : **Supabase Edge Functions**.
6. Edge Function : sélectionnez `notify-call`, méthode `POST`, timeout `1000`.
7. HTTP Headers : cliquez "Add new header" → "Add auth header with service key"
   (cela ajoute automatiquement l'en-tête d'autorisation nécessaire).
8. Enregistrez.

## Étape 8 — Activer les alertes sur la tablette

1. Sur la tablette, ouvrez l'espace gérant → bouton **🛎 Service**.
2. Appuyez sur **🔔 Activer les alertes**.
3. Acceptez la demande de permission de notifications du navigateur.

## Tester

Depuis un autre téléphone, scannez le QR code de la carte et appuyez sur
"🔔 Appeler un serveur". La tablette (même verrouillée, écran éteint) doit recevoir une
notification dans les quelques secondes.

## En cas de problème

- Copiez-moi le message d'erreur exact (terminal, ou console du navigateur avec F12).
- Vérifiez dans Supabase Dashboard → Database → Webhooks que le webhook a bien été
  déclenché (onglet "Logs") lors de votre test.
- Vérifiez Edge Functions → notify-call → Logs pour voir si la fonction a bien reçu
  l'appel et ce qu'elle a répondu.
