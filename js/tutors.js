import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ezccynahgubalainoqkf.supabase.co';
const supabaseKey = 'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DISCORD WEBHOOK LINKINI BURA YAPIŞDIR ---
const DISCORD_WEBHOOK_URL = "BURAYA_OZ_DISCORD_WEBHOOK_LINKINI_YAPISDIR";

// --- 1. ELEMENTLƏRİN SEÇİLMƏSİ (TƏKRARSIZ VƏ TƏMİZ) ---
const navActionBtn = document.getElementById("navActionBtn");
const navActionText = document.getElementById("navActionText");

const joinModal = document.getElementById("joinModal");
const closeJoinModal = document.getElementById("closeJoinModal");
const joinUsernameInput = document.getElementById("joinUsernameInput");
const joinSubmitBtn = document.getElementById("joinSubmitBtn");

const dashboardModal = document.getElementById("dashboardModal");
const closeDashboardModal = document.getElementById("closeDashboardModal");
const dashUsernameDisplay = document.getElementById("dashUsernameDisplay");

const btnStudentMode = document.getElementById("btnStudentMode");
const btnEducatorMode = document.getElementById("btnEducatorMode");
const studentDashboardArea = document.getElementById("studentDashboardArea");
const educatorDashboardArea = document.getElementById("educatorDashboardArea");

let activeUser = localStorage.getItem("sultan_user") || null;
let activeRole = localStorage.getItem("sultan_role") || "student";

// --- 2. NAVİQASİYA DÜYMƏSİNİN VƏZİYYƏTİ ---
function updateNavUI() {
    if (activeUser) {
        if (navActionText) navActionText.innerText = `${activeUser} (Dashboard)`;
        if (dashUsernameDisplay) dashUsernameDisplay.innerText = activeUser;
    } else {
        if (navActionText) navActionText.innerText = "Join Academy";
    }
}
updateNavUI();

// Əsas Düymə: İstifadəçi yoxdursa "Join" açılır, varsa "Dashboard"
if (navActionBtn) {
    navActionBtn.addEventListener("click", () => {
        if (!activeUser) {
            if (joinModal) {
                joinModal.classList.remove("hidden");
                document.body.classList.add("modal-open");
            }
        } else {
            if (dashboardModal) {
                dashboardModal.classList.remove("hidden");
                document.body.classList.add("modal-open");
                setRole(activeRole);
            }
        }
    });
}

// Qeydiyyatı təsdiq etmək (Frictionsuz Username ilə)
if (joinSubmitBtn) {
    joinSubmitBtn.addEventListener("click", () => {
        const username = joinUsernameInput ? joinUsernameInput.value.trim().toLowerCase() : "";
        if (!username) return alert("Please enter a username!");

        activeUser = username;
        localStorage.setItem("sultan_user", username);
        updateNavUI();

        if (joinModal) joinModal.classList.add("hidden");
        if (dashboardModal) {
            dashboardModal.classList.remove("hidden");
            setRole(activeRole);
        }
    });
}

// --- 3. İKİLİ ROL KEÇİDİ (STUDENT 🔁 EDUCATOR) ---
function setRole(role) {
    activeRole = role;
    localStorage.setItem("sultan_role", role);

    if (role === "student") {
        if (btnStudentMode) btnStudentMode.classList.add("active");
        if (btnEducatorMode) btnEducatorMode.classList.remove("active");
        if (studentDashboardArea) studentDashboardArea.classList.remove("hidden");
        if (educatorDashboardArea) educatorDashboardArea.classList.add("hidden");
    } else {
        if (btnEducatorMode) btnEducatorMode.classList.add("active");
        if (btnStudentMode) btnStudentMode.classList.remove("active");
        if (educatorDashboardArea) educatorDashboardArea.classList.remove("hidden");
        if (studentDashboardArea) studentDashboardArea.classList.add("hidden");
    }
}

if (btnStudentMode) btnStudentMode.addEventListener("click", () => setRole("student"));
if (btnEducatorMode) btnEducatorMode.addEventListener("click", () => setRole("educator"));

// Pəncərələri (Modalları) bağlamaq
if (closeJoinModal && joinModal) {
    closeJoinModal.addEventListener("click", () => {
        joinModal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    });
}

if (closeDashboardModal && dashboardModal) {
    closeDashboardModal.addEventListener("click", () => {
        dashboardModal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    });
}

