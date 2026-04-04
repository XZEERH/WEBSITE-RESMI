import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    const progress = document.getElementById('progressBar');
    const text = document.getElementById('welcomeText');
    
    // Load Data Edukasi
    onValue(ref(db, 'cosmic_data'), (snap) => {
        const data = snap.val();
        cosmicData = data ? Object.values(data).reverse() : [];
        renderCards(cosmicData);
    });

    setTimeout(() => { if(progress) progress.style.width = "100%"; }, 500);
    setTimeout(() => { if(text) text.innerText = "ACCESS GRANTED"; text.style.color = "#39ff14"; }, 1500);
    setTimeout(() => { document.getElementById('welcomeOverlay').style.display = 'none'; }, 2500);

    updateWifi();
    setInterval(updateWifi, 5000);
});

// --- TAB SYSTEM ---
window.switchTab = (target, el) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById('mainHeader').style.display = (target === 'edu') ? 'block' : 'none';
    document.getElementById(target + 'Section').style.display = 'block';

    if(target === 'music') loadMusic();
    if(target === 'info') loadInfo();
    if(target === 'com') loadComments();
};

// --- RENDER FUNCTIONS ---
function renderCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.innerHTML = `
            <div style="position:absolute; top:10px; right:10px; background:var(--cyan); color:black; font-size:8px; font-weight:bold; padding:2px 6px; border-radius:2px; font-family:'Orbitron';">${item.category.toUpperCase()}</div>
            <img src="${item.img}" loading="lazy">
            <div class="card-info">
                <h3 style="margin:0; font-family:'Orbitron'; color:var(--cyan); font-size:14px;">${item.title}</h3>
                <p style="font-size:11px; color:#888; margin-top:5px;">${item.desc.substring(0, 50)}...</p>
            </div>`;
        card.onclick = () => openModal(item);
        container.appendChild(card);
    });
}

// --- MUSIC SYSTEM ---
function loadMusic() {
    onValue(ref(db, 'cosmic_music'), (snap) => {
        const container = document.getElementById('musicContainer');
        container.innerHTML = '';
        const data = snap.val();
        if(!data) return;
        Object.values(data).reverse().forEach(m => {
            container.innerHTML += `
                <div class="music-card fade-in">
                    <img src="${m.img}">
                    <div style="flex:1">
                        <h4 style="margin:0; font-family:'Orbitron'; font-size:12px; color:var(--cyan);">${m.title}</h4>
                        <audio controls style="width:100%; height:30px; margin-top:8px;"><source src="${m.link}"></audio>
                    </div>
                    <a href="${m.link}" download style="color:var(--cyan);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></a>
                </div>`;
        });
    });
}

// --- INFO SYSTEM ---
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

// --- COMMENT SYSTEM ---
window.sendComment = () => {
    const name = document.getElementById('comName').value || "Astronot Anonim";
    const text = document.getElementById('comText').value;
    if(!text) return;
    push(ref(db, 'cosmic_comments'), { name, text, likes: 0, time: Date.now() });
    document.getElementById('comText').value = '';
};

function loadComments() {
    onValue(ref(db, 'cosmic_comments'), (snap) => {
        const container = document.getElementById('commentContainer');
        container.innerHTML = '';
        const data = snap.val();
        if(!data) return;
        Object.entries(data).reverse().forEach(([key, c]) => {
            container.innerHTML += `
                <div class="comment-bubble fade-in">
                    <div style="font-family:'Orbitron'; font-size:10px; color:#ff00ff; margin-bottom:5px;">${c.name.toUpperCase()}</div>
                    <div style="font-size:13px; opacity:0.8;">${c.text}</div>
                    <div style="margin-top:10px; font-size:10px; color:#ff00ff; cursor:pointer" onclick="vote('${key}')">❤️ ${c.likes || 0} LIKE</div>
                </div>`;
        });
    });
}

window.vote = (key) => {
    const voteRef = ref(db, `cosmic_comments/${key}/likes`);
    onValue(voteRef, (snap) => {
        set(voteRef, (snap.val() || 0) + 1);
    }, { onlyOnce: true });
};

// --- SEARCH & FILTER ---
window.searchData = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderCards(cosmicData.filter(i => i.title.toLowerCase().includes(q)));
};

window.filterData = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderCards(cat === 'all' ? cosmicData : cosmicData.filter(i => i.category === cat));
};

// --- UTILS ---
window.openModal = (i) => {
    document.getElementById('modalTitle').innerText = i.title;
    document.getElementById('modalImg').src = i.img;
    document.getElementById('modalDesc').innerText = i.desc;
    document.getElementById('modalLink').href = i.link;
    document.getElementById('modal').style.display = 'block';
};
window.closeModal = () => document.getElementById('modal').style.display = 'none';

function updateWifi() {
    const start = Date.now();
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' }).then(() => {
        const ms = Date.now() - start;
        document.getElementById('ping-ms').innerText = ms + "ms";
        document.getElementById('ping-ms').style.color = ms < 200 ? "var(--green)" : "orange";
    });
}
