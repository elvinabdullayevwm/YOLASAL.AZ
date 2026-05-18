// ==========================================================================
// YOLASAL - F5 PROBLEMİNİ KÖKÜNDƏN DETEKTİV EDƏN TAM KOD
// ==========================================================================

/**
 * 1. SƏHİFƏLƏRİ GÖSTƏRƏN VƏ GİZLƏDƏN SESSİYA FUNKSİYASI
 */
function showSection(sectionId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userID = localStorage.getItem('userID');

    console.log("=== showSection İşə Düşdü ===");
    console.log("İstənilən Səhifə ID-si:", sectionId);
    console.log("Yaddaşda isLoggedIn:", isLoggedIn);
    console.log("Yaddaşda userID:", userID);

    // Əgər istifadəçi giriş etməyibsə, onu məcburi login-ə yönləndiririk
    if ((isLoggedIn !== 'true' || !userID) && sectionId !== 'login-section' && sectionId !== 'register-section') {
        console.log("İstifadəçi tapılmadı! Giriş səhifəsinə yönləndirilir...");
        sectionId = 'login-section';
    }

    // Əgər giriş edibsə və F5-dən sonra səhvən login açılmaq istəyirsə, marketplace-ə göndər
    if (isLoggedIn === 'true' && userID && (sectionId === 'login-section' || sectionId === 'register-section' || !sectionId)) {
        console.log("İstifadəçi artıq sistemdədir! Marketplace açılır...");
        sectionId = 'marketplace-section';
    }

    // Proqramındakı bütün ehtimal olunan bölmə ID-ləri
    const sections = ['login-section', 'register-section', 'marketplace-section', 'dashboard-section'];
    
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
        } else {
            console.warn(`DİQQƏT: HTML-də '${id}' ID-li bir element tapılmadı!`);
        }
    });

    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
        targetEl.style.display = 'block';
        console.log(`UĞURLU: '${sectionId}' səhifəsi ekranda göstərildi.`);
    } else {
        console.error(`XƏTA: '${sectionId}' ekranda göstərilə bilmədi, çünki HTML-də yoxdur!`);
    }
}

/**
 * 2. İSTİFADƏÇİ GİRİŞ FUNKSİYASI
 */
async function login(email, pass) {
    if (!email || !pass) {
        alert("Bütün xanaları doldurun!");
        return;
    }

    const requestData = {
        action: "login",
        email: email,
        password: pass
    };

    console.log("Serverə login sorğusu göndərilir...", requestData);
    const response = await apiCall(requestData);
    console.log("Serverdən gələn cavab:", response);
    
    if (response.includes("Uğurlu") || response.includes("Login sorğusu")) {
        // Məlumatları brauzerin daimi yaddaşına yazırıq
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userID', '650001'); 
        
        console.log("Giriş məlumatları localStorage-a yazıldı!");
        alert("Giriş edildi!");
        
        showSection('marketplace-section');
    } else {
        alert("Server cavabı: " + response);
    }
}

/**
 * 3. SİSTEMDƏN ÇIXIŞ
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userID');
    alert("Sistemdən çıxış edildi!");
    showSection('login-section');
}

/**
 * 4. F5 OLUNANDA YADDAŞI ANINDA OXUYAN AVTOMATİK APARAT
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log("Səhifə yükləndi və ya F5 edildi. Yaddas yoxlanılır...");
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userID = localStorage.getItem('userID');

    if (isLoggedIn === 'true' && userID) {
        showSection('marketplace-section');
    } else {
        showSection('login-section');
    }
});
