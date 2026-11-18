import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ezccynahgubalainoqkf.supabase.co';
const supabaseKey = 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX';
const supabase = createClient(supabaseUrl, supabaseKey);

let activeUser = localStorage.getItem('sultan_user') || null;

const navAuthBtn = document.getElementById('navAuthBtn');
const navAuthText = document.getElementById('navAuthText');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');

// Tablar
const tabLearner = document.getElementById('tabLearner');
const tabEducator = document.getElementById('tabEducator');
const learnerForm = document.getElementById('learnerForm');
const educatorForm = document.getElementById('educatorForm');

// Düymələr
const learnerSubmitBtn = document.getElementById('learnerSubmitBtn');
const educatorSubmitBtn = document.getElementById('educatorSubmitBtn');
const learnerUsernameInput = document.getElementById('learnerUsernameInput');

function updateAuthUI() {
    if (activeUser) {
        navAuthText.innerText = activeUser;
    } else {
        navAuthText.innerText = "Login";
    }
}
updateAuthUI();

// Modal Aç / Bağla
navAuthBtn.addEventListener('click', () => {
    if (activeUser) {
        if (confirm(`Logged in as "${activeUser}". Logout?`)) {
            localStorage.removeItem('sultan_user');
            activeUser = null;
            updateAuthUI();
        }
    } else {
        authModal.classList.remove('hidden');
    }
});

closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));

// Tab dəyişimi
tabLearner.addEventListener('click', () => {
    tabLearner.classList.add('active');
    tabEducator.classList.remove('active');
    learnerForm.classList.remove('hidden');
    educatorForm.classList.add('hidden');
});

tabEducator.addEventListener('click', () => {
    tabEducator.classList.add('active');
    tabLearner.classList.remove('active');
    educatorForm.classList.remove('hidden');
    learnerForm.classList.add('hidden');
});

// Tələbə Girişi
learnerSubmitBtn.addEventListener('click', async () => {
    const username = learnerUsernameInput.value.trim().toLowerCase();
    if (!username) return alert("Please enter a username.");

    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    if (!data) {
        await supabase.from('users').insert([{ username: username, role: 'learner', sp: 0 }]);
    }

    activeUser = username;
    localStorage.setItem('sultan_user', username);
    updateAuthUI();
    authModal.classList.add('hidden');
    alert(`Welcome back, ${username}!`);
});

// Müəllim Qeydiyyatı
educatorSubmitBtn.addEventListener('click', async () => {
    const name = document.getElementById('eduName').value.trim();
    const title = document.getElementById('eduTitle').value.trim();
    const languages = document.getElementById('eduLanguages').value.trim();
    const bio = document.getElementById('eduBio').value.trim();
    const discord = document.getElementById('eduDiscord').value.trim();
    const cal = document.getElementById('eduCal').value.trim();
    const price = document.getElementById('eduPrice').value.trim();

    if (!name || !title || !languages) {
        return alert("Please fill in Name, Title, and Languages.");
    }

    educatorSubmitBtn.innerText = "Submitting application...";

    const { error } = await supabase.from('tutors').insert([{
        name, title, languages, bio,
        discord_link: discord,
        cal_link: cal,
        hourly_rate: price || "Free Trial",
        status: "pending" // Admin təsdiqləyənə qədər gözləyir
    }]);

    if (!error) {
        alert("🎉 Application submitted successfully! Admin will review your profile shortly.");
        authModal.classList.add('hidden');
    } else {
        alert("Error submitting profile. Please try again.");
    }
    educatorSubmitBtn.innerText = "Submit Educator Profile";
});

