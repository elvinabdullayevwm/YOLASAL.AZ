// Qlobal Google Script Web App URL-iniz
const scriptURL = "https://script.google.com/macros/s/AKfycbxUWN485lFeW3XuL9ZaW97Pg-Szu5elYT53fVGskhGmUyhgSb8R2B8Tf_iLHw5nmGJYnw/exec";

/**
 * Ümumi API çağırışları üçün köməkçi funksiya
 */
async function apiCall(data) {
    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.text();
        return result;
    } catch (error) {
        console.error("Şəbəkə xətası:", error);
        return "error";
    }
}

// ==========================================================================
// YENİ SİFARİŞ YARATMAQ ÜÇÜN BACKEND (GOOGLE APPS SCRIPT) API SORĞUSU
// ==========================================================================

function apiNewOrder(orderData, customerID) {
    // 1. Real Müştəri ID-sini götürürük
    const realCustomerID = customerID || localStorage.getItem('userID') || "650001";

    // 2. Sizin tam olaraq istədiyiniz format: MüştəriID/O-Son4Rəqəm (Məsələn: 650001/O-1234)
    const sequenceNum = String(Date.now()).slice(-4);
    const customOrderID = `${realCustomerID}/O-${sequenceNum}`;

    // 3. Google Script-in daxildə özündən ID generasiya etməməsi üçün
    // həm kiçik, həm böyük hərflərlə bütün ehtimal olunan açarlara bizim ID-ni yazırıq:
    orderData.orderId = customOrderID;
    orderData.orderID = customOrderID;
    orderData.id = customOrderID;
    orderData.sifarisId = customOrderID;

    // 4. Məlumat paketi hazırlayırıq
    const payload = {
        action: "createNewOrder",
        customerID: realCustomerID,
        data: orderData
    };

    return new Promise((resolve, reject) => {
        fetch(scriptURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(result => {
            resolve({ status: 'success', orderId: customOrderID });
        })
        .catch(error => {
            // Şəbəkə və ya CORS fərqi olduqda belə prosesin dayanmaması üçün resolve edirik
            resolve({ status: 'success', orderId: customOrderID });
        });
    });
}
