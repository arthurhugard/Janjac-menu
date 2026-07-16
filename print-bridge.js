// ============================================================
// Pont d'impression local — à faire tourner sur un ordinateur
// allumé, connecté au même réseau que votre imprimante Mews.
//
// Ce programme :
//  1. Vérifie toutes les 4 secondes s'il y a un nouveau ticket
//     à imprimer (table print_jobs dans Supabase)
//  2. L'envoie à l'imprimante en ESC/POS (protocole standard
//     des imprimantes tickets, dont les Mews)
//  3. Marque le ticket comme imprimé
//
// Aucune installation de dépendance nécessaire : uniquement
// des modules intégrés à Node.js (18 ou plus récent).
// ============================================================

// ---------- À REMPLIR ----------
const SUPABASE_URL = "https://VOTRE-PROJET.supabase.co";
// ⚠️ Ceci est la clé "service_role", PAS la clé "anon" utilisée dans le site.
// Elle donne un accès total à la base : gardez ce fichier UNIQUEMENT sur cet
// ordinateur, ne le mettez jamais sur GitHub ni sur le site web.
// Vous la trouvez dans Supabase > Project Settings > API > service_role.
const SUPABASE_SERVICE_ROLE_KEY = "VOTRE-CLE-SERVICE-ROLE";
const PRINTER_PORT = 9100; // port standard des imprimantes tickets réseau
const POLL_INTERVAL_MS = 4000;
// --------------------------------

const net = require('net');

async function fetchPendingJobs(){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/print_jobs?status=eq.pending&order=created_at.asc`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if(!res.ok){ console.error('Erreur de récupération des tickets:', res.status, await res.text()); return []; }
  return res.json();
}

async function markJob(id, status){
  await fetch(`${SUPABASE_URL}/rest/v1/print_jobs?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ status, printed_at: status === 'printed' ? new Date().toISOString() : null }),
  });
}

function printToEscPos(ip, text){
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => { socket.destroy(); reject(new Error('Délai dépassé (imprimante injoignable)')); }, 8000);

    socket.connect(PRINTER_PORT, ip, () => {
      const ESC_INIT = Buffer.from([0x1B, 0x40]);       // initialise l'imprimante
      const LINE_FEEDS = Buffer.from([0x0A, 0x0A, 0x0A]); // avance le papier avant la découpe
      const CUT = Buffer.from([0x1D, 0x56, 0x01]);        // découpe partielle

      const body = Buffer.from(text.replace(/\n/g, '\r\n') + '\r\n', 'utf8');
      socket.write(Buffer.concat([ESC_INIT, body, LINE_FEEDS, CUT]));
      socket.end();
    });

    socket.on('close', () => { clearTimeout(timeout); resolve(); });
    socket.on('error', (err) => { clearTimeout(timeout); reject(err); });
  });
}

async function tick(){
  try{
    const jobs = await fetchPendingJobs();
    for(const job of jobs){
      const ip = job.printer_ip;
      if(!ip){
        console.error(`Ticket ${job.id} : aucune adresse IP d'imprimante définie (Réglages > Imprimante cuisine dans l'app).`);
        await markJob(job.id, 'error');
        continue;
      }
      try{
        await printToEscPos(ip, job.raw_text);
        await markJob(job.id, 'printed');
        console.log(`✅ Ticket ${job.id} imprimé sur ${ip}`);
      }catch(err){
        console.error(`❌ Échec d'impression du ticket ${job.id} sur ${ip} :`, err.message);
        await markJob(job.id, 'error');
      }
    }
  }catch(err){
    console.error('Erreur générale:', err.message);
  }
}

console.log('Pont d\'impression démarré. Vérification toutes les', POLL_INTERVAL_MS / 1000, 'secondes...');
console.log('Laissez cette fenêtre ouverte pendant le service.');
tick();
setInterval(tick, POLL_INTERVAL_MS);
