/**
 * Adds a custom menu to the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Workspace Admin')
    .addItem('Process Approved Accounts', 'processApprovals')
    .addToUi();
}

/**
 * Processes approvals based on your specific column layout.
 */
function processApprovals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const DOMAIN = 'sgbcnc.org';
  const INITIAL_PASSWORD = 'WelcomeToSGB2026!'; 
  
  let createdCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  let summaryDetails = "";

  // Loop starts at 1 to skip the header row
  for (let i = 1; i < data.length; i++) {
    let firstName     = data[i][1].toString().trim(); // Col B
    let lastName      = data[i][2].toString().trim(); // Col C
    let personalEmail = data[i][3].toString().trim(); // Col D
    let isApproved    = data[i][5];                  // Col F (Checkbox)
    let status        = data[i][6];                  // Col G (Status)

    // Only run if the 'Approval' checkbox is checked and status isn't 'Created'
    if (isApproved === true && status !== 'Created') {
      
      let cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
      let cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
      let primaryEmail = `${cleanFirst}.${cleanLast}@${DOMAIN}`;

      // 1. Check for Duplicates
      if (userExists(primaryEmail)) {
        sheet.getRange(i + 1, 7).setValue('REJECTED: Duplicate Email'); // Col G
        sheet.getRange(i + 1, 7).setBackground('#fff2cc'); 
        duplicateCount++;
        summaryDetails += `❌ DUPLICATE: ${primaryEmail}\n`;
        continue;
      }

      // 2. Prepare User Resource
      let userResource = {
        primaryEmail: primaryEmail,
        name: { givenName: firstName, familyName: lastName },
        password: INITIAL_PASSWORD,
        changePasswordAtNextLogin: true
      };

      // 3. Create User and Send Welcome Email
      try {
        AdminDirectory.Users.insert(userResource);
        
        // Update Status in Column G
        sheet.getRange(i + 1, 7).setValue('Created');
        sheet.getRange(i + 1, 7).setBackground('#b7e1cd'); 
        createdCount++;
        summaryDetails += `✅ CREATED: ${primaryEmail}\n`;

        // 4. Send Welcome Email to Personal Address (Col D)
        if (personalEmail && personalEmail.includes('@')) {
          sendWelcomeEmail(personalEmail, firstName, primaryEmail, INITIAL_PASSWORD);
        }

      } catch (e) {
        sheet.getRange(i + 1, 7).setValue('Error: ' + e.message);
        sheet.getRange(i + 1, 7).setBackground('#f4cccc'); 
        errorCount++;
        summaryDetails += `⚠️ ERROR: ${primaryEmail} (${e.message})\n`;
      }
    }
  }

  // 5. Final Summary Email to Admin
  if (createdCount > 0 || duplicateCount > 0 || errorCount > 0) {
    const adminEmail = Session.getEffectiveUser().getEmail();
    const subject = `Workspace Account Creation Report - ${new Date().toLocaleDateString()}`;
    const body = `The account creation script has finished processing.\n\n` +
                 `Summary:\n` +
                 `- Users Created: ${createdCount}\n` +
                 `- Duplicates Found: ${duplicateCount}\n` +
                 `- Errors Encountered: ${errorCount}\n\n` +
                 `Details:\n${summaryDetails}\n` +
                 `Spreadsheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;

    MailApp.sendEmail(adminEmail, subject, body);
    SpreadsheetApp.getUi().alert('Process Complete. Summary email sent.');
  } else {
    SpreadsheetApp.getUi().alert('Nothing to process. Make sure "Approval" is checked.');
  }
}

/**
 * Sends a welcome email to the personal email address.
 */
function sendWelcomeEmail(toEmail, firstName, workEmail, password) {
  const subject = "Welcome! Your Saving Grace Bible Church Workspace Account";
  const body = `Hi ${firstName},\n\n` +
               `Your new sgbcnc.org account is ready.\n\n` +
               `Username: ${workEmail}\n` +
               `Temp Password: ${password}\n\n` +
               `Login here: https://accounts.google.com\n\n` +
               `Note: You will be asked to create a permanent password when you first sign in.`;
               
  MailApp.sendEmail(toEmail, subject, body);
}

/**
 * Checks if a user already exists in the Directory.
 */
function userExists(email) {
  try {
    AdminDirectory.Users.get(email);
    return true;
  } catch (e) {
    return false;
  }
}