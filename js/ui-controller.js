/**
 * YOLASAL - Professional UI & Logic Controller
 * Version: 2.7 (Dashboard İntellektual İdarəetmə Düymələri İnteqrasiyası ilə)
 */

// --- KONFİQURASİYA ---
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweXAWCzUo35VWaTHvRuE1LMI9fpdri5KMnAAf91noVm5ugcwDGTFRIKlf5EN2-D50Cgg/exec"; 
let generatedOtp = null;
let tempUserData = {};

// 1. ŞƏHƏR VƏ RAYONLARIN YÜKLƏNMƏSİ
const cities = ["Bakı", "Sumqayıt", "Gəncə", "Xırdalan", "Mingəçevir", "Lənkəran", "Şirvan", "Naxçıvan", "Quba", "Qusar", "Xaçmaz", "Şəki", "Qəbələ", "Şamaxı", "İsmayıllı", "Göyçay", "Ağsu", "Kürdəmir", "Ucar", "Yevlax", "Bərdə", "Tərtər", "Ağdam", "Füzuli", "Cəbrayıl", "Zəngilan", "Qubadlı", "Laçın", "Kəlbəcər", "Şuşa", "Xocalı", "Xankəndi", "Goranboy", "Naftalan", "Şəmkir", "Tovuz", "Ağstafa", "Qazax", "Gədəbəy", "Daşkəsən", "Samux", "Göygöl", "Oğuz", "Balakən", "Zaqatala", "Qax", "Siyəzən", "Şabran", "Xızı", "Qobustan", "Hacıqabul", "Saatlı", "Sabirabad", "İmişli", "Beyləqan", "Zərdab", "Biləsuvar", "Neftçala", "Salyan", "Cəlilabad", "Masallı", "Yardümlı", "Lerik", "Astara"];

document.addEventListener('DOMContentLoaded', () => {
    // Rayonları doldur
    const citySelect = document.getElementById('citySelect');
    if (citySelect) {
        citySelect.innerHTML = '<option value="">Yaşadığınız rayonu seçin *</option>'; 
        cities.sort().forEach(city => {
            let opt = document.createElement('option');
            opt.value = city; opt.innerHTML = city;
            citySelect.appendChild(opt);
        });
    }

    // 2. MOBİL MENYU İDARƏETMƏSİ (Hamburger)
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active'); 
        });
    }

    // Menyu linkinə basanda menyunu bağla (Mobil üçün)
    document.querySelectorAll('.nav-links li').forEach(link => {
        link.addEventListener('click', (e) => {
            if (e.target.closest('#userProfileArea')) return;
            if (navLinks) navLinks.classList.remove('active');
        });
    });
});

// 3. MODAL KONTROL (Giriş/Qeydiyyat)
const loginModal = document.getElementById('loginModal');

function openLogin() {
    if (loginModal) loginModal.style.display = 'flex';
}

document.getElementById('loginBtn')?.addEventListener('click', openLogin);
document.getElementById('closeLogin')?.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
});

// Pəncərələr arası keçid
document.getElementById('showReg')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginFormArea').style.display = 'none';
    document.getElementById('regFormArea').style.display = 'block';
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('regFormArea').style.display = 'none';
    document.getElementById('otpFormArea').style.display = 'none';
    document.getElementById('loginFormArea').style.display = 'block';
});

