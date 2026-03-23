import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// AMBIL DATA DARI FIREBASE
const dataRef = ref(db, 'cosmic_data');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if(data) {
        const list = Object.values(data).reverse(); // Terbaru di atas
        renderCards(list);
    } else {
        document.getElementById('cardContainer').innerHTML = "<p style='color:#444; text-align:center;'>Database Kosong.</p>";
    }
});

function renderCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.innerHTML = `
            <div class="tag">${item.category.toUpperCase()}</div>
            <img src="${item.img}" loading="lazy">
            <div class="card-info">
                <h3>${item.title}</h3>
                <p>${item.desc.substring(0, 60)}...</p>
            </div>
        `;
        card.onclick = () => {
            // Logika Modal Detail di sini
            alert(item.title + "\n\n" + item.desc);
        };
        container.appendChild(card);
    });
}
