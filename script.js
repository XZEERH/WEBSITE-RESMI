import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
let currentReplyId = null;

// --- LOAD EDU DATA ---
onValue(ref(db, 'cosmic_data'), (snap) => {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    const data = snap.val() ? Object.values(snap.val()).reverse() : [];
    data.forEach(item => {
        container.innerHTML += `<div class="card"><div class="card-badge">${(item.category || 'OBJECT').toUpperCase()}</div><img src="${item.img}"><div class="card-info"><h3>${item.title}</h3><p>${item.desc.substring(0, 60)}...</p></div></div>`;
    });
});

// --- LOAD MUSIC DATA ---
function loadMusic() {
    onValue(ref(db, 'cosmic_music'), (snap) => {
        const container = document.getElementById('musicContainer');
        container.innerHTML = '';
        const data = snap.val() ? Object.values(snap.val()).reverse() : [];
        data.forEach(m => {
            container.innerHTML += `<div class="music-card"><img src="${m.img}"><div class="music-info"><h4>${m.title}</h4><audio controls><source src="${m.link}"></audio></div></div>`;
        });
    });
}

// --- LOAD INFO DATA ---
function loadInfo() {
    onValue(ref(db, 'cosmic_info'), (snap) => {
        const container = document.getElementById('infoContainer');
        container.innerHTML = '';
        const data = snap.val() ? Object.values(snap.val()).reverse() : [];
        data.forEach(i => {
            container.innerHTML += `<div class="card" style="border-left:4px solid #39ff14"><img src="${i.img}"><div class="card-info"><h3>${i.title}</h3><p>${i.desc}</p></div></div>`;
        });
    });
}

// --- CHAT SYSTEM ---
window.loginChat = () => {
    const user = document.getElementById('chatUser').value;
    if(user.length < 2) return;
    sessionStorage.setItem('eac_user', user);
    document.getElementById('chatAuth').style.display = 'none';
    document.getElementById('chatInputBar').style.display = 'flex';
    loadComments();
};

window.prepareReply = (id, name) => {
    currentReplyId = id;
    document.getElementById('replyIndicator').style.display = 'block';
    document.getElementById('replyTargetName').innerText = name;
    document.getElementById('comText').focus();
};

window.cancelReply = () => { currentReplyId = null; document.getElementById('replyIndicator').style.display = 'none'; };

window.sendComment = () => {
    const text = document.getElementById('comText').value;
    const name = sessionStorage.getItem('eac_user');
    if(!text) return;
    push(ref(db, 'cosmic_comments'), { name, text, time: Date.now(), likes: 0, replyTo: currentReplyId });
    document.getElementById('comText').value = '';
    cancelReply();
};

function loadComments() {
    onValue(ref(db, 'cosmic_comments'), (snap) => {
        const container = document.getElementById('commentContainer');
        container.innerHTML = '';
        const all = snap.val(); if(!all) return;
        const entries = Object.entries(all);

        entries.filter(([id, c]) => !c.replyTo).reverse().forEach(([id, c]) => {
            let repliesHTML = '';
            entries.filter(([rid, rc]) => rc.replyTo === id).forEach(([rid, rc]) => {
                repliesHTML += `<div class="iea-reply"><b>${rc.name}:</b> ${rc.text}</div>`;
            });
            container.innerHTML += `<div class="iea-post"><b>${c.name}</b><br><small>Novice Researcher</small><p>${c.text}</p><div class="reply-container">${repliesHTML}</div><button onclick="prepareReply('${id}', '${c.name}')" style="background:none; border:none; color:var(--cyan); font-size:11px;">DEBAT (BALAS)</button></div>`;
        });
    });
}

// --- TAB SWITCHING ---
window.switchTab = (t, el) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById(t + 'Section').style.display = 'block';
    document.getElementById('mainHeader').style.display = (t === 'edu') ? 'block' : 'none';

    if(t === 'music') loadMusic();
    if(t === 'info') loadInfo();
    if(t === 'com' && sessionStorage.getItem('eac_user')) loadComments();
};
