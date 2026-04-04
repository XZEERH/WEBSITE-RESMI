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
let currentReplyId = null;

// --- RENDER CARDS DENGAN BADGE (POJOK KANAN) ---
onValue(ref(db, 'cosmic_data'), (snap) => {
    cosmicData = snap.val() ? Object.values(snap.val()).reverse() : [];
    renderEdu(cosmicData);
});

function renderEdu(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <div class="card-badge">${(item.category || 'MISTERI').toUpperCase()}</div>
                <img src="${item.img}">
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <p>${item.desc.substring(0, 80)}...</p>
                </div>
            </div>`;
    });
}

// --- CHAT IEA DENGAN SISTEM DEBAT ---
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
    push(ref(db, 'cosmic_comments'), {
        name, text, time: Date.now(), replyTo: currentReplyId
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
                    <span class="post-tag">"Hipotesis Baru"</span>
                    <div style="font-weight:bold; color:var(--cyan); font-size:13px;">${c.name}</div>
                    <p style="margin:10px 0; font-size:14px;">${c.text}</p>
                    <div class="reply-container">${repliesHTML}</div>
                    <div style="margin-top:10px; display:flex; gap:15px;">
                        <span style="font-size:10px; color:#444;" onclick="prepareReply('${id}', '${c.name}')">🗨 DEBAT</span>
                        <span style="font-size:10px; color:#444;">❤ LIKE</span>
                    </div>
                </div>`;
        });
    });
}

// --- PROFILE & TAB NAVIGATION ---
window.showProfile = () => {
    const user = sessionStorage.getItem('eac_user') || 'Guest';
    document.getElementById('profName').innerText = user;
    document.getElementById('profileModal').style.display = 'flex';
};
window.closeProfile = () => document.getElementById('profileModal').style.display = 'none';

window.switchTab = (t, el) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.style.display = 'none');
    document.getElementById(t + 'Section').style.display = 'block';
    document.getElementById('mainHeader').style.display = (t === 'edu') ? 'block' : 'none';
};

// Filter logic
window.filterData = (cat) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    const filtered = cat === 'all' ? cosmicData : cosmicData.filter(d => d.category === cat);
    renderEdu(filtered);
};
