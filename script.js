const SELLER_PHONE = '+201115134784';
let ALL_PROPERTIES = [];
let SLIDER_PROPS = [];
let currentSlide = 0;

// ====================== تحميل العقارات ======================
async function loadProperties() {
    let allProperties = [];

    // 1. من properties.json
    try {
        const res = await fetch('data/properties.json');
        const staticProps = await res.json();
        allProperties = allProperties.concat(staticProps);
    } catch (e) {
        console.warn('لم يتم العثور على properties.json');
    }

    // 2. من localStorage (الأدمن)
    const localPropsJSON = localStorage.getItem('rs_local_props');
    if (localPropsJSON) {
        try {
            const localProps = JSON.parse(localPropsJSON);
            allProperties = localProps.concat(allProperties);
        } catch (e) {
            console.error('خطأ في localStorage', e);
        }
    }

    // 3. احتفظ بالمتحول العام
    ALL_PROPERTIES = allProperties.filter(p => p.city && p.city.trim() !== '');
    
    displayProperties(ALL_PROPERTIES);
    setupSlider(ALL_PROPERTIES);
}

// ====================== عرض العقارات ======================
function displayProperties(properties) {
    const listContainer = document.getElementById('property-list');
    listContainer.innerHTML = '';

    if (properties.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:40px 0; color:#666;">لا توجد عقارات متاحة حالياً.</p>';
        return;
    }

    properties.forEach(prop => {
        const card = document.createElement('div');
        card.className = 'property-card';
        card.dataset.id = prop.id;

        card.innerHTML = `
            <img src="${prop.img}" alt="${prop.title}">
            <div class="property-info">
                <h3>${prop.title}</h3>
                <p><strong>الموقع:</strong> ${prop.city}</p>
                <p><strong>النوع:</strong> ${prop.type || 'غير محدد'}</p>
                <p><strong>المساحة:</strong> ${prop.size || 'غير محدد'}</p>
                <p><strong>الغرف:</strong> ${prop.rooms || '؟'}</p>
                <span>${prop.price}</span>
            </div>
        `;
        listContainer.appendChild(card);

        card.addEventListener('click', () => openModal(prop.id));
    });
}

// ====================== السلايدر ======================
function setupSlider(properties) {
    SLIDER_PROPS = properties.filter(p => p.inSlider === true);
    const sliderContainer = document.getElementById('sliderContainer');
    sliderContainer.innerHTML = '';

    SLIDER_PROPS.forEach(prop => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.backgroundImage = `url(${prop.img})`;
        slide.dataset.id = prop.id;
        sliderContainer.appendChild(slide);

        slide.addEventListener('click', () => openModal(prop.id));
    });

    showSlide(currentSlide);
    setInterval(nextSlide, 3000);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        slide.style.transform = 'scale(0.9)';
        slide.style.opacity = '0.5';
        if (i === index) {
            slide.classList.add('active');
            slide.style.transform = 'scale(1)';
            slide.style.opacity = '1';
        }
    });
}

function nextSlide() {
    if (SLIDER_PROPS.length === 0) return;
    currentSlide = (currentSlide + 1) % SLIDER_PROPS.length;
    showSlide(currentSlide);
}

// ====================== المودال ======================
function openModal(propertyId) {
    const prop = ALL_PROPERTIES.find(p => p.id == propertyId);
    if (!prop) return;

    document.getElementById('modalImg').src = prop.img;
    document.getElementById('modalTitle').textContent = prop.title;
    document.getElementById('modalPriceDetail').textContent = prop.price;
    document.getElementById('modalCity').textContent = prop.city;
    document.getElementById('modalType').textContent = prop.type || 'غير محدد';
    document.getElementById('modalSize').textContent = prop.size || 'غير محدد';
    document.getElementById('modalRooms').textContent = prop.rooms || '؟';
    document.getElementById('modalDesc').textContent = prop.desc || 'لا يوجد وصف متاح لهذا العقار.';

    const whatsappMessage = `مرحباً، أود الاستفسار عن العقار: ${prop.title}، في مدينة: ${prop.city}. السعر: ${prop.price}.`;
    document.getElementById('whatsappLink').href = `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

    document.getElementById('propertyModal').style.display = 'block';
}

document.querySelector('.close-button').onclick = () => {
    document.getElementById('propertyModal').style.display = 'none';
};
window.onclick = e => {
    if (e.target.id === 'propertyModal') document.getElementById('propertyModal').style.display = 'none';
};

// ====================== حالة تسجيل الدخول ======================
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('realestate_user') || '{}');
    const loginBtn = document.getElementById('loginBtn');

    if (user.email) {
        loginBtn.textContent = 'تسجيل خروج';
        loginBtn.href = '#';
        loginBtn.onclick = e => {
            e.preventDefault();
            localStorage.removeItem('realestate_user');
            location.reload();
        };
    } else {
        loginBtn.textContent = 'تسجيل الدخول';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
    }
}

// ====================== تشغيل الدوال ======================
document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    checkLoginStatus();
});
