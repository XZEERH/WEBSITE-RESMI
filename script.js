import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB3XFfAwJbh0WHd7U_2tEazVgEg2bzbKTQ",
    authDomain: "databaseeac.firebaseapp.com",
    databaseURL: "https://databaseeac-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "databaseeac",
    storageBucket: "databaseeac.firebasestorage.app",
    messagingSenderId: "275001784016",
    appId: "1:275001784016:web:5d193acbb56c1ac280d0d5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let cosmicData = [];

// --- INITIALIZE ---
window.addEventListener('load', () => {
    const progress = document.getElementById('progressBar');
    if(progress) progress.style.width = "100%";
    
    onValue(ref(db, 'cosmic_data'), (snap) => {
        const data = snap.val();
        cosmicData = data ? Object.values(data).reverse() : [];
        renderCards(cosmicData);
    });

    setTimeout(() => { document.getElementById('welcomeOverlay').style.opacity = '0'; }, 2000);
    setTimeout(() => { document.getElementById('welcomeOverlay').style.display = 'none'; }, 3000);
});

// --- TAB SYSTEM ---
window.switchTab = (target, el) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById(target + 'Section').style.display = 'block';
    document.getElementById('mainHeader').style.display = (target === 'edu') ? 'block' : 'none';

    if(target === 'music') loadMusic();
    if(target === 'info') loadInfo();
    if(target === 'com') { loadComments(); checkChatAuth(); }
};

// --- CHAT AUTH LOGIC ---
function checkChatAuth() {
    const user = sessionStorage.getItem('eac_user');
    if(user) {
        document.getElementById('chatAuth').style.display = 'none';
        document.getElementById('chatBox').style.display = 'block';
        document.getElementById('activeUser').innerText = "ONLINE AS: " + user.toUpperCase();
    } else {
        document.getElementById('chatAuth').style.display = 'block';
        document.getElementById('chatBox').style.display = 'none';
    }
}

window.loginChat = () => {
    const u = document.getElementById('chatUser').value;
    const p = document.getElementById('chatPass').value;
    if(u.length < 3 || !p) return alert("Nama (min 3) & Password harus diisi!");
    sessionStorage.setItem('eac_user', u);
    checkChatAuth();
};

window.logoutChat = () => {
    sessionStorage.removeItem('eac_user');
    checkChatAuth();
};

window.sendComment = () => {
    const text = document.getElementById('comText').value;
    const name = sessionStorage.getItem('eac_user');
    if(!text) return;
    push(ref(db, 'cosmic_comments'), { name, text, time: Date.now() });
    document.getElementById('comText').value = '';
};

function loadComments() {
    onValue(ref(db, 'cosmic_comments'), (snap) => {
        const container = document.getElementById('commentContainer');
        container.innerHTML = '';
        const data = snap.val();
        if(!data) return;
        Object.values(data).reverse().forEach(c => {
            container.innerHTML += `
                <div class="fade-in" style="background:#0d0d12; border-left:3px solid #ff00ff; padding:15px; margin-bottom:12px; border-radius:8px;">
                    <div style="font-family:'Orbitron'; font-size:10px; color:#ff00ff; margin-bottom:5px;">${c.name.toUpperCase()}</div>
                    <div style="font-size:13px; opacity:0.8;">${c.text}</div>
                </div>`;
        });
    });
}

// --- RENDER HELPERS ---
function renderCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += `
            <div class="card fade-in" onclick="openModal('${item.title}')">
                <img src="${item.img}" loading="lazy">
                <div class="card-info">
                    <h3 style="margin:0; font-family:'Orbitron'; color:var(--cyan); font-size:14px;">${item.title}</h3>
                    <p style="font-size:11px; color:#666; margin-top:5px;">${item.desc.substring(0, 60)}...</p>
                </div>
            </div>`;
    });
    // Simpan data ke window agar bisa diakses Modal
    window.allCosmicData = data;
}

window.openModal = (title) => {
    const item = window.allCosmicData.find(i => i.title === title);
    if(!item) return;
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalImg').src = item.img;
    document.getElementById('modalDesc').innerText = item.desc;
    document.getElementById('modalTag').innerText = item.category || "OBJECT";
    document.getElementById('modalLink').href = item.link;
    document.getElementById('modal').style.display = 'block';
};

window.closeModal = () => document.getElementById('modal').style.display = 'none';

window.searchData = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderCards(cosmicData.filter(i => i.title.toLowerCase().includes(q)));
};

window.filterData = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderCards(cat === 'all' ? cosmicData : cosmicData.filter(i => i.category === cat));
};

// --- DATA MUSIC & INFO ---
function loadMusic() {
    onValue(ref(db, 'cosmic_music'), (snap) => {
        const container = document.getElementById('musicContainer');
        container.innerHTML = '';
        const data = snap.val();
        if(!data) return;
        Object.values(data).reverse().forEach(m => {
            container.innerHTML += `
                <div class="fade-in" style="background:#0d0d12; border:1px solid #222; padding:15px; border-radius:12px; display:flex; align-items:center; gap:15px;">
                    <img src="${m.img}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                    <div style="flex:1">
                        <div style="font-family:'Orbitron'; font-size:12px; color:var(--cyan);">${m.title}</div>
                        <audio controls style="width:100%; height:30px; margin-top:10px;"><source src="${m.link}"></audio>
                    </div>
                </div>`;
        });
    });
}

function loadInfo() {
    onValue(ref(db, 'cosmic_info'), (snap) => {
        const container = document.getElementById('infoContainer');
        container.innerHTML = '';
        const data = snap.val();
        if(!data) return;
        Object.values(data).reverse().forEach(i => {
            container.innerHTML += `
                <div class="card fade-in" style="border-left:3px solid var(--green)">
                    <img src="${i.img}">
                    <div class="card-info">
                        <h3 style="color:var(--green)">${i.title}</h3>
                        <p>${i.desc}</p>
                    </div>
                </div>`;
        });
    });
}
