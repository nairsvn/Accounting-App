# Odakkuzhal – Treasurer's Books

A single-file accounting app for **Odakkuzhal (Marol Malayali Samajam)**, Regd. No. F-16615 (Mumbai) under the Bombay Public Trusts Act, 1950.

## Live app

**https://nairsvn.github.io/Accounting-App/** – sign in with Google. Only Gmail addresses on the members list can open the books.

| Role | Can do |
|---|---|
| treasurer | Everything: entries, delete, opening balances, year-end, members, import |
| editor | Add and edit entries (cannot delete) |
| viewer | See books and statements |

Every change is recorded in an append-only **Change log** (who, what, when).

### How it is built
- `index.html` – the whole app (no build step). Hosted on GitHub Pages from `main`.
- Login: Firebase Authentication (Google). Data: Cloud Firestore, project `odakkuzhal-books`, region `asia-south1`.
- Firestore layout: `members/{email}` (role), `books/config` (heads + opening balances), `txns/{id}` (one entry each, amounts in paise), `log/{id}` (change log).
- `firestore.rules` – the access rules. Paste into Firebase console → Firestore Database → Rules → Publish whenever it changes.
- The Firebase web config in `index.html` is public by design; security comes from the rules.

### Daily email backup
`.github/workflows/daily-backup.yml` runs `backup/backup.mjs` every day at about 06:00 IST (GitHub may start a few minutes late). It reads the books from Firestore and emails sree.vn@gmail.com a JSON backup (restorable in the app via Heads & Backup → Import) and a CSV of all entries. It needs two repository secrets:
- `FIREBASE_SERVICE_ACCOUNT` – contents of a Firebase service-account key file (Project settings → Service accounts → Generate new private key).
- `GMAIL_APP_PASSWORD` – a Google App Password for sree.vn@gmail.com (needs 2-Step Verification).

Test it any time from the Actions tab → Daily backup → Run workflow.

### Other editions (kept for reference)
- `cloud/odakkuzhal-books.html` – claude.ai artifact edition (https://claude.ai/artifact/8puGb4PsEfet472fqjZ9dp).
- `offline.html` – single-browser edition, stores data in the browser only.

## What it does

- **Opening balances** are the audited Balance Sheet as on 31-03-2026 (Malvika & Associates): Cash ₹10,351, NKGSB Bank ₹2,30,417, FDR ₹8,03,313 + accrued interest ₹16,244, fixed assets, TDS receivable, Corpus, Building Fund, I&E balance and liabilities.
- **Entries**: Receipt (money in), Payment (money out), Cash ⇄ Bank, and Journal (non-cash: FD interest, TDS, depreciation, provisions). Every entry gets a voucher number such as `R/2026-27/001`.
- **Books**: Cash Book, Bank Book, and a ledger for any head.
- **Statements** in the same layout as the audited accounts:
  - Income & Expenditure Account (Schedule IX), with the audited 2025-26 figures as the previous-year column
  - Balance Sheet (Schedule VIII), which checks itself and shows whether it tallies
  - Receipts & Payments Account
- **Year-end**: suggested depreciation at the audited rates (AC/Furniture/Music/Premises 10%, Home Theatre 25%) on the opening WDV.
- **Backup**: download and restore a `.json` backup, and export a CSV of all transactions for the CA.

## Important

Data is stored **only in the browser you use**. If you clear browser data or lose the device, the entries are gone. Download a backup regularly from *Heads & Backup* and keep it in Drive or email.

## Note on the audited Balance Sheet

The printed Home Theatre WDV of ₹107 should be ₹106 (142 − 36 depreciation @25%). With ₹107, the printed asset side adds up to ₹11,92,724 and not ₹11,92,723. The app uses ₹106, which makes both sides tally.
