import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ezccynahgubalainoqkf.supabase.co';
const supabaseKey = 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DISCORD WEBHOOK LINKINI BURA YAPIŞDIR ---
const DISCORD_WEBHOOK_URL = "BURAYA_OZ_DISCORD_WEBHOOK_LINKINI_YAPISDIR";

// --- 1. SƏHİFƏYƏ İLK GİRİŞDƏ ROL SEÇİMİ (WELCOME ONBOARDING) ---
document.addEventListener("DOMContentLoaded", () => {
    const welcomeModal = document.getElementById("welcomeRoleModal");
    const welcomeChooseLearner = document.getElementById("welcomeChooseLearner");
    const welcomeChooseEducator = document.getElementById("welcomeChooseEducator");

    const hasChosenRole = localStorage.getItem("sultan_role_chosen");

    // Əgər istifadəçi ilk dəfədirsə, 1.2 saniyə sonra seçim pəncərəsi açılsın
    if (!hasChosenRole && welcomeModal) {
        setTimeout(() => {
            welcomeModal.classList.remove("hidden");
        }, 1200);
    }

    if (welcomeChooseLearner) {
        welcomeChooseLearner.addEventListener("click", () => {
            localStorage.setItem("sultan_role_chosen", "true");
            localStorage.setItem("sultan_role", "learner");
            welcomeModal.classList.add("hidden");
            switchRole("learner");
        });
    }

    if (welcomeChooseEducator) {
        welcomeChooseEducator.addEventListener("click", () => {
            localStorage.setItem("sultan_role_chosen", "true");
            localStorage.setItem("sultan_role", "educator");
            welcomeModal.classList.add("hidden");
            // Müəllim rejiminə keçib müraciət formasını açırıq
            switchRole("educator");
            const dashboardModal = document.getElementById("dashboardModal");
            if (dashboardModal) dashboardModal.classList.remove("hidden");
        });
    }

    loadEducators();
});

// --- 2. DUAL ROLE DASHBOARD VƏ LOGIN DÜYMƏSİ ---
const navAuthBtn = document.getElementById("navAuthBtn");
const navAuthText = document.getElementById("navAuthText");
const dashboardModal = document.getElementById("dashboardModal");
const closeDashboardModal = document.getElementById("closeDashboardModal");

const btnModeLearner = document.getElementById("btnModeLearner");
const btnModeEducator = document.getElementById("btnModeEducator");
const viewLearner = document.getElementById("viewLearner");
const viewEducator = document.getElementById("viewEducator");

let currentActiveRole = localStorage.getItem("sultan_role") || "learner";

function switchRole(role) {
    currentActiveRole = role;
    localStorage.setItem("sultan_role", role);

    if (btnModeLearner && btnModeEducator && viewLearner && viewEducator) {
        if (role === "learner") {
            btnModeLearner.classList.add("active");
            btnModeEducator.classList.remove("active");
            viewLearner.classList.remove("hidden");
            viewEducator.classList.add("hidden");
        } else {
            btnModeEducator.classList.add("active");
            btnModeLearner.classList.remove("active");
            viewEducator.classList.remove("hidden");
            viewLearner.classList.add("hidden");
        }
    }
}

// Login düyməsi kliklənəndə dashboard açılsın
if (navAuthBtn && dashboardModal) {
    navAuthBtn.addEventListener("click", (e) => {
        e.preventDefault();
        dashboardModal.classList.remove("hidden");
        switchRole(currentActiveRole);
    });
}

if (closeDashboardModal && dashboardModal) {
    closeDashboardModal.addEventListener("click", () => {
        dashboardModal.classList.add("hidden");
    });
}

if (btnModeLearner) btnModeLearner.addEventListener("click", () => switchRole("learner"));
if (btnModeEducator) btnModeEducator.addEventListener("click", () => switchRole("educator"));

