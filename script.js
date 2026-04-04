/**
 * EAC COSMIC DATABASE - CORE ENGINE (PRO EDITION)
 * Developer: Razeerh (Owner EAC)
 * Features: Multi-Tab System, Firebase Sync, Admin Integration, & UI Logic
 */

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
let cosmicData = []; // Cache data untuk filter/search

// --- 1. INITIALIZING SYSTEM ---
window.addEventListener('load', () => {
    const overlay = document.getElementById('welcomeOverlay');
    const text = document.getElementById('welcomeText');
    const progress = document.getElementById('progressBar');

    // Default Load: Menu INFORMASI
    loadContent('cosmic_data');

    // Animasi Loading Lama
    setTimeout(() => {
        if(progress) progress.style.width = "100%";
        if(text) {
            text.innerText = "ACCESS GRANTED";
            text.style.color = "#39ff14";
            text.style.textShadow = "0 0 20px #39ff14";
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

// --- 2. MULTI-TAB LOGIC (FITUR BARU) ---
window.switchTab = (tabName, el) => {
    // Update UI Navigasi
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');

    // Header Filter (Edukasi) cuma muncul di tab Informasi
    const header = document.querySelector('header');
    if(tabName === 'cosmic_data') {
        header.style.display = 'block';
    } else {
        header.style.display = 'none';
        // Kasih margin dikit biar konten gak nempel atas pas header ilang
        document.getElementById('cardContainer').style.marginTop = "40px";
    }

    loadContent(tabName);
};

function loadContent(tabName) {
    const dataRef = ref(db, tabName);
    onValue(dataRef, (snapshot) => {
        const rawData = snapshot.val();
        const dataArray = rawData ? Object.values(rawData).reverse() : [];
        
        if(tabName === 'cosmic_data') cosmicData = dataArray; // Simpan untuk search
        renderCards(dataArray, tabName);
    });
}

// --- 3. RENDER KARTU (GABUNGAN) ---
function renderCards(data, tab) {
    const container = document.getElementById('cardContainer');
    if(!container) return;
    container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        
        if(tab === 'music_data') {
            // Tampilan Khusus MUSIC (Tidak bisa diklik detail)
            card.style.borderLeft = "3px solid #39ff14";
            card.innerHTML = `
                <img src="${item.img}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Cover'">
                <div class="card-info">
                    <h3 style="color:#39ff14">${item.title}</h3>
                    <p style="font-size:10px">FORMAT: HIGH DEFINITION AUDIO</p>
                    <a href="${item.link}" target="_blank" class="access-btn" style="padding:8px; margin-top:10px; font-size:10px; border-color:#39ff14; color:#39ff14">DOWNLOAD MP3</a>
                </div>
            `;
        } else {
            // Tampilan Standar (Informasi, Berita, Komunitas) - BISA DIKLIK
            card.innerHTML = `
                <div style="position:absolute; top:10px; right:10px; background:#ffcc00; color:black; font-size:9px; font-weight:bold; padding:3px 8px; border-radius:3px; z-index:2; font-family:'Orbitron';">${(item.category || tab).toUpperCase()}</div>
                <img src="${item.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Found'">
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <p>${item.desc ? item.desc.substring(0, 60) : '...'}...</p>
                </div>
            `;
            card.onclick = () => openModal(item);
        }
        container.appendChild(card);
    });
}

// --- 4. SISTEM LAMA (TIDAK DIUBAH) ---
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

    if(cat === 'all') {
        renderCards(cosmicData, 'cosmic_data');
    } else {
        const filtered = cosmicData.filter(i => i.category === cat);
        renderCards(filtered, 'cosmic_data');
    }
};

window.openModal = (item) => {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalImg').src = item.img;
    document.getElementById('modalDesc').innerText = item.desc;
    document.getElementById('modalTag').innerText = (item.category || "OBJECT").toUpperCase();
    document.getElementById('modalLink').href = item.link;

    if(modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }
};

window.closeModal = () => {
    const modal = document.getElementById('modal');
    if(modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

function updateWifi() {
    const start = Date.now();
    const icon = document.getElementById('wifi-icon');
    const ping = document.getElementById('ping-ms');

    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' })
    .then(() => {
        const ms = Date.now() - start;
        if(ping) {
            ping.innerText = ms + "ms";
            ping.style.color = ms < 150 ? "#39ff14" : (ms < 450 ? "#ffcc00" : "#ff4444");
        }
        if(icon) icon.style.color = "#ffffff"; 
    })
    .catch(() => {
        if(ping) { ping.innerText = "OFFLINE"; ping.style.color = "#ff4444"; }
        if(icon) icon.style.color = "#444444";
    });
}