// 4. QEYDİYYAT PROSESİ
document.getElementById('startRegBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value;
    const surname = document.getElementById('regSurname').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPrefix').value + document.getElementById('regPhone').value;
    const city = document.getElementById('citySelect').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const birth = document.getElementById('regBirth').value;
    const mmc = document.getElementById('regMMC').value;
    const pass = document.getElementById('regPassword').value;

    if (!name || !surname || !email || !phone || !city || !birth || !pass) {
        alert("Zəhmət olmasa bütün vacib (*) xanaları doldurun!");
        return;
    }

    const btn = document.getElementById('startRegBtn');
    btn.disabled = true;
    btn.innerText = "Yoxlanılır...";

    try {
        const response = await fetch(`${SCRIPT_URL}?action=checkUser&email=${email}&phone=${phone}`);
        const result = await response.json();

        if (result.exists) {
            alert("Bu e-mail və ya nömrə artıq sistemdə mövcuddur!");
            btn.disabled = false;
            btn.innerText = "QEYDİYYATDAN KEÇ";
        } else {
            generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
            tempUserData = { name, surname, email, phone, city, gender, birth, mmc, pass };

            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({ action: "sendOtp", email: email, otp: generatedOtp })
            });

            document.getElementById('regFormArea').style.display = 'none';
            document.getElementById('otpFormArea').style.display = 'block';
            console.log("Sistem OTP:", generatedOtp); 
        }
    } catch (err) {
        alert("Bağlantı xətası. Yenidən cəhd edin.");
        btn.disabled = false;
        btn.innerText = "QEYDİYYATDAN KEÇ";
    }
});

// 5. OTP TƏSDİQİ VƏ AVTOMATİK GİRİŞƏ YÖNLƏNDİRMƏ
document.getElementById('verifyOtpBtn')?.addEventListener('click', async () => {
    const userOtp = document.getElementById('otpInput').value;

    if (userOtp === generatedOtp) {
        const btn = document.getElementById('verifyOtpBtn');
        btn.disabled = true;
        btn.innerText = "Tamamlanır...";

        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: JSON.stringify({ action: "registerUser", ...tempUserData })
            });
            
            alert("Qeydiyyat uğurla tamamlandı! İndi təyin etdiyiniz şifrə ilə daxil ola bilərsiniz.");
            
            document.getElementById('otpFormArea').style.display = 'none';
            document.getElementById('loginFormArea').style.display = 'block';
            
            document.getElementById('loginId').value = tempUserData.email;
            
            generatedOtp = null;
            tempUserData = {};
            btn.disabled = false;
            btn.innerText = "TƏSDİQLƏ";
        } catch (err) {
            alert("Sistem xətası.");
            btn.disabled = false;
            btn.innerText = "TƏSDİQLƏ";
        }
    } else {
        alert("Kod yanlışdır!");
    }
});

// 6. REAL GİRİŞ (LOGIN) PROSESİ
async function handleLoginProcess() {
    const loginId = document.getElementById('loginId').value.trim();
    const loginPass = document.getElementById('loginPass').value;
    const submitBtn = document.getElementById('submitLoginBtn');

    if (!loginId || !loginPass) {
        alert("Zəhmət olmasa bütün xanaları doldurun!");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Yoxlanılır...";

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "login",
                loginId: loginId,
                password: loginPass
            })
        });

        // Backend-dən gələn TEXT tipli JSON cavabını etibarlı şəkildə parse edirik (CORS sığortası)
        const textData = await response.text();
        const result = JSON.parse(textData);

        if (result.status === "Success") {
            if (loginModal) loginModal.style.display = 'none';
            
            // Məlumatları Şəxsi Kabinetə (Dashboard) doldur
            document.getElementById('dashUserName').innerText = result.name + " " + result.surname;
            document.getElementById('dashUserId').innerText = result.id;
            document.getElementById('dashUserMmc').innerText = result.mmc ? result.mmc : "Şəxsi Hesab";
            document.getElementById('dashUserPhone').innerText = result.phone;

            // Navbardakı düyməni gizlə və avatarı aktivləşdir
            const mainLoginBtn = document.getElementById('loginBtn');
            const userProfileArea = document.getElementById('userProfileArea');
            
            if (mainLoginBtn) mainLoginBtn.style.display = 'none';
            if (userProfileArea) {
                userProfileArea.style.display = 'inline-block';
                document.getElementById('userAvatarBtn').innerText = result.name.charAt(0).toUpperCase();
            }

            // Şəxsi kabinet bölməsini göstər və ekranı oraya sürüşdür
            const dashboardSection = document.getElementById('customerDashboard');
            dashboardSection.style.display = 'block';
            scrollToSection('customerDashboard');

            // İnputları təmizlə
            document.getElementById('loginId').value = "";
            document.getElementById('loginPass').value = "";

        } else {
            alert("Xəta: ID/E-mail və ya şifrə yanlışdır!");
        }
    } catch (err) {
        alert("Giriş zamanı xəta baş verdi. Şəbəkəni və ya məlumatları yoxlayın.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "DAXİL OL";
    }
}