// --- DİNAMİK MÜƏLLİMLƏR VƏ DİNAMİK FİLTRLƏR ---
async function loadEducators() {
    const tutorsGrid = document.getElementById('tutorsGrid');
    const dynamicFilters = document.getElementById('dynamicFilters');

    // Yalnız admin tərəfindən 'approved' edilmiş müəllimləri çəkirik
    const { data: tutors, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('status', 'approved');

    if (error || !tutors || tutors.length === 0) {
        tutorsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-user-clock" style="font-size: 30px; margin-bottom: 10px; color: #38bdf8;"></i>
                <p>No active educators right now. Apply above to be the first!</p>
            </div>
        `;
        return;
    }

    tutorsGrid.innerHTML = "";

    // Unikal dilləri toplayırıq ki, filtr düymələri yaransın
    const uniqueLanguages = new Set();

    tutors.forEach(t => {
        const langList = t.languages.split(',').map(l => l.trim().toLowerCase());
        langList.forEach(l => uniqueLanguages.add(l));

        const card = document.createElement('div');
        card.className = 'tutor-card';
        card.setAttribute('data-category', langList.join(' '));

        card.innerHTML = `
            <div class="tutor-header">
                <img src="${t.avatar_url || 'your-photo.jpg'}" alt="${t.name}" class="tutor-avatar">
                <div class="tutor-main-info">
                    <h3>${t.name} <i class="fas fa-check-circle verified-badge" title="Verified Mentor"></i></h3>
                    <p class="tutor-title">${t.title}</p>
                    <div class="tutor-rating">
                        <span class="stars">⭐⭐⭐⭐⭐</span>
                        <strong>5.0</strong> <span class="rating-count">(Verified)</span>
                    </div>
                </div>
            </div>
            <p class="tutor-bio">${t.bio || 'Passionate educator on Sultan Academy.'}</p>
            <div class="tutor-tags">
                ${t.languages.split(',').map(lang => `<span>${lang.trim()}</span>`).join('')}
            </div>
            <div class="tutor-footer">
                <div class="tutor-price">${t.hourly_rate}</div>
                <div class="tutor-action-group">
                    <button class="unlock-tutor-btn" data-discord="${t.discord_link || 'https://discord.gg/rPbq3sWNCQ'}">
                        <i class="fas fa-lock"></i> Discord Contact (Watch AD)
                    </button>
                    ${t.cal_link ? `<a href="${t.cal_link}" target="_blank" class="cal-booking-btn"><i class="fas fa-calendar-alt"></i> Book on Cal.com</a>` : ''}
                    <a href="https://meet.google.com/new" target="_blank" class="meet-btn">
                        <i class="fas fa-video"></i> Instant Google Meet
                    </a>
                </div>
            </div>
        `;
        tutorsGrid.appendChild(card);
    });

    // Filtrləri DOM-a yerləşdiririk
    dynamicFilters.innerHTML = `<button class="filter-btn active" data-filter="all">All Mentors</button>`;
    uniqueLanguages.forEach(lang => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-filter', lang);
        btn.innerText = lang.charAt(0).toUpperCase() + lang.slice(1);
        dynamicFilters.appendChild(btn);
    });

    // Filtr kliklənməsi
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            document.querySelectorAll('.tutor-card').forEach(card => {
                const cats = card.getAttribute('data-category');
                card.style.display = (filter === 'all' || cats.includes(filter)) ? 'flex' : 'none';
            });
        });
    });

    // Reklamla Discord açma məntiqi
    document.querySelectorAll('.unlock-tutor-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!activeUser) {
                alert("🔒 Please identify yourself first to contact mentors!");
                authModal.classList.remove('hidden');
                return;
            }

            const discordLink = this.getAttribute('data-discord');
            const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
            const adWindow = window.open(adUrl, "_blank");

            if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
                return alert("⚠️ Pop-up Blocked! Please allow pop-ups to verify the sponsor ad.");
            }

            this.style.pointerEvents = 'none';
            let timeLeft = 10;
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;

            const timer = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;
                } else {
                    clearInterval(timer);
                    this.innerHTML = '<i class="fab fa-discord"></i> Open Discord Chat';
                    this.style.background = "#10b981";
                    this.style.pointerEvents = 'auto';
                    window.open(discordLink, "_blank");
                }
            }, 1000);
        });
    });
}

document.addEventListener("DOMContentLoaded", loadEducators);
