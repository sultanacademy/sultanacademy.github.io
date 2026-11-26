import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    'https://ezccynahgubalainoqkf.supabase.co',
    'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX'
);

let allReviews = [];

async function loadEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    const dynamicFilters = document.getElementById("dynamicFilters");
    if (!tutorsGrid) return;

    // 1. Yalnız açıq (public) sütunları çəkirik (email və edit_pin bazada gizli qalır!)
    const { data: tutors, error } = await supabase
        .from("tutors")
        .select("id, name, avatar_url, language, subject, price, discord_channel, offers_live_sessions, cal_link, status")
        .eq("status", "approved")
        .order("id", { ascending: false });

    // 2. Bütün rəyləri çəkirik
    const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    allReviews = reviews || [];

    if (error || !tutors || tutors.length === 0) {
        tutorsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-user-clock" style="font-size: 32px; margin-bottom: 12px; color: #38bdf8;"></i>
                <p>No active educators right now. Be the first to apply in the Dashboard!</p>
            </div>`;
        return;
    }

    tutorsGrid.innerHTML = "";
    const uniqueLanguages = new Set();

    tutors.forEach(t => {
        const langClean = t.language.toLowerCase().trim();
        uniqueLanguages.add(langClean);

        // Orta balın hesablanması
        const tutorRevs = allReviews.filter(r => r.tutor_id === t.id);
        let ratingText = `<strong>New</strong> <span class="rating-count">(No reviews yet)</span>`;
        if (tutorRevs.length > 0) {
            const avg = (tutorRevs.reduce((sum, r) => sum + r.rating, 0) / tutorRevs.length).toFixed(1);
            const stars = "⭐".repeat(Math.round(avg));
            ratingText = `<span class="stars">${stars}</span> <strong>${avg}</strong> <span class="rating-count">(${tutorRevs.length} reviews)</span>`;
        }

        const card = document.createElement("div");
        card.className = "tutor-card";
        card.setAttribute("data-category", langClean);

        card.innerHTML = `
            <div class="tutor-header">
                <img src="${t.avatar_url || 'your-photo.jpg'}" alt="${t.name}" class="tutor-avatar" onerror="this.src='your-photo.jpg'">
                <div class="tutor-main-info">
                    <h3>${t.name} <i class="fas fa-check-circle verified-badge" title="Verified Educator"></i></h3>
                    <p class="tutor-title">${t.subject}</p>
                    <div class="tutor-rating">${ratingText}</div>
                </div>
            </div>
            <p class="tutor-bio">Teaching <b>${t.language}</b> directly on Sultan Academy Discord.</p>
            <div class="tutor-tags">
                <span>${t.language}</span>
                ${t.offers_live_sessions ? '<span style="color:#10b981; border-color:#10b981;">🔴 Live Discord Sessions</span>' : ''}
            </div>
            <div class="tutor-footer">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="tutor-price">${t.price}</div>
                    <button class="btn-reviews open-reviews-btn" data-id="${t.id}" data-name="${t.name}" type="button">
                        <i class="fas fa-star"></i> Reviews (${tutorRevs.length})
                    </button>
                </div>
                <div class="tutor-action-group">
                    <button class="unlock-tutor-btn" data-target="${t.discord_channel}" data-type="Discord Room" data-name="${t.name}" data-lang="${t.language}" data-subj="${t.subject}">
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

    // Dinamik Filtrlər
    if (dynamicFilters) {
        dynamicFilters.innerHTML = `<button class="filter-btn active" data-filter="all">All Educators</button>`;
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
                document.querySelectorAll(".tutor-card").forEach(c => {
                    c.style.display = (filter === "all" || c.getAttribute("data-category").includes(filter)) ? "flex" : "none";
                });
            });
        });
    }

    // Reklamla Açılış + Dashboard-da Yadda Saxlama
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

                    // Əgər Discord otağıdırsa, Student Dashboard siyahısına əlavə et
                    if (this.classList.contains("unlock-tutor-btn")) {
                        const saved = JSON.parse(localStorage.getItem("sultan_unlocked_tutors") || "[]");
                        const name = this.getAttribute("data-name");
                        if (!saved.some(x => x.name === name)) {
                            saved.push({
                                name,
                                language: this.getAttribute("data-lang"),
                                subject: this.getAttribute("data-subj"),
                                link: targetUrl
                            });
                            localStorage.setItem("sultan_unlocked_tutors", JSON.stringify(saved));
                        }
                    }

                    window.open(targetUrl, "_blank");
                }
            }, 1000);
        });
    });

    // Rəylər Modalını Açmaq
    document.querySelectorAll(".open-reviews-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = parseInt(btn.getAttribute("data-id"));
            const name = btn.getAttribute("data-name");
            openReviewsModal(id, name);
        });
    });
}

const reviewsModal = document.getElementById("reviewsModal");
const closeReviewsModal = document.getElementById("closeReviewsModal");
if (closeReviewsModal) {
    closeReviewsModal.addEventListener("click", () => reviewsModal.classList.add("hidden"));
}

function openReviewsModal(tutorId, tutorName) {
    document.getElementById("reviewsModalTitle").innerText = `Reviews for ${tutorName}`;
    document.getElementById("revTutorId").value = tutorId;

    const list = document.getElementById("reviewsList");
    const tutorRevs = allReviews.filter(r => r.tutor_id === tutorId);

    if (tutorRevs.length === 0) {
        list.innerHTML = `<p style="color:#94a3b8; font-size:13px;">No reviews yet. Be the first to leave feedback!</p>`;
    } else {
        list.innerHTML = tutorRevs.map(r => `
            <div class="review-item">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <strong style="color:#f8fafc; font-size:13px;">${r.student_name}</strong>
                    <span style="font-size:12px;">${"⭐".repeat(r.rating)}</span>
                </div>
                <p style="color:#cbd5e1; font-size:12px; margin:0;">${r.comment}</p>
            </div>
        `).join("");
    }
    reviewsModal.classList.remove("hidden");
}

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const tutorId = parseInt(document.getElementById("revTutorId").value);
        const studentName = document.getElementById("revStudentName").value.trim();
        const rating = parseInt(document.getElementById("revRating").value);
        const comment = document.getElementById("revComment").value.trim();

        const { error } = await supabase.from("reviews").insert([{ tutor_id: tutorId, student_name: studentName, rating, comment }]);
        if (!error) {
            alert("⭐ Thank you for your review!");
            reviewForm.reset();
            reviewsModal.classList.add("hidden");
            loadEducators();
        } else {
            alert("Could not post review. Try again.");
        }
    });
}

document.addEventListener("DOMContentLoaded", loadEducators);