// 7. AVATAR DROPDOWN MENYUNU AÇIB-BAĞLAMAQ
function toggleUserDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }
}

// 8. AYARLAR FUNKSİYASI
function openSettings(event) {
    if (event) event.preventDefault();
    alert("Ayarlar bölməsi tezliklə aktiv ediləcək.");
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.style.display = 'none';
}

// 9. SİSTEMDƏN ÇIXIŞ (LOGOUT)
function logoutUser(event) {
    if (event) event.preventDefault();
    
    if (confirm("Şəxsi kabinetdən çıxmaq istədiyinizə əminsiniz?")) {
        const menu = document.getElementById('userDropdownMenu');
        if (menu) menu.style.display = 'none';

        document.getElementById('customerDashboard').style.display = 'none';
        
        const mainLoginBtn = document.getElementById('loginBtn');
        const userProfileArea = document.getElementById('userProfileArea');
        
        if (mainLoginBtn) mainLoginBtn.style.display = 'inline-block';
        if (userProfileArea) userProfileArea.style.display = 'none';
        
        scrollToSection('home');
    }
}

// 10. NEW ADDTION: DASHBOARD İNTELLEKTUAL DÜYMƏLƏRİNİN İŞLƏNMƏSİ
function handleDashboardAction(actionType) {
    // Burada hər bir düymənin gələcəkdə açacağı pəncərə, modal və ya sorğular idarə olunacaq
    console.log("İcra edilən əməliyyat:", actionType);
    
    switch(actionType) {
        case 'new-order':
            alert("Yeni Sifariş Yaratma formu tezliklə bura inteqrasiya olunacaq.");
            break;
        case 'new-route':
            alert("Yeni Reys Yaratma formu tezliklə bura inteqrasiya olunacaq.");
            break;
        case 'active-orders':
            alert("Aktiv Sifarişlərinizin siyahısı yüklənir...");
            break;
        case 'active-routes':
            alert("Aktiv Reyslərinizin siyahısı yüklənir...");
            break;
        case 'in-progress-orders':
            alert("İcrada olan sifarişləriniz axtarılır...");
            break;
        case 'in-progress-routes':
            alert("İcrada olan reysləriniz axtarılır...");
            break;
        case 'delivered-orders':
            alert("Təslim edilən sifarişlərinizin arxivi açılır...");
            break;
        case 'completed-routes':
            alert("Tamamlanmış reyslərinizin arxivi açılır...");
            break;
        case 'search-orders':
            alert("Sifarişlər üçün təkmilləşdirilmiş filtr paneli hazırlanır...");
            break;
        case 'search-routes':
            alert("Reyslər üçün təkmilləşdirilmiş filtr paneli hazırlanır...");
            break;
        default:
            console.warn("Naməlum əməliyyat xətası.");
    }
}

// 11. KÖMƏKÇİ FUNKSİYALAR (Scroll & Activity)
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

