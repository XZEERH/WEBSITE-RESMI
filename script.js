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

// --- 1. LOAD EDUKASI (Sistem Lama Dipertahankan) ---
onValue(ref(db, 'cosmic_data'), (snap) => {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    const data = snap.val() ? Object.values(snap.val()).reverse() : [];
    data.forEach(item => {
        container.innerHTML += `<div class="card"><div class="card-badge">${(item.category || 'OBJECT').toUpperCase()}</div><img src="${item.img}"><div class="card-info"><h3>${item.title}</h3><p>${item.desc.substring(0, 80)}...</p></div></div>`;
    });
});

// --- 2. LOAD MUSIC (Non-Clickable + Download) ---
function loadMusic() {
    onValue(ref(db, 'cosmic_music'), (snap) => {
        const container = document.getElementById('musicContainer');
        container.innerHTML = '';
        if(!snap.val()) return;
        Object.values(snap.val()).forEach(m => {
            container.innerHTML += `
                <div class="music-item">
                    <div class="music-info">
                        <img class="music-img" src="${m.img}">
                        <div><h4 style="margin:0; font-size:14px;">${m.title}</h4></div>
                    </div>
                    <a href="${m.link}" class="dl-btn" download>DOWNLOAD</a>
                </div>`;
        });
    });
}

// --- 3. LOAD INFORMASI (Bisa Ditekan) ---
function loadInfo() {
    onValue(ref(db, 'cosmic_info'), (snap) => {
        const container = document.getElementById('infoContainer');
        container.innerHTML = '';
        if(!snap.val()) return;
        Object.values(snap.val()).forEach(i => {
            container.innerHTML += `
                <div class="card" onclick="window.open('${i.link}', '_blank')">
                    <div class="card-badge">INFO</div>
                    <img src="${i.img}">
                    <div class="card-info">
                        <h3>${i.title}</h3>
                        <p>${i.desc}</p>
                    </div>
                </div>`;
        });
    });
}

// --- 4. CHAT SYSTEM (Login + Interaksi) ---
window.loginChat = () => {
    const user = document.getElementById('chatUser').value;
    if(user.length < 2) return alert("Nama minimal 2 huruf");
    sessionStorage.setItem('eac_user', user);
    document.getElementById('chatAuth').style.display = 'none';
    document.getElementById('commentContainer').style.display = 'block';
    document.getElementById('chatInputBar').style.display = 'flex';
    loadComments();
};

window.sendComment = () => {
    const text = document.getElementById('comText').value;
    const name = sessionStorage.getItem('eac_user');
    if(!text) return;
    push(ref(db, 'cosmic_comments'), {
        name, text, time: Date.now(), likes: 0, dislikes: 0, replyTo: currentReplyId
    }).then(() => {
        document.getElementById('comText').value = '';
        cancelReply();
    });
};

function loadComments() {
    onValue(ref(db, 'cosmic_comments'), (snap) => {
        const container = document.getElementById('commentContainer'); container.innerHTML = '';
        const all = snap.val(); if(!all) return;
        const entries = Object.entries(all);

        entries.filter(([id, c]) => !c.replyTo).reverse().forEach(([id, c]) => {
            let repliesHTML = '';
            entries.filter(([rid, rc]) => rc.replyTo === id).forEach(([rid, rc]) => {
                repliesHTML += `<div class="iea-reply"><b>${rc.name}:</b> ${rc.text}</div>`;
            });

            container.innerHTML += `
                <div class="iea-post">
                    <b style="color:var(--cyan); font-size:12px;">${c.name}</b>
                    <p style="margin:8px 0; font-size:14px;">${c.text}</p>
                    <div class="reply-container">${repliesHTML}</div>
                    <div class="iea-actions">
                        <button class="action-btn" onclick="voteChat('${id}', 'likes')"><svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg> ${c.likes || 0}</button>
                        <button class="action-btn" onclick="voteChat('${id}', 'dislikes')"><svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg> ${c.dislikes || 0}</button>
                        <button class="action-btn" onclick="prepareReply('${id}', '${c.name}')">🗨 BALAS</button>
                    </div>
                </div>`;
        });
    });
}

window.voteChat = (id, type) => {
    const chatRef = ref(db, `cosmic_comments/${id}`);
    onValue(chatRef, (snap) => {
        let count = snap.val()[type] || 0;
        update(chatRef, { [type]: count + 1 });
    }, { onlyOnce: true });
};

window.prepareReply = (id, name) => {
    currentReplyId = id;
    document.getElementById('replyIndicator').style.display = 'block';
    document.getElementById('replyTargetName').innerText = name;
    document.getElementById('comText').focus();
};

window.cancelReply = () => { currentReplyId = null; document.getElementById('replyIndicator').style.display = 'none'; };

// --- TAB NAVIGATION ---
window.switchTab = (t, el) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById(t + 'Section').style.display = 'block';
    document.getElementById('mainHeader').style.display = (t === 'edu') ? 'block' : 'none';

    if(t === 'music') loadMusic();
    if(t === 'info') loadInfo();
    if(t === 'com' && sessionStorage.getItem('eac_user')) {
        document.getElementById('chatAuth').style.display = 'none';
        document.getElementById('commentContainer').style.display = 'block';
        document.getElementById('chatInputBar').style.display = 'flex';
        loadComments();
    }
};
