function doPost(e) {
  try {
    // 1. Gələn paketi açırıq
    var data = JSON.parse(e.postData.contents);
    var action = data.action; // "login", "createOrder" və s.
    
    // 2. Dispetçer məntiqi (Routing)
    if (action === "createOrder") {
      // LogisticsEngine.gs-dəki funksiyanı çağırırıq
      var newID = generateID(data.sheetName, data.userId, data.prefix);
      
      // Database.gs-dəki funksiya ilə bazaya yazırıq
      appendToSheet(data.sheetName, [data.userId, newID, data.details, new Date()]);
      
      return ContentService.createTextOutput("Uğurlu: Yeni ID yaradıldı - " + newID);
    }
    
    if (action === "login") {
      // Bura gələcəkdə AuthProvider.gs-i bağlayacağıq
      return ContentService.createTextOutput("Login sorğusu qəbul edildi");
    }

    return ContentService.createTextOutput("Xəta: Naməlum əmr!");

  } catch (f) {
    return ContentService.createTextOutput("Backend Xətası: " + f.toString());
  }
}
// ==========================================================================
// GOOGLE APPS SCRIPT - YENİ SİFARİŞİN ORDERS VƏRƏQİNƏ YAZILMASI
// ==========================================================================

/**
 * Frontend-dən gələn POST istəklərini idarə edən funksiya (Mövcud doPost daxilinə inteqrasiya üçün)
 */
function doPost(e) {
  // Mövcud doPost funksiyanızın digər kodları bura toxunmadan üst hissədə qalmalıdır
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    
    // YENİ SİFARİŞ YARATMA ƏMƏLİYYATI
    if (action === "createNewOrder") {
      return ContentService.createTextOutput(JSON.stringify(saveNewOrderToSheet(requestData)))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Mövcud olan digər action şərtləriniz (Məsələn: login, register və s.) burada davam edir...
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 16 form məlumatını, avtomatik ID və Statusları 19 sütunlu Orders vərəqinə yazan əsas funksiya
 */
function saveNewOrderToSheet(request) {
  try {
    // Sənin Google Sheet faylını ID və ya cari aktiv fayl olaraq açırıq
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Orders"); // İşçi vərəqinin adı tam olaraq "Orders" olmalıdır
    
    if (!sheet) {
      return { "status": "error", "message": "'Orders' adlı işçi vərəqi tapılmadı!" };
    }
    
    var customerID = request.customerID;
    var data = request.data;
    
    // 1. Unikal Sifariş ID-sinin generasiya edilməsi (Məs: ORD-1715978432)
    var timestamp = new Date().getTime();
    var orderID = "ORD-" + timestamp;
    
    // 2. Statusun avtomatik təyin edilməsi
    var status = "Aktiv";
    
    // 3. Əlavə Qeyd boşdursa defolt olaraq "-" qoyulur
    var notes = data.notes ? data.notes : "-";
    
    // Google Sheet-dəki 19 sütunlu arxitekturaya tam uyğun ardıcıllıq (A-dan S-ə qədər)
    // Sütun düzülüşü: [Müştəri ID, Malın növü, Malın adı, Malın materialı, Sınma həssaslığı, Çəkisi, Eni, Uzunluğu, Hündürlüyü, Təhvil alınacaq şəhər, Təhvil alınacaq konkret ünvan, Təslim ediləcək şəhər, Təslim ediləcək konkret ünvan, Təhvil tarixi, Təslim tarixi, Büdcə, Status, Qeyd, Sifariş ID]
    var rowData = [
      customerID,          // A sütunu: Müştəri ID
      data.goodType,       // B sütunu: Malın növü
      data.goodName,       // C sütunu: Malın adı
      data.material,       // D sütunu: Malın materialı
      data.fragility,      // E sütunu: Sınma həssaslığı
      data.weight,         // F sütunu: Çəkisi (Dəyər + Vahid)
      data.width,          // G sütunu: Eni (Dəyər + Vahid)
      data.length,         // H sütunu: Uzunluğu (Dəyər + Vahid)
      data.height,         // I sütunu: Hündürlüyü (Dəyər + Vahid)
      data.pickupCity,     // J sütunu: Təhvil alınacaq şəhər
      data.pickupAddress,  // K sütunu: Təhvil alınacaq konkret ünvan
      data.dropCity,       // L sütunu: Təslim ediləcək şəhər
      data.dropAddress,    // M sütunu: Təslim ediləcək konkret ünvan
      data.pickupDate,     // N sütunu: Təhvil tarixi
      data.dropDate,       // O sütunu: Təslim tarixi
      data.budget,         // P sütunu: Büdcə (Dəyər + Valyuta)
      status,              // Q sütunu: Status (Avtomatik: Aktiv)
      notes,               // R sütunu: Qeyd
      orderID              // S sütunu: Sifariş ID
    ];
    
    // Məlumatı ən aşağı boş sətrə əlavə edirik
    sheet.appendRow(rowData);
    
    return { 
      "status": "success", 
      "message": "Sifariş uğurla yadda saxlanıldı", 
      "orderID": orderID 
    };
    
  } catch (err) {
    return { "status": "error", "message": "Backend xətası: " + err.toString() };
  }
}
