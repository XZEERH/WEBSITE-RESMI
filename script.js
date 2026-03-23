/**
 * EAC COSMIC DATABASE - CORE ENGINE
 * Developer: Razeerh (Science Owner)
 * Features: Auto-Storage, ImgBB Integration, Dynamic Filtering, & Network Monitor
 */

// Data awal sebagai contoh jika database masih kosong
const starterData = [
    { 
        title: "SAGITTARIUS A*", 
        category: "Objek", 
        img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564", 
        desc: "Lubang hitam supermasif yang berada di pusat Galaksi Bimasakti kita.", 
        link: "https://id.wikipedia.org/wiki/Sagittarius_A*" 
    }
];

// Mengambil data dari LocalStorage HP, jika tidak ada pakai data starter
let cosmicData = JSON.parse(localStorage.getItem('cosmic_db')) || starterData;

// --- SISTEM LOADING & INITIALIZATION ---
window.addEventListener('load', () => {
    const overlay = document.getElementById('welcomeOverlay');
    const text = document.getElementById('welcomeText');
    const progress = document.getElementById('progressBar');

    // Animasi Loading Bar
    setTimeout(() => {
        if(progress) progress.style.width = "100%";
        if(text) {
            text.innerText = "ACCESS GRANTED";
            text.style.color = "#39ff14"; // Warna Hijau Neon
        }
    }, 500);

    // Menghilangkan Overlay Greeting
    setTimeout(() => {
        if(overlay) {
            overlay.style.opacity = "0";
            setTimeout(() => overlay.style.display = "none", 1000);
        }
    }, 2500);

    // Jalankan Fungsi Utama
    renderCards(cosmicData);
    updateWifi(); // Jalankan sekali saat start
    setInterval(updateWifi, 3000); // Update tiap 3 detik
});

// --- RENDER KARTU DATABASE ---
function renderCards(data) {
    const container = document.getElementById('cardContainer');
    if(!container) return;
    
    container.innerHTML = '';
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.innerHTML = `
            <div style="position:absolute; top:10px; right:10px; background:#ffcc00; color:black; font-size:9px; font-weight:bold; padding:3px 8px; border-radius:3px; z-index:2; font-family:'Orbitron';">${item.category.toUpperCase()}</div>
            <img src="${item.img}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Found'">
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.desc.substring(0, 60)}...</p>
            </div>
        `;
        card.onclick = () => openModal(item);
        container.appendChild(card);
    });
}

// --- MONITOR NETWORK (PING WARNA-WARNI) ---
function updateWifi() {
    const start = Date.now();
    const icon = document.getElementById('wifi-icon');
    const ping = document.getElementById('ping-ms');
    
    // Ping ke server ringan (Google Favicon)
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' })
    .then(() => {
        const ms = Date.now() - start;
        
        if(ping) {
            ping.innerText = ms + "ms";
            
            // Logika Warna untuk Angka MS saja
            if(ms < 150) { 
                ping.style.color = "#39ff14"; // Hijau (Cepat)
            } else if(ms < 450) { 
                ping.style.color = "#ffcc00"; // Kuning (Sedang)
            } else { 
                ping.style.color = "#ff4444"; // Merah (Lambat)
            }
        }
        
        // Ikon WiFi dikunci warna Putih Netral
        if(icon) icon.style.color = "#ffffff"; 
    })
    .catch(() => {
        if(ping) {
            ping.innerText = "OFFLINE";
            ping.style.color = "#ff4444";
        }
        if(icon) icon.style.color = "#444444"; // Ikon redup saat offline
    });
}

// --- SISTEM PENCARIAN ---
function searchData() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = cosmicData.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q)
    );
    renderCards(filtered);
}

// --- SISTEM FILTER KATEGORI ---
function filterData(cat) {
    // Ubah status tombol aktif
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter data
    if(cat === 'all') {
        renderCards(cosmicData);
    } else {
        const filtered = cosmicData.filter(i => i.category === cat);
        renderCards(filtered);
    }
}

// --- MODAL SYSTEM (DETAIL DATA) ---
function openModal(item) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalImg').src = item.img;
    document.getElementById('modalDesc').innerText = item.desc;
    document.getElementById('modalTag').innerText = item.category.toUpperCase();
    document.getElementById('modalLink').href = item.link;
    
    if(modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Mencegah scroll layar belakang
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if(modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}
