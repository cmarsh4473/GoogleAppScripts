# GoogleSheetExtAcctCreation (Google Apps Script)

Overview
- This script extends a Google Sheet (populated from a Google Form) to automate Google Workspace account creation with admin approval.
- It provides a custom menu in the sheet to run the approval-processing flow.

Key behavior
- Adds a custom menu item `🚀 Workspace Admin → Process Approved Accounts` via `onOpen()`.
- `processApprovals()` scans the sheet rows (skips header) and for each row where the Approval checkbox (Column F) is checked and Status (Column G) is not `Created`:
  - Builds a workspace email using sanitized `FirstName.LastName@sgbcnc.org`.
  - Checks for duplicates via `userExists()` (uses `AdminDirectory.Users.get`).
  - Creates the user with a default `INITIAL_PASSWORD` and forces password change on first login.
  - Updates the Status column to `Created` (or an error message) and colors the cell to reflect success, duplicate, or error.
  - Sends a welcome email to the personal email (Column D) using `sendWelcomeEmail()` when available.
- At the end, sends a summary email to the script executor and shows a UI alert.

Configuration
- Domain: `DOMAIN` is set to `sgbcnc.org` in the script; change if needed.
- Initial password: `INITIAL_PASSWORD` is set in the script; update to match your policy.
- Column mapping (based on current script):
  - Column B: First Name
  - Column C: Last Name
  - Column D: Personal Email
  - Column F: Approval checkbox
  - Column G: Status (script writes `Created` / error messages)

Permissions
- The script requires the following OAuth scopes: Drive/Spreadsheet UI, MailApp, and Admin SDK (`AdminDirectory`), which requires a Workspace admin account and domain-wide privileges.
- Authorize when prompted; `AdminDirectory` operations require a user with appropriate admin privileges.

Safety & notes
- The script generates emails by concatenating sanitized first and last names; ensure this naming scheme fits your account policy.
- `INITIAL_PASSWORD` is stored in plain text in the script — consider generating secure temporary passwords or using a secret store.
- `userExists()` treats any `AdminDirectory.Users.get` failure as non-existence; network or permission errors may be misinterpreted.