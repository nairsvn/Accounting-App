// Daily backup of the Odakkuzhal books: reads Firestore with a service account
// (read-only use) and emails a JSON backup (importable in the app via
// Heads & Backup → Import) plus a CSV of all entries.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const need = k => { const v = process.env[k]; if (!v) { console.error(`Missing ${k}. Add it under GitHub → Settings → Secrets and variables → Actions.`); process.exit(1); } return v; };

const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);   // IST date
const dmy = iso => iso ? iso.split('-').reverse().join('-') : '';
const fmt = p => (p / 100).toLocaleString('en-IN', { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 });

export function buildBackup({ config, txns, members, log }) {
  const accounts = config?.accounts || [];
  const name = id => accounts.find(a => a.id === id)?.name ?? id;
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date) || (a.created || 0) - (b.created || 0));
  const balance = id => {
    const a = accounts.find(x => x.id === id); if (!a) return 0;
    return sorted.reduce((s, t) => s + (t.dr === id ? t.amount : 0) - (t.cr === id ? t.amount : 0), a.opening || 0);
  };
  const json = JSON.stringify({ version: 2, backupDate: today, org: config?.org, accounts, txns: sorted, members, log }, null, 1);
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [['Date', 'Voucher', 'Type', 'Debit head', 'Credit head', 'Amount', 'Party', 'Ref', 'Narration', 'Entered by', 'Last edited by'],
    ...sorted.map(t => [dmy(t.date), t.vno, t.kind, name(t.dr), name(t.cr), (t.amount / 100).toFixed(2), t.party, t.ref, t.narration, t.createdBy, t.lastEditedBy])]
    .map(r => r.map(q).join(',')).join('\r\n');
  const dayAgo = Date.now() - 24 * 3600e3;
  const recent = log.filter(l => l.at >= dayAgo);
  const text = [
    `Odakkuzhal books – daily backup for ${dmy(today)}`,
    '',
    `Entries in the books: ${sorted.length}`,
    `Cash in hand:  ₹ ${fmt(balance('cash'))}`,
    `Bank – NKGSB:  ₹ ${fmt(balance('bank'))}`,
    '',
    `Changes in the last 24 hours: ${recent.length}`,
    ...recent.slice(0, 50).map(l => `  • ${l.action} by ${l.by}: ${l.summary || ''}`),
    '',
    'Attached:',
    '  odakkuzhal-books-<date>.json – full backup. To restore: app → Heads & Backup → Import / restore a backup (treasurer only).',
    '  odakkuzhal-transactions-<date>.csv – all entries, opens in Excel / Google Sheets.',
    '',
    'Sent automatically by the "Daily backup" job in github.com/nairsvn/Accounting-App.',
  ].join('\n');
  return { json, csv, text, count: sorted.length };
}

async function main() {
  const sa = JSON.parse(need('FIREBASE_SERVICE_ACCOUNT'));
  const pass = need('GMAIL_APP_PASSWORD').replace(/\s+/g, '');
  const from = need('MAIL_FROM'), to = need('MAIL_TO');

  initializeApp({ credential: cert(sa) });
  const db = getFirestore();
  const [cfg, tx, mem, lg] = await Promise.all([
    db.doc('books/config').get(), db.collection('txns').get(), db.collection('members').get(), db.collection('log').get(),
  ]);
  const data = {
    config: cfg.exists ? cfg.data() : null,
    txns: tx.docs.map(d => ({ ...d.data(), id: d.id })),
    members: mem.docs.map(d => ({ email: d.id, ...d.data() })),
    log: lg.docs.map(d => d.data()).sort((a, b) => b.at - a.at),
  };
  if (!data.config) throw new Error('books/config not found – has the treasurer set up the books?');
  const b = buildBackup(data);

  const mail = nodemailer.createTransport({ service: 'gmail', auth: { user: from, pass } });
  await mail.sendMail({
    from: `Odakkuzhal Accounts <${from}>`, to,
    subject: `Odakkuzhal books backup – ${dmy(today)} (${b.count} entries)`,
    text: b.text,
    attachments: [
      { filename: `odakkuzhal-books-${today}.json`, content: b.json },
      { filename: `odakkuzhal-transactions-${today}.csv`, content: b.csv },
    ],
  });
  console.log(`Backup emailed to ${to}: ${b.count} entries, ${data.log.length} log lines.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
