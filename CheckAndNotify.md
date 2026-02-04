# CheckAndNotify (Google Apps Script)

Overview
- This script monitors a specific Google Drive folder and sends an email when new files are uploaded on Mondays.
- It remembers which files have already triggered notifications using `PropertiesService` and clears that memory weekly.

Key functions
- `checkMondayFile()` — runs periodically and:
  - verifies it's Monday
  - scans the configured folder for files created today
  - sends an email for each newly detected file (to the configured `recipient`)
  - records file IDs in `ScriptProperties` to avoid duplicate emails
- `clearMemory()` — deletes all `ScriptProperties` entries (weekly cleanup).

Trigger schedule
- `checkMondayFile` should run every 15 minutes on Mondays.
- `clearMemory` should run once weekly (example: Tuesday) to reset the memory.

Setup
1. Edit the script to set your folder and recipient:
   - `folderId` — replace with your Drive folder ID.
   - `recipient` — set the email address to receive notifications.

Install triggers
- Using the Apps Script editor UI: create two time-driven triggers:
  - `checkMondayFile` → Time-driven → Week timer → Monday → Every 15 minutes
  - `clearMemory` → Time-driven → Week timer → Tuesday → (pick an hour)

- Programmatic example (add and run once from the editor):

```javascript
function createTriggers() {
  // Run every 15 minutes on Mondays
  ScriptApp.newTrigger('checkMondayFile')
    .timeBased()
    .everyMinutes(15)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .create();

  // Run weekly on Tuesdays at 01:00
  ScriptApp.newTrigger('clearMemory')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.TUESDAY)
    .atHour(1)
    .create();
}
```