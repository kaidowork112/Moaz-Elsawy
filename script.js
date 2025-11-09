const SELLER_PHONE = '+201115134784';
let ALL_PROPERTIES = [];
let SLIDER_PROPS = [];
let currentSlide = 0;

// ===== ترجمة ديناميكية =====
const translations = {
  ar: { propertiesTitle: 'العقارات', noProperties: 'لا توجد عقارات متاحة حالياً.', whatsappText: 'مرحباً، أود الاستفسار عن العقار: ' },
  en: { propertiesTitle: 'Properties', noProperties: 'No properties available currently.', whatsappText: 'Hello, I would like to inquire about the property: ' }
};

function setLanguage(lang){
  document.documentElement.lang = lang;
  document.querySelector('.properties h2').textContent = translations[lang].propertiesTitle;
  const listContainer = document.getElementById('property-list');
  if(listContainer.innerHTML.includes('لا توجد') || listContainer.innerHTML.includes('No properties')){
    listContainer.innerHTML = `<p style="text-align:center; padding:2rem 0; color:#666;">${translations[lang].noProperties}</p>`;
  }
  localStorage.setItem('realestate_lang', lang);
}

// ===== تحميل العقارات =====
async function loadProperties() {
  let allProperties = [];
  try { const res = await fetch('data/properties.json'); allProperties = await res.json(); } catch(e){ console.warn('properties.json not found'); }
  const localPropsJSON = localStorage.getItem('rs_local_props');
  if(localPropsJSON) { try { const localProps = JSON.parse(localPropsJSON); allProperties = localProps.concat(allProperties); } catch(e){ console.error(e); } }
  ALL_PROPERTIES = allProperties.filter(p => p.city && p.city.trim() !== '');
  displayProperties(ALL_PROPERTIES);
  setupSlider(ALL_PROPERTIES);
}

// ===== عرض العقارات =====
function displayProperties(properties) {
  const listContainer = document.getElementById('property-list');
  listContainer.innerHTML = '';
  if(properties.length === 0){ listContainer.innerHTML = `<p style="text-align:center; padding:2rem 0; color:#666;">${translations[localStorage.getItem('realestate_lang') || 'ar'].noProperties}</p>`; return; }
  properties.forEach(prop => {
    const card = document.createElement('div'); card.className = 'property-card'; card.dataset.id = prop.id;
    card.innerHTML = `<img src="${prop.img}" alt="${prop.title}">
      <div class="property-info">
        <h3>${prop.title}</h3>
        <p><strong>الموقع:</strong> ${prop.city}</p>
        <p><strong>النوع:</strong> ${prop.type || 'غير محدد'}</p>
        <p><strong>المساحة:</strong> ${prop.size || 'غير محدد'}</p>
        <p><strong>الغرف:</strong> ${prop.rooms || '؟'}</p>
        <span>${prop.price}</span>
      </div>`;
    listContainer.appendChild(card);
    card.addEventListener('click', () => openModal(prop.id));
  });
}

// ===== السلايدر =====
function setupSlider(properties){
  SLIDER_PROPS = properties.filter(p => p.inSlider);
  const sliderContainer = document.getElementById('sliderContainer'); sliderContainer.innerHTML = '';
  SLIDER_PROPS.forEach(prop => {
    const slide = document.createElement('div'); slide.className = 'slide'; slide.style.backgroundImage = `url(${prop.img})`; slide.dataset.id = prop.id;
    slide.addEventListener('click', () => openModal(prop.id));
    sliderContainer.appendChild(slide);
  });
  showSlide(currentSlide); setInterval(nextSlide, 3000);
}
function showSlide(index){ document.querySelectorAll('.slide').forEach((slide,i)=>{ slide.classList.remove('active'); slide.style.opacity='0.5'; slide.style.transform='scale(0.95)'; if(i===index){ slide.classList.add('active'); slide.style.opacity='1'; slide.style.transform='scale(1)'; } }); }
function nextSlide(){ if(SLIDER_PROPS.length===0) return; currentSlide=(currentSlide+1)%SLIDER_PROPS.length; showSlide(currentSlide); }

// ===== المودال =====
function openModal(propertyId){
  const prop = ALL_PROPERTIES.find(p=>p.id==propertyId);
  if(!prop) return;
  document.getElementById('modalImg').src = prop.img;
  document.getElementById('modalTitle').textContent = prop.title;
  document.getElementById('modalPriceDetail').textContent = prop.price;
  document.getElementById('modalCity').textContent = prop.city;
  document.getElementById('modalType').textContent = prop.type || 'غير محدد';
  document.getElementById('modalSize').textContent = prop.size || 'غير محدد';
  document.getElementById('modalRooms').textContent = prop.rooms || '؟';
  document.getElementById('modalDesc').textContent = prop.desc || 'لا يوجد وصف متاح';
  const lang = localStorage.getItem('realestate_lang') || 'ar';
  const whatsappMessage = `${translations[lang].whatsappText}${prop.title}, ${prop.city}. Price: ${prop.price}`;
  document.getElementById('whatsappLink').href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;
  document.getElementById('propertyModal').style.display = 'block';
}
document.querySelector('.close-button').onclick = ()=>{ document.getElementById('propertyModal').style.display='none'; };
window.onclick = e => { if(e.target.id==='propertyModal') document.getElementById('propertyModal').style.display='none'; };

// ===== الهيدر لغة =====
document.querySelectorAll('.language-selector .flag').forEach(flag=>{
  flag.addEventListener('click',()=>{ setLanguage(flag.dataset.lang); });
});

// ===== تسجيل الدخول/خروج =====
function checkLoginStatus(){
  const user = JSON.parse(localStorage.getItem('realestate_user')||'{}');
  const loginBtn = document.getElementById('loginBtn');
  if(user.email){
    loginBtn.textContent='تسجيل خروج';
    loginBtn.href='#';
    loginBtn.onclick = e => { e.preventDefault(); localStorage.removeItem('realestate_user'); location.reload(); };
  } else { loginBtn.textContent='تسجيل الدخول'; loginBtn.href='login.html'; loginBtn.onclick=null; }
}

// ===== تشغيل الدوال =====
document.addEventListener('DOMContentLoaded',()=>{
  loadProperties();
  checkLoginStatus();
  const savedLang = localStorage.getItem('realestate_lang') || 'ar';
  setLanguage(savedLang);
});
