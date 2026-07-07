// Supabase Edge Function : notify-call
//
// Rôle : envoie une vraie notification push (même tablette verrouillée) à tous
// les appareils abonnés, dès qu'un client appuie sur "Appeler un serveur".
//
// Déploiement : voir le fichier INSTRUCTIONS-push-notifications.md fourni à côté.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

webpush.setVapidDetails("mailto:contact@arthurhugard.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Le Database Webhook de Supabase envoie { type, table, record, old_record }
    const record = payload.record;
    if (!record || record.status !== "pending") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
    if (error) throw error;

    const notifPayload = JSON.stringify({
      title: "🔔 Appel serveur",
      body: record.table_label ? `Table ${record.table_label}` : "Un client demande un serveur.",
      url: "/#gestion",
    });

    const results = await Promise.allSettled(
      (subs || []).map((s) =>
        webpush
          .sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, notifPayload)
          .catch(async (err) => {
            // Nettoyage automatique des abonnements expirés / révoqués
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", s.id);
            }
            throw err;
          })
      )
    );

    return new Response(JSON.stringify({ sent: results.length }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
