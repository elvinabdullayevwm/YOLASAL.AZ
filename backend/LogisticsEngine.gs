function generateID(sheetName, userId, prefixChar) {
    var rows = getSheetData(sheetName);
    var count = 0;
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === userId.toString()) count++;
    }
    var serialPart = ("000" + (count + 1)).slice(-4);
    return userId + "/" + prefixChar + serialPart;
}
