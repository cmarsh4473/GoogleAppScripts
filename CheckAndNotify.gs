// --- MONITORING FUNCTION (Runs periodically on Mondays) ---
function checkMondayFile() {
  const folderId = '1dfdllQGFyvd_Vrc3PdnQBxhtCzjAgzhi'; // Replace with your Folder ID
  const recipient = 'cmarsh4473@gmail.com';
  
  // 1. CHECK IF IT IS MONDAY
  const now = new Date();
  if (now.getDay() !== 1) {
    console.log("It is not Monday. Script handling skipped.");
    return; 
  }

  // 2. CHECK FOR FILES UPLOADED TODAY
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const todayMidnight = new Date(now.setHours(0,0,0,0)); // Midnight today
  
  const scriptProperties = PropertiesService.getScriptProperties();

  while (files.hasNext()) {
    let file = files.next();
    let fileId = file.getId();

    // Check if file was created after midnight today
    if (file.getDateCreated() > todayMidnight) {
      
      // Check memory to see if we already sent an email for this file
      let alreadySent = scriptProperties.getProperty(fileId);

      if (!alreadySent) {
        // Send Email
        MailApp.sendEmail({
          to: recipient,
          subject: "New Monday File Uploaded: " + file.getName(),
          body: "A new file was just detected in your Monday folder.\n\n" +
                "File Name: " + file.getName() + "\n" +
                "Link: " + file.getUrl()
        });

        // Save ID to memory so we don't email again today
        scriptProperties.setProperty(fileId, 'TRUE');
        console.log("Email sent for: " + file.getName());
      }
    }
  }
}

// --- CLEANUP FUNCTION (Runs once a week on Tuesdays) ---
function clearMemory() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  console.log("Weekly cleanup complete. Memory wiped.");
}