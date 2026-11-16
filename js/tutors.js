// Supabase-i çağırırıq (shop.js ilə eyni baza!)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ezccynahgubalainoqkf.supabase.co';
const supabaseKey = 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. LOCAL STORAGE İLƏ İSTİFADƏÇİ STATUSU ---
let activeUser = localStorage.getItem('sultan_user') || null;

const navAuthBtn = document.getElementById('navAuthBtn');
const navAuthText = document.getElementById('navAuthText');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const modalUsernameInput = document.getElementById('modalUsernameInput');
const modalAuthSubmitBtn = document.getElementById('modalAuthSubmitBtn');

function updateAuthUI() {
    if (activeUser) {
        navAuthText.innerText = activeUser;
    } else {
        navAuthText.innerText = "Login";
    }
}
updateAuthUI();

// Auth Modal İdarəetməsi
navAuthBtn.addEventListener('click', () => {
    if (activeUser) {
        if (confirm(`You are logged in as "${activeUser}". Do you want to logout?`)) {
            localStorage.removeItem('sultan_user');
            activeUser = null;
            updateAuthUI();
        }
    } else {
        authModal.classList.remove('hidden');
    }
});

closeAuthModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

// Giriş et / Qeydiyyatdan keç
modalAuthSubmitBtn.addEventListener('click', async () => {
    const username = modalUsernameInput.value.trim().toLowerCase();
    if (!username) {
        alert("Please enter a valid Username.");
        return;
    }

    modalAuthSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    // Supabase yoxlaması
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    if (!data) {
        // Yeni istifadəçini qeyd edirik
        await supabase.from('users').insert([{ username: username, sp: 0 }]);
    }

    activeUser = username;
    localStorage.setItem('sultan_user', username);
    updateAuthUI();
    authModal.classList.add('hidden');
    modalAuthSubmitBtn.innerHTML = 'Continue <i class="fas fa-arrow-right"></i>';
    alert(`Welcome, ${username}! You can now contact tutors and earn rewards.`);
});

// --- 2. TUTOURLARIN DİNAMİK FİLTRASİYASI ---
const filterButtons = document.querySelectorAll('.filter-btn');
const tutorCards = document.querySelectorAll('.tutor-card');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        tutorCards.forEach(card => {
            const categories = card.getAttribute('data-category');
            if (filter === 'all' || categories.includes(filter)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// --- 3. REKLAM İZLƏYİB MÜƏLLİMLƏ DİSCORD KONTAKTINI AÇMAQ ---
const unlockButtons = document.querySelectorAll('.unlock-tutor-btn');

unlockButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();

        // 1. Giriş edibmi?
        if (!activeUser) {
            alert("🔒 Please identify yourself first to contact tutors!");
            authModal.classList.remove('hidden');
            return;
        }

        const discordLink = this.getAttribute('data-discord');
        const originalHTML = this.innerHTML;

        // 2. Reklamı açırıq
        const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
        const adWindow = window.open(adUrl, "_blank");

        // TELEFONDA POPUP BLOKLANSAYSA TAYMER İŞƏ DÜŞMÜR:
        if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
            alert("⚠️ Pop-up Blocked!\nPlease allow pop-ups in your browser settings to verify the sponsor ad and unlock tutor contact.");
            return;
        }

        // 3. 10 Saniyəlik Geri Sayım
        this.style.pointerEvents = 'none';
        this.style.opacity = '0.7';

        let timeLeft = 10;
        this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;

        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;
            } else {
                clearInterval(timer);

                // Əlaqəni açırıq
                this.innerHTML = '<i class="fab fa-discord"></i> Open Discord Chat';
                this.style.background = "linear-gradient(135deg, #10b981, #059669)";
                this.style.pointerEvents = 'auto';
                this.style.opacity = '1';

                // Discord linkinə yönləndiririk
                window.open(discordLink, "_blank");
            }
        }, 1000);
    });
});