// --- 3. DISCORD WEBHOOK BİLDİRİŞ FUNKSİYASI ---
async function notifyDiscordOnNewTutor(tutorData) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("BURAYA")) return;

    const payload = {
        username: "Sultan Academy Bot",
        avatar_url: "https://sultanalizada.github.io/logo.png",
        embeds: [{
            title: "🎓 Yeni Mentor / Tutor Müraciəti!",
            color: 3711992,
            fields: [
                { name: "👤 Ad / Soyad", value: tutorData.name, inline: true },
                { name: "🌍 Dil", value: tutorData.language, inline: true },
                { name: "📚 Fənn / Sahə", value: tutorData.subject, inline: true },
                { name: "💰 Qiymət", value: tutorData.price, inline: true },
                { name: "🔴 Canlı Dərs / Yayım?", value: tutorData.offers_live_sessions ? "✅ Bəli (Sultan Academy Discord)" : "❌ Xeyr", inline: true },
                { name: "💬 Discord Otağı", value: tutorData.discord_channel, inline: false },
                { name: "📅 Cal.com", value: tutorData.cal_link || "Qoşulmayıb", inline: false }
            ],
            footer: { text: "admin.html portalından təsdiqləyin və ya rədd edin." },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Discord Webhook Error:", err);
    }
}

// --- 4. MÜƏLLİM MÜRACİƏT FORMASININ GÖNDƏRİLMƏSİ ---
const tutorForm = document.getElementById("tutorApplicationForm");

if (tutorForm) {
    tutorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = tutorForm.querySelector(".submit-profile-btn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        const tutorData = {
            name: document.getElementById("tutorName").value.trim(),
            avatar_url: document.getElementById("tutorAvatar").value.trim(),
            language: document.getElementById("tutorLanguage").value.trim(),
            subject: document.getElementById("tutorSubject").value.trim(),
            price: document.getElementById("tutorPrice").value.trim(),
            discord_channel: document.getElementById("tutorDiscordChannel").value.trim(),
            offers_live_sessions: document.getElementById("tutorOffersLive").checked,
            cal_link: document.getElementById("tutorCalLink").value.trim(),
            status: "pending"
        };

        const { error } = await supabase.from("tutors").insert([tutorData]);

        if (!error) {
            await notifyDiscordOnNewTutor(tutorData);
            alert("🎉 Your Educator card has been submitted! Sultan Academy admin will review and approve it shortly.");
            dashboardModal.classList.add("hidden");
            tutorForm.reset();
        } else {
            alert("Error submitting profile. Please check your connection and fields.");
        }

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// --- 5. DİNAMİK MÜƏLLİM KARTLARI VƏ FİLTRLƏR ---
async function loadEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    const dynamicFilters = document.getElementById("dynamicFilters");

    if (!tutorsGrid) return;

    // Bazadan yalnız təsdiqlənmiş müəllimləri çəkirik
    const { data: tutors, error } = await supabase
        .from("tutors")
        .select("*")
        .eq("status", "approved");

    if (error || !tutors || tutors.length === 0) {
        tutorsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-user-clock" style="font-size: 32px; margin-bottom: 12px; color: #38bdf8;"></i>
                <p>No active educators right now. Apply above to be featured!</p>
            </div>
        `;
        return;
    }

    tutorsGrid.innerHTML = "";
    const uniqueLanguages = new Set();

    tutors.forEach(t => {
        const langClean = t.language.toLowerCase().trim();
        uniqueLanguages.add(langClean);

        const card = document.createElement("div");
        card.className = "tutor-card";
        card.setAttribute("data-category", langClean);

        card.innerHTML = `
            <div class="tutor-header">
                <img src="${t.avatar_url || 'your-photo.jpg'}" alt="${t.name}" class="tutor-avatar">
                <div class="tutor-main-info">
                    <h3>${t.name} <i class="fas fa-check-circle verified-badge" title="Verified Mentor"></i></h3>
                    <p class="tutor-title">${t.subject}</p>
                    <div class="tutor-rating">
                        <span class="stars">⭐⭐⭐⭐⭐</span>
                        <strong>5.0</strong> <span class="rating-count">(Verified)</span>
                    </div>
                </div>
            </div>
            <p class="tutor-bio">Teaching <b>${t.language}</b>. Lessons held directly on Sultan Academy Discord.</p>
            <div class="tutor-tags">
                <span>${t.language}</span>
                ${t.offers_live_sessions ? '<span style="color:#10b981; border-color:#10b981;">🔴 Live Discord Sessions</span>' : ''}
            </div>
            <div class="tutor-footer">
                <div class="tutor-price">${t.price}</div>
                <div class="tutor-action-group">
                    <button class="unlock-tutor-btn" data-discord="${t.discord_channel}">
                        <i class="fab fa-discord"></i> Unlock Discord Room (Watch AD)
                    </button>
                    ${t.cal_link ? `<a href="${t.cal_link}" target="_blank" class="cal-booking-btn" rel="noopener"><i class="fas fa-calendar-alt"></i> Book on Cal.com</a>` : ''}
                </div>
            </div>
        `;
        tutorsGrid.appendChild(card);
    });

    // Dinamik Filtr Düymələri
    if (dynamicFilters) {
        dynamicFilters.innerHTML = `<button class="filter-btn active" data-filter="all">All Mentors</button>`;
        uniqueLanguages.forEach(lang => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.setAttribute("data-filter", lang);
            btn.innerText = lang.charAt(0).toUpperCase() + lang.slice(1);
            dynamicFilters.appendChild(btn);
        });

        dynamicFilters.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                dynamicFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.getAttribute("data-filter");

                document.querySelectorAll(".tutor-card").forEach(card => {
                    const cat = card.getAttribute("data-category");
                    card.style.display = (filter === "all" || cat.includes(filter)) ? "flex" : "none";
                });
            });
        });
    }

    // Reklamla Discord Linkini Açmaq
    document.querySelectorAll(".unlock-tutor-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const discordLink = this.getAttribute("data-discord");
            const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
            const adWindow = window.open(adUrl, "_blank");

            if (!adWindow || adWindow.closed || typeof adWindow.closed === "undefined") {
                return alert("⚠️ Pop-up Blocked! Please allow pop-ups to verify the sponsor ad and unlock the room.");
            }

            this.style.pointerEvents = "none";
            let timeLeft = 10;
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;

            const timer = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;
                } else {
                    clearInterval(timer);
                    this.innerHTML = '<i class="fab fa-discord"></i> Opened';
                    this.style.background = "#10b981";
                    this.style.pointerEvents = "auto";
                    window.open(discordLink, "_blank");
                }
            }, 1000);
        });
    });
}
