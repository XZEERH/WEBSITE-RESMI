import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3XFfAwJbh0WHd7U_2tEazVgEg2bzbKTQ",
  authDomain: "databaseeac.firebaseapp.com",
  databaseURL: "https://databaseeac-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "databaseeac",
  storageBucket: "databaseeac.firebasestorage.app",
  messagingSenderId: "275001784016",
  appId: "1:275001784016:web:5d193acbb56c1ac280d0d5",
  measurementId: "G-QQBN4VFDY2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let cosmicData = []; 

// --- INITIALIZING SYSTEM ---
window.addEventListener('load', () => {
    const overlay = document.getElementById('welcomeOverlay');
    const text = document.getElementById('welcomeText');
    const progress = document.getElementById('progressBar');

    loadContent('cosmic_data');

    setTimeout(() => {
        if(progress) progress.style.width = "100%";
        if(text) {
            text.innerText = "ACCESS GRANTED";
            text.style.color = "#39ff14";
        }
    }, 800);

    setTimeout(() => {
        if(overlay) {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.style.display = "none", 1000);
        }
    }, 2800);

    updateWifi();
    setInterval(updateWifi, 3000);
});

// --- NAVIGATION LOGIC ---
window.switchTab = (tabName, el) => {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});

    const header = document.querySelector('header');
    const container = document.getElementById('cardContainer');

    if(tabName === 'cosmic_data') {
        header.style.display = 'block';
        container.style.marginTop = "0";
    } else {
        header.style.display = 'none';
        container.style.marginTop = "20px";
    }
    loadContent(tabName);
};

function loadContent(tabName) {
    const dataRef = ref(db, tabName);
    onValue(dataRef, (snapshot) => {
        const rawData = snapshot.val();
        const dataArray = rawData ? Object.values(rawData).reverse() : [];
        if(tabName === 'cosmic_data') cosmicData = dataArray;
        renderCards(dataArray, tabName);
    });
}

// --- RENDERING ---
function renderCards(data, tab) {
    const container = document.getElementById('cardContainer');
    if(!container) return;
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card fade-in';

        // SISTEM BARU: MUSIC PLAYER TERINTEGRASI
        if(tab === 'music_data') {
            card.style.borderLeft = "3px solid #39ff14";
            card.innerHTML = `
                <img src="${item.img}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Cover'">
                <div class="card-info">
                    <h3 style="color:#39ff14; font-family:'Orbitron'; font-size:14px; margin-bottom:10px;">${item.title}</h3>
                    
                    <audio controls style="width: 100%; height: 32px; filter: invert(100%) hue-rotate(90deg) brightness(1.5); margin-bottom:10px;">
                        <source src="${item.link}" type="audio/mpeg">
                        Gak support audio jier.
                    </audio>

                    <a href="${item.link}" target="_blank" class="access-btn" style="padding:8px; font-size:10px; border-color:#39ff14; color:#39ff14; font-family:'Orbitron'; text-decoration:none; display:block; text-align:center;">DOWNLOAD MP3</a>
                </div>`;
        } 
        // SISTEM LAMA: EDUKASI, BERITA, KOMUNITAS
        else {
            card.innerHTML = `
                <div style="position:absolute; top:10px; right:10px; background:#ffcc00; color:black; font-size:9px; font-weight:bold; padding:3px 8px; border-radius:3px; z-index:2; font-family:'Orbitron';">${(item.category || tab).toUpperCase()}</div>
                <img src="${item.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Found'">
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <p>${item.desc ? item.desc.substring(0, 60) : '...'}...</p>
                </div>`;
            card.onclick = () => openModal(item);
        }
        container.appendChild(card);
    });
}

// --- OLD SYSTEMS (DIPERTAHANKAN) ---
window.searchData = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = cosmicData.filter(i => 
        i.title.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q))
    );
    renderCards(filtered, 'cosmic_data');
};

window.filterData = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');
    renderCards(cat === 'all' ? cosmicData : cosmicData.filter(i => i.category === cat), 'cosmic_data');
};

window.openModal = (item) => {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalImg').src = item.img;
    document.getElementById('modalDesc').innerText = item.desc;
    document.getElementById('modalTag').innerText = (item.category || "OBJECT").toUpperCase();
    document.getElementById('modalLink').href = item.link;
    if(modal) modal.style.display = "block";
};

window.closeModal = () => document.getElementById('modal').style.display = "none";

function updateWifi() {
    const start = Date.now();
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
    .then(() => {
        document.getElementById('ping-ms').innerText = (Date.now() - start) + "ms";
    });
}