// Canlı Statistika Detalları
function showLiveDetails(type) {
    const modal = document.getElementById('activityModal');
    const title = document.getElementById('modalTitle');
    const dataDiv = document.getElementById('modalData');
    
    if (modal) {
        modal.style.display = 'flex';
        title.innerText = type.replace('-', ' ').toUpperCase();
        dataDiv.innerHTML = "<p style='padding:20px; text-align:center;'>Məlumatlar yüklənir...</p>";
        
        setTimeout(() => {
            dataDiv.innerHTML = `
                <div style="padding:10px; border-bottom:1px solid #eee;"><b>ID: 650012</b> - Bakı ➔ Gəncə (Yolda)</div>
                <div style="padding:10px; border-bottom:1px solid #eee;"><b>ID: 650045</b> - Sumqayıt ➔ Quba (Yüklənir)</div>
                <div style="padding:10px; border-bottom:1px solid #eee;"><b>ID: 650089</b> - Lənkəran ➔ Bakı (Çatdı)</div>
            `;
        }, 800);
    }
}

function closeActivityModal() {
    const actModal = document.getElementById('activityModal');
    if (actModal) actModal.style.display = 'none';
}

// Pəncərə klikləri sığortası
window.onclick = function(event) {
    if (event.target == loginModal) loginModal.style.display = "none";
    if (event.target == document.getElementById('activityModal')) closeActivityModal();
    
    if (!event.target.closest('#userProfileArea')) {
        const menu = document.getElementById('userDropdownMenu');
        if (menu) menu.style.display = 'none';
    }
}
// ==========================================================================
// YENİ SİFARİŞ YARAT MODALININ İDARƏ EDİLMƏSİ VƏ VALIDASIYASI
// ==========================================================================

// Azərbaycanın rayon və şəhərlərinin tam siyahısı
const azerbaijanCities = [
    "Bakı", "Sumqayıt", "Gəncə", "Mingəçevir", "Xırdalan", "Şirvan", "Naxçıvan", "Lənkəran", 
    "Yevlax", "Şəki", "Xankəndi", "Ağcabədi", "Ağdam", "Ağdaş", "Ağstafa", "Ağsu", "Astara", 
    "Babək", "Balakən", "Bərdə", "Beyləqan", "Biləsuvar", "Cəbrayıl", "Cəlilabad", "Culfa", 
    "Daşkəsən", "Füzuli", "Gədəbəy", "Goranboy", "Göyçay", "Göygöl", "Hacıqabul", "Xaçmaz", 
    "Xızı", "Xocalı", "Xocavənd", "İmişli", "İsmayıllı", "Kəlbəcər", "Kürdəmir", "Qax", 
    "Qazax", "Qəbələ", "Qobustan", "Quba", "Qubadlı", "Qusar", "Laçın", "Lerik", "Masallı", 
    "Neftçala", "Oğuz", "Ordubad", "Saatlı", "Sabirabad", "Şahbuz", "Salyan", "Şamaxı", 
    "Şəmkir", "Şərur", "Şuşa", "Siyəzən", "Tərtər", "Tovuz", "Ucar", "Yardımlı", "Zaqatala", 
    "Zardab", "Zəngilan"
].sort((a, b) => a.localeCompare(b, 'az'));

// Dashboard-dakı "Yeni sifariş yarat" butonuna klik olunanda bu funksiya çağırılmalıdır
function openNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'block';
        populateOrderCities();
    }
}

// Modalı bağlamaq üçün funksiya
function closeNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('newOrderForm').reset();
    }
}

// Şəhər dropdown-larını Azərbaycan rayonları ilə doldurur
function populateOrderCities() {
    const pickupSelect = document.getElementById('orderPickupCity');
    const dropSelect = document.getElementById('orderDropCity');
    
    // Əgər artıq doldurulubsa, yenidən doldurmasın
    if (pickupSelect && pickupSelect.options.length <= 1) {
        azerbaijanCities.forEach(city => {
            const opt1 = document.createElement('option');
            opt1.value = city;
            opt1.textContent = city;
            pickupSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = city;
            opt2.textContent = city;
            dropSelect.appendChild(opt2);
        });
    }
}


// ==========================================================================
// MƏRKƏZİ DASHBOARD IDARƏEDİCİSİ VƏ MODAL SCRIPTİ
// ==========================================================================

/**
 * Dashboard-dakı düymələrin klik əmrlərini mərkəzi idarə edən funksiya
 */