// --- 4. DISCORD WEBHOOK BİLDİRİŞİ ---
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
                { name: "📧 Email (Gizli)", value: tutorData.email || "Qeyd edilməyib", inline: true },
                { name: "🌍 Dil", value: tutorData.language, inline: true },
                { name: "📚 Fənn / Sahə", value: tutorData.subject, inline: true },
                { name: "💰 Qiymət", value: tutorData.price, inline: true },
                { name: "🔴 Canlı Dərs / Yayım?", value: tutorData.offers_live_sessions ? "✅ Bəli" : "❌ Xeyr", inline: true },
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

// --- 5. MÜƏLLİM MÜRACİƏTİ VƏ KART REDAKTƏSİ (SUBMIT & EDIT) ---
const tutorForm = document.getElementById("tutorApplicationForm");

if (tutorForm) {
    tutorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = e.submitter || tutorForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : "Submit";
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
        }

        const emailInput = document.getElementById("tutorEmail");
        const tutorEmail = emailInput ? emailInput.value.trim() : "";

        const tutorData = {
            name: document.getElementById("tutorName").value.trim(),
            email: tutorEmail,
            avatar_url: document.getElementById("tutorAvatar").value.trim(),
            language: document.getElementById("tutorLanguage").value.trim(),
            subject: document.getElementById("tutorSubject").value.trim(),
            price: document.getElementById("tutorPrice").value.trim(),
            discord_channel: document.getElementById("tutorDiscordChannel").value.trim(),
            offers_live_sessions: document.getElementById("tutorOffersLive").checked,
            cal_link: document.getElementById("tutorCalLink").value.trim(),
            status: "pending"
        };

        const { data: existing } = await supabase.from("tutors").select("id").eq("email", tutorEmail).single();

        let operationError = null;

        if (existing) {
            const { error } = await supabase.from("tutors").update(tutorData).eq("id", existing.id);
            operationError = error;
        } else {
            const { error } = await supabase.from("tutors").insert([tutorData]);
            operationError = error;
        }

        if (!operationError) {
            await notifyDiscordOnNewTutor(tutorData);
            alert("🎉 Your Educator card has been saved and is now PENDING admin approval!");
            if (dashboardModal) dashboardModal.classList.add("hidden");
            document.body.classList.remove("modal-open");
            tutorForm.reset();
        } else {
            alert("Error saving profile. Please check your connection and fields.");
        }

        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// --- 6. DİNAMİK MÜƏLLİM KARTLARI VƏ FİLTRLƏR ---
async function loadEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    const dynamicFilters = document.getElementById("dynamicFilters");

    if (!tutorsGrid) return;

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
                <img src="${t.avatar_url || 'your-photo.jpg'}" alt="${t.name}" class="tutor-avatar" onerror="this.src='your-photo.jpg'">
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
                    <button class="unlock-tutor-btn" data-target="${t.discord_channel}" data-type="Discord Room">
                        <i class="fab fa-discord"></i> Discord Room (Watch AD)
                    </button>
                    ${t.cal_link ? `
                    <button class="cal-booking-btn unlock-cal-btn" data-target="${t.cal_link}" data-type="Cal.com Booking">
                        <i class="fas fa-calendar-alt"></i> Book on Cal.com (Watch AD)
                    </button>` : ''}
                </div>
            </div>
        `;
        tutorsGrid.appendChild(card);
    });

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

    // Reklamla Açılış
    document.querySelectorAll(".unlock-tutor-btn, .unlock-cal-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute("data-target");
            const targetType = this.getAttribute("data-type") || "Link";

            const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
            const adWindow = window.open(adUrl, "_blank");

            if (!adWindow || adWindow.closed || typeof adWindow.closed === "undefined") {
                return alert(`⚠️ Pop-up Blocked! Please allow pop-ups to verify the sponsor ad and unlock ${targetType}.`);
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
                    this.innerHTML = `<i class="fas fa-check"></i> ${targetType} Opened`;
                    this.style.background = "#10b981";
                    this.style.pointerEvents = "auto";
                    window.open(targetUrl, "_blank");
                }
            }, 1000);
        });
    });
}

// Səhifə yüklənəndə müəllimləri avtomatik çağırırıq
document.addEventListener("DOMContentLoaded", loadEducators);
