function getSheetData(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name).getDataRange().getValues();
}

function appendToSheet(name, data) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name).appendRow(data);
}