function handleDashboardAction(actionType) {
    if (actionType === 'new-order') {
        // "Yeni sifariş yarat" düyməsinə basıldıqda modalı açırıq
        openNewOrderModal();
    } else if (actionType === 'new-route') {
        // Bu hissə növbəti mərhələdə "Yeni reys yarat" üçün istifadə olunacaq
        alert('Yeni Reys Yaratma modulu tezliklə bura inteqrasiya olunacaq.');
    } else {
        // Digər aktiv/icrada olan düymələr üçün müvəqqəqi bildiriş
        alert(actionType + ' bölməsi tezliklə aktivləşdiriləcək.');
    }
}

/**
 * Yeni sifariş modalını ekranda göstərən əsas funksiya
 */
function openNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'block';
        populateOrderCities(); // Şəhərlərin dropdown siyahısını doldurur
    } else {
        console.error("XƏTA: 'newOrderModal' element HTML daxilində tapılmadı!");
    }
}

/**
 * Modal pəncərəsini bağlamaq üçün funksiya
 */
function closeNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Sifariş formasındakı "Şəhərlər" siyahısını avtomatik dolduran funksiya
 */
function populateOrderCities() {
    const pickupSelect = document.getElementById('orderPickupCity');
    const dropSelect = document.getElementById('orderDropCity');
    
    // Azərbaycanın əsas şəhər və rayonlarının siyahısı
    const cities = [
        "Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Xırdalan", "Naxçıvan", "Lənkəran", 
        "Yevlax", "Şəki", "Şirvan", "Quba", "Xaçmaz", "Qusar", "Şamaxi", "İsmayıllı", 
        "Qəbələ", "Göyçay", "Bərdə", "Ağdam", "Ağcabədi", "Füzuli", "Cəlilabad", 
        "Salyan", "Masallı", "Şəmkir", "Tovuz", "Qazax", "Zaqatala", "Balakən"
    ];
    
    // Hər iki dropdown-u təmizləyirik və ilkin dəyəri veririk
    if (pickupSelect && pickupSelect.options.length <= 1) {
        pickupSelect.innerHTML = '<option value="">Seçin *</option>';
        cities.forEach(city => {
            pickupSelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
    
    if (dropSelect && dropSelect.options.length <= 1) {
        dropSelect.innerHTML = '<option value="">Seçin *</option>';
        cities.forEach(city => {
            dropSelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
}
// ==========================================================================
// SİFARİŞ FORMASI VƏ MƏRKƏZİ DASHBOARD IDARƏEDİCİSİ
// ==========================================================================

/**
 * Formadan məlumatları yığıb API vasitəsilə Google Sheets-ə göndərən funksiya
 */
function submitNewOrder(event) {
    event.preventDefault();
    
    // Ekrandan daxil olmuş müştərinin real ID-sini oxuyuruq
    const idElement = document.getElementById('dashUserId');
    let customerID = "650001"; // Ehtiyat ID
    
    if (idElement && idElement.innerText.trim() !== "-") {
        customerID = idElement.innerText.trim();
    } else {
        customerID = localStorage.getItem('userID') || "650001";
    }

    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'GÖNDƏRİLİR... LÜTFƏN GÖZLƏYİN';
    }

    // Dəyər və vahidlərin kombinasiyası
    const weight = document.getElementById('orderWeightVal').value + ' ' + document.getElementById('orderWeightUnit').value;
    const width = document.getElementById('orderWidthVal').value + ' ' + document.getElementById('orderWidthUnit').value;
    const length = document.getElementById('orderLengthVal').value + ' ' + document.getElementById('orderLengthUnit').value;
    const height = document.getElementById('orderHeightVal').value + ' ' + document.getElementById('orderHeightUnit').value;
    const budget = document.getElementById('orderBudgetVal').value + ' ' + document.getElementById('orderBudgetCurrency').value;

    // Google Sheets-ə gedəcək data paketi
    const orderData = {
        goodType: document.getElementById('orderGoodType').value,
        goodName: document.getElementById('orderGoodName').value,
        material: document.getElementById('orderMaterial').value,
        fragility: document.getElementById('orderFragility').value,
        weight: weight,
        width: width,
        length: length,
        height: height,
        pickupCity: document.getElementById('orderPickupCity').value,
        pickupAddress: document.getElementById('orderPickupAddress').value,
        dropCity: document.getElementById('orderDropCity').value,
        dropAddress: document.getElementById('orderDropAddress').value,
        pickupDate: document.getElementById('orderPickupDate').value,
        dropDate: document.getElementById('orderDropDate').value,
        budget: budget,
        notes: document.getElementById('orderNotes').value || '-'
    };

    // js/api.js daxilindəki funksiyanı çağırırıq (Həm datanı, həm ID-ni göndəririk)
    if (typeof apiNewOrder === 'function') {
        apiNewOrder(orderData, customerID)
            .then(response => {
                alert('Sifarişiniz uğurla yaradıldı və Google Sheets-ə qeyd olundu!');
                closeNewOrderModal();
                if (document.getElementById('newOrderForm')) {
                    document.getElementById('newOrderForm').reset(); // Formanı sıfırlayırıq
                }
            })
            .catch(error => {
                alert('Xəta baş verdi: ' + error);
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SİFARİŞİ TƏSDİQLƏ VƏ PAYLAŞ';
                }
            });
    } else {
        alert('API modulu tapılmadı. Zəhmət olmasa js/api.js faylını yoxlayın.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SİFARİŞİ TƏSDİQLƏ VƏ PAYLAŞ';
        }
    }
}

/**
 * Dashboard-dakı düymələrin klik əmrlərini mərkəzi idarə edən funksiya
 */
function handleDashboardAction(actionType) {
    if (actionType === 'new-order') {
        openNewOrderModal();
    } else if (actionType === 'new-route') {
        alert('Yeni Reys Yaratma modulu tezliklə bura inteqrasiya olunacaq.');
    } else {
        alert(actionType + ' bölməsi tezliklə aktivləşdiriləcək.');
    }
}

/**
 * Yeni sifariş modalını ekranda göstərən əsas funksiya
 */
function openNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'block';
        populateOrderCities();
    } else {
        console.error("XƏTA: 'newOrderModal' elementi tapılmadı!");
    }
}

/**
 * Modal pəncərəsini bağlamaq üçün funksiya
 */
function closeNewOrderModal() {
    const modal = document.getElementById('newOrderModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Sifariş formasındakı "Şəhərlər" siyahısını avtomatik dolduran funksiya
 */
function populateOrderCities() {
    const pickupSelect = document.getElementById('orderPickupCity');
    const dropSelect = document.getElementById('orderDropCity');
    
    const cities = [
        "Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Xırdalan", "Naxçıvan", "Lənkəran", 
        "Yevlax", "Şəki", "Şirvan", "Quba", "Xaçmaz", "Qusar", "Şamaxi", "İsmayıllı", 
        "Qəbələ", "Göyçay", "Bərdə", "Ağdam", "Ağcabədi", "Füzuli", "Cəlilabad", 
        "Salyan", "Masallı", "Şəmkir", "Tovuz", "Qazax", "Zaqatala", "Balakən"
    ];
    
    if (pickupSelect && pickupSelect.options.length <= 1) {
        pickupSelect.innerHTML = '<option value="">Seçin *</option>';
        cities.forEach(city => {
            pickupSelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
    
    if (dropSelect && dropSelect.options.length <= 1) {
        dropSelect.innerHTML = '<option value="">Seçin *</option>';
        cities.forEach(city => {
            dropSelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
    }
}

// Modalın kənarına vuranda bağlanması
window.addEventListener('click', function(event) {
    const modal = document.getElementById('newOrderModal');
    if (event.target === modal) {
        closeNewOrderModal();
    }
});
