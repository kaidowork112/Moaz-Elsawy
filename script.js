// ⭐ بيانات الأدمن (يجب أن تتطابق مع login.html)
const ADMIN_EMAIL = 'admin@moazelsawy.com'; 
// رقم هاتفك (البائع) لاستخدامه في رابط الواتساب (بالكود الدولي مثل 201xxxxxxxxx)
const SELLER_PHONE = '201xxxxxxxxx'; 

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
let ALL_PROPERTIES = []; // لتخزين العقارات المدمجة

// ==========================================================
// 1. منطق السلايدر
// ==========================================================
function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) slide.classList.add("active");
  });
}

function nextSlide() {
  const slides = document.querySelectorAll(".slide");
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// ==========================================================
// 2. عرض العقارات (الثابتة + المحلية)
// ==========================================================
async function loadProperties() {
  let allProperties = [];

  // 1. جلب البيانات الثابتة من properties.json
  try {
    const response = await fetch("data/properties.json");
    const staticProps = await response.json();
    allProperties = allProperties.concat(staticProps);
  } catch (error) {
    console.warn('لم يتم العثور على ملف properties.json أو حدث خطأ في القراءة. يتم المتابعة بالبيانات المحلية فقط.');
  }

  // 2. جلب البيانات المضافة محلياً من LocalStorage
  const localPropsJSON = localStorage.getItem('rs_local_props');
  if (localPropsJSON) {
    try {
      const localProps = JSON.parse(localPropsJSON);
      // إضافة العقارات المحلية في البداية لتظهر أولاً
      allProperties = localProps.concat(allProperties); 
    } catch (e) {
      console.error('خطأ في تحليل بيانات LocalStorage:', e);
    }
  }
  
  ALL_PROPERTIES = allProperties; // حفظها في المتغير العام
  displayProperties(allProperties);
}

function displayProperties(properties) {
  const listContainer = document.getElementById("property-list");
  listContainer.innerHTML = ''; 

  if (properties.length === 0) {
      listContainer.innerHTML = '<p style="text-align:center; padding: 40px 0; color:#666;">لا توجد عقارات متاحة حالياً.</p>';
      return;
  }
  
  properties.forEach((prop) => {
    const card = document.createElement("div");
    card.className = "property-card";
    card.dataset.id = prop.id; // لإلتقاطه عند النقر
    
    // ⭐ تم توحيد أسماء المفاتيح إلى: img, city, rooms
    card.innerHTML = ` 
      <img src="${prop.img}" alt="${prop.title}"> 
      <div class="property-info">
        <h3>${prop.title}</h3>
        <p><strong>الموقع:</strong> ${prop.city || prop.location || 'غير محدد'}</p>
        <p><strong>الغرف:</strong> ${prop.rooms || '؟'}</p>
        <span>${prop.price}</span>
      </div>
    `;
    listContainer.appendChild(card);
    
    // إضافة مستمع للنقر لفتح المودال
    card.addEventListener('click', () => openModal(prop.id));
  });
}

// ==========================================================
// 3. منطق المودال المنبثق
// ==========================================================
function openModal(propertyId) {
    const prop = ALL_PROPERTIES.find(p => p.id == propertyId);
    if (!prop) return;

    // ملء البيانات
    document.getElementById('modalImg').src = prop.img;
    document.getElementById('modalTitle').textContent = prop.title;
    document.getElementById('modalPriceDetail').textContent = prop.price;
    document.getElementById('modalCity').textContent = prop.city || prop.location || 'غير محدد';
    document.getElementById('modalType').textContent = prop.type || 'غير محدد';
    document.getElementById('modalRooms').textContent = prop.rooms || '؟';
    document.getElementById('modalDesc').textContent = prop.desc || 'لا يوجد وصف متاح لهذا العقار.';
    
    // تفعيل زر الواتساب مع رسالة مسبقة التعبئة
    const whatsappMessage = `مرحباً، أود الاستفسار عن العقار: ${prop.title}، في مدينة: ${prop.city || prop.location}. سعره: ${prop.price}. هل هو متاح؟`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    document.getElementById('whatsappLink').href = `https://wa.me/${SELLER_PHONE}?text=${encodedMessage}`;

    // عرض المودال
    document.getElementById('propertyModal').style.display = 'block';
}

// منطق إغلاق المودال
document.querySelector('.close-button').onclick = function() {
  document.getElementById('propertyModal').style.display = 'none';
};
window.onclick = function(event) {
  const modal = document.getElementById('propertyModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};


// ==========================================================
// 4. وظائف مساعدة: حالة الأدمن ونموذج التواصل
// ==========================================================
function checkAdminStatus() {
    const user = JSON.parse(localStorage.getItem('realestate_user') || '{}');
    const loginBtn = document.querySelector('.header nav .btn');

    if (user.is_admin && user.email === ADMIN_EMAIL) {
        loginBtn.textContent = 'لوحة الأدمن';
        loginBtn.href = 'admin.html';
    } else if (user.email) {
         // مستخدم عادي مسجل (لإظهار زر الخروج)
         loginBtn.textContent = 'تسجيل خروج';
         loginBtn.href = '#'; // تغيير الرابط
         loginBtn.onclick = (e) => {
             e.preventDefault();
             localStorage.removeItem('realestate_user');
             location.reload(); 
         };
    }
}

document.getElementById("contactForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("تم إرسال رسالتك بنجاح ✅");
  e.target.reset();
});

// ==========================================================
// 5. تشغيل الدوال عند تحميل الصفحة
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    loadProperties();
    checkAdminStatus();
    setInterval(nextSlide, 5000); // تشغيل السلايدر
});
