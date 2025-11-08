import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxEWaPWqpUIgZtasxnE7-82SN6OEzSx7Q",
  authDomain: "moaz-elsawy.firebaseapp.com",
  projectId: "moaz-elsawy",
  storageBucket: "moaz-elsawy.firebasestorage.app",
  messagingSenderId: "859568017117",
  appId: "1:859568017117:web:38a7d0c96532f0f7681534",
  measurementId: "G-JY1XN1VRCP"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentSlide=0;

function showSlide(index){
  const slides=document.querySelectorAll(".slide");
  slides.forEach((s,i)=>s.classList.remove("active"));
  slides[index].classList.add("active");
}
function nextSlide(){
  const slides=document.querySelectorAll(".slide");
  currentSlide=(currentSlide+1)%slides.length;
  showSlide(currentSlide);
}
setInterval(nextSlide,5000);

// عرض العقارات
async function loadProperties(){
  const querySnapshot = await getDocs(collection(db,"properties"));
  const container = document.getElementById("property-list");
  container.innerHTML="";
  querySnapshot.forEach(docSnap=>{
    const prop = docSnap.data();
    const card = document.createElement("div");
    card.className="property-card";
    card.innerHTML=`<img src="${prop.img}" alt="${prop.title}">
      <div class="property-info">
        <h3>${prop.title}</h3>
        <p><strong>الموقع:</strong> ${prop.city||prop.location||''}</p>
        <p><strong>الغرف:</strong> ${prop.rooms||''}</p>
        <span>${prop.price}</span>
      </div>`;
    card.addEventListener("click",()=>openModal(prop));
    container.appendChild(card);
  });
}
window.openModal=function(prop){
  document.getElementById('modalImg').src=prop.img;
  document.getElementById('modalTitle').textContent=prop.title;
  document.getElementById('modalPriceDetail').textContent=prop.price;
  document.getElementById('modalCity').textContent=prop.city||prop.location||'غير محدد';
  document.getElementById('modalType').textContent=prop.type||'غير محدد';
  document.getElementById('modalRooms').textContent=prop.rooms||'؟';
  document.getElementById('modalDesc').textContent=prop.desc||'لا يوجد وصف';
  const whatsappMessage=`مرحباً، أود الاستفسار عن العقار: ${prop.title}، الموقع: ${prop.city||prop.location}, السعر: ${prop.price}`;
  const encodedMessage=encodeURIComponent(whatsappMessage);
  const SELLER_PHONE = '+201115134784';
  document.getElementById('whatsappLink').href=`https://wa.me/${SELLER_PHONE}?text=${encodedMessage}`;
  document.getElementById('propertyModal').style.display='block';
}
document.querySelector('.close-button').onclick=function(){
  document.getElementById('propertyModal').style.display='none';
}

document.addEventListener("DOMContentLoaded",()=>{
  loadProperties();
  // تحديث زر تسجيل الدخول
  const user=JSON.parse(localStorage.getItem('realestate_user')||'{}');
  const loginBtn=document.getElementById('loginBtn');
  if(user.email){
    if(user.is_admin){
      loginBtn.textContent='لوحة الأدمن';
      loginBtn.href='admin.html';
    }else{
      loginBtn.textContent='تسجيل خروج';
      loginBtn.href='#';
      loginBtn.onclick=(e)=>{e.preventDefault();localStorage.removeItem('realestate_user');location.reload();}
    }
  }else{
    loginBtn.textContent='تسجيل الدخول';
    loginBtn.href='login.html';
  }
  document.getElementById("contactForm")?.addEventListener("submit",(e)=>{e.preventDefault();alert("تم إرسال رسالتك ✅");e.target.reset();});
});
