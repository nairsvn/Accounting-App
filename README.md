# Odakkuzhal – Treasurer's Books

A single-file accounting app for **Odakkuzhal (Marol Malayali Samajam)**, Regd. No. F-16615 (Mumbai) under the Bombay Public Trusts Act, 1950.

## Two editions

| | Cloud edition (recommended) | Offline edition |
|---|---|---|
| File | `cloud/odakkuzhal-books.html` | `index.html` |
| Where it runs | Live at https://claude.ai/artifact/8puGb4PsEfet472fqjZ9dp (sign in to claude.ai) | Open the file in any browser |
| Where entries are kept | Cloud database. Phone and laptop stay in sync live. | Only in that one browser |
| Who can change entries | Only the owner (and anyone given Editor access) | Whoever has the device |

The cloud edition stores the chart of accounts and opening balances in `books/config`, and each entry as one document in `txns/`. To change the live page, publish `cloud/odakkuzhal-books.html` to the same artifact URL.

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
