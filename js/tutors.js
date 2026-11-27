import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    'https://ezccynahgubalainoqkf.supabase.co',
    'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX'
);

let allReviews = [];

// TABLAR (EDUCATORS vs PARTNERS)
const tabDirEdu = document.getElementById("tabDirEducators");
const tabDirPart = document.getElementById("tabDirPartners");
const areaEdu = document.getElementById("dirEducatorsArea");
const areaPart = document.getElementById("dirPartnersArea");

function switchDirectoryTab(tab) {
    if (tab === "partners") {
        tabDirPart.classList.add("active");
        tabDirEdu.classList.remove("active");
        areaPart.classList.remove("hidden");
        areaEdu.classList.add("hidden");
        loadPartners();
    } else {
        tabDirEdu.classList.add("active");
        tabDirPart.classList.remove("active");
        areaEdu.classList.remove("hidden");
        areaPart.classList.add("hidden");
    }
}

if (tabDirEdu && tabDirPart) {
    tabDirEdu.addEventListener("click", () => switchDirectoryTab("educators"));
    tabDirPart.addEventListener("click", () => switchDirectoryTab("partners"));
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "partners") switchDirectoryTab("partners");
}

// 1. EDUCATORS YÜKLƏMƏ
async function loadEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    const dynamicFilters = document.getElementById("dynamicFilters");
    if (!tutorsGrid) return;

    const { data: tutors, error } = await supabase
        .from("tutors")
        .select("id, name, avatar_url, category, language, subject, price, discord_channel, offers_live_sessions, cal_link, status")
        .eq("status", "approved")
        .order("id", { ascending: false });

    const { data: reviews } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    allReviews = reviews || [];

    if (error || !tutors || tutors.length === 0) {
        tutorsGrid.innerHTML = `<p style="grid-column:1/-1; color:#64748b; padding:30px;">No active educators right now.</p>`;
        return;
    }

    tutorsGrid.innerHTML = "";
    const filterCategories = new Set();

    tutors.forEach(t => {
        const mainCat = (t.category || "Languages").trim();
        const langClean = t.language.trim();
        filterCategories.add(mainCat);

        const tutorRevs = allReviews.filter(r => r.tutor_id === t.id);
        let ratingText = `<strong>New</strong> <span class="rating-count">(No reviews yet)</span>`;
        if (tutorRevs.length > 0) {
            const avg = (tutorRevs.reduce((sum, r) => sum + r.rating, 0) / tutorRevs.length).toFixed(1);
            ratingText = `<span class="stars">${"⭐".repeat(Math.round(avg))}</span> <strong>${avg}</strong> <span class="rating-count">(${tutorRevs.length} reviews)</span>`;
        }

        const safeRoomName = `SultanAcad-${t.id}-${t.name.replace(/[^a-zA-Z0-9]/g, "")}`;
        const jitsiUrl = `classroom.html?room=${safeRoomName}`;

        const card = document.createElement("div");
        card.className = "tutor-card";
        card.setAttribute("data-category", `${mainCat.toLowerCase()} ${langClean.toLowerCase()}`);

        card.innerHTML = `
            <div class="tutor-header">
                <img src="${t.avatar_url || 'your-photo.jpg'}" alt="${t.name}" class="tutor-avatar" onerror="this.src='your-photo.jpg'">
                <div class="tutor-main-info">
                    <h3>${t.name} <i class="fas fa-check-circle verified-badge"></i></h3>
                    <p class="tutor-title">${t.subject}</p>
                    <div class="tutor-rating">${ratingText}</div>
                </div>
            </div>
            <p class="tutor-bio">Category: <b>${mainCat}</b> • Teaching <b>${t.language}</b></p>
            <div class="tutor-tags">
                <span>${mainCat}</span>
                <span>${t.language}</span>
                ${t.offers_live_sessions ? '<span style="color:#10b981; border-color:#10b981;">🔴 Live Sessions</span>' : ''}
            </div>
            <div class="tutor-footer">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="tutor-price">${t.price}</div>
                    <button class="btn-reviews open-reviews-btn" data-id="${t.id}" data-name="${t.name}" type="button">
                        <i class="fas fa-star"></i> Reviews (${tutorRevs.length})
                    </button>
                </div>
                <div class="tutor-action-group">
                    <button class="unlock-tutor-btn ad-gate-btn" data-target="${t.discord_channel}" data-type="Discord Room" data-name="${t.name}" data-lang="${t.language}" data-subj="${t.subject}">
                        <i class="fab fa-discord"></i> Discord Room (Watch AD)
                    </button>
                    <button class="video-room-btn ad-gate-btn" data-target="${jitsiUrl}" data-type="Video Classroom">
                        <i class="fas fa-video"></i> Video Classroom (Watch AD)
                    </button>
                    ${t.cal_link ? `<button class="cal-booking-btn ad-gate-btn" data-target="${t.cal_link}" data-type="Cal.com Booking"><i class="fas fa-calendar-alt"></i> Book on Cal.com (Watch AD)</button>` : ''}
                </div>
            </div>`;
        tutorsGrid.appendChild(card);
    });

    if (dynamicFilters) {
        dynamicFilters.innerHTML = `<button class="filter-btn active" data-filter="all">All Disciplines</button>`;
        filterCategories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "filter-btn";
            btn.setAttribute("data-filter", cat.toLowerCase());
            btn.innerText = cat;
            dynamicFilters.appendChild(btn);
        });

        dynamicFilters.querySelectorAll(".filter-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                dynamicFilters.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.getAttribute("data-filter");
                document.querySelectorAll("#tutorsGrid .tutor-card").forEach(c => {
                    c.style.display = (filter === "all" || c.getAttribute("data-category").includes(filter)) ? "flex" : "none";
                });
            });
        });
    }

    attachAdGateListeners();
    document.querySelectorAll(".open-reviews-btn").forEach(btn => {
        btn.addEventListener("click", () => openReviewsModal(parseInt(btn.getAttribute("data-id")), btn.getAttribute("data-name")));
    });
}

// 2. PARTNERS YÜKLƏMƏ & PAYLAŞMA
async function loadPartners() {
    const grid = document.getElementById("partnersGrid");
    if (!grid) return;

    const { data: partners } = await supabase
        .from("partners")
        .select("id, author_name, category, title, description, image_url, discord_link")
        .eq("status", "approved")
        .order("id", { ascending: false });

    if (!partners || partners.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; color:#64748b; padding:30px;">No partner ads yet. Post the first one above!</p>`;
        return;
    }

    grid.innerHTML = partners.map(p => `
        <div class="tutor-card">
            <div class="partner-img-wrap">
                <img src="${p.image_url}" alt="${p.title}" onerror="this.src='logo.png'">
            </div>
            <div class="tutor-tags" style="margin-bottom:10px;">
                <span style="color:#10b981; border-color:#10b981;">${p.category}</span>
                <span>By ${p.author_name}</span>
            </div>
            <h3 style="font-size:17px; color:#0f172a; margin-bottom:8px;">${p.title}</h3>
            <p class="tutor-bio">${p.description}</p>
            <div class="tutor-footer">
                <button class="unlock-tutor-btn ad-gate-btn" data-target="${p.discord_link}" data-type="Partner Contact">
                    <i class="fab fa-discord"></i> Connect with Partner (Watch AD)
                </button>
            </div>
        </div>`).join("");

    attachAdGateListeners();
}

function attachAdGateListeners() {
    document.querySelectorAll(".ad-gate-btn").forEach(btn => {
        if (btn.dataset.bound === "true") return;
        btn.dataset.bound = "true";

        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute("data-target");
            const targetType = this.getAttribute("data-type") || "Room";

            if (this.dataset.unlocked === "true") {
                window.open(targetUrl, "_blank");
                return;
            }

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
                    this.dataset.unlocked = "true";
                    this.innerHTML = `<i class="fas fa-check-circle"></i> Ready! Tap to Open`;
                    this.style.background = "#10b981";
                    this.style.pointerEvents = "auto";

                    if (this.getAttribute("data-name")) {
                        const saved = JSON.parse(localStorage.getItem("sultan_unlocked_tutors") || "[]");
                        const name = this.getAttribute("data-name");
                        if (!saved.some(x => x.name === name)) {
                            saved.push({ name, language: this.getAttribute("data-lang"), subject: this.getAttribute("data-subj"), link: targetUrl });
                            localStorage.setItem("sultan_unlocked_tutors", JSON.stringify(saved));
                        }
                    }
                    window.open(targetUrl, "_blank");
                }
            }, 1000);
        });
    });
}

// PARTNER MODAL
const partnerModal = document.getElementById("partnerModal");
const openPartnerModalBtn = document.getElementById("openPartnerModalBtn");
const closePartnerModal = document.getElementById("closePartnerModal");

if (openPartnerModalBtn) {
    openPartnerModalBtn.addEventListener("click", () => {
        partnerModal.classList.remove("hidden");
        document.body.classList.add("modal-open");
    });
}
if (closePartnerModal) {
    closePartnerModal.addEventListener("click", () => {
        partnerModal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    });
}

const partnerForm = document.getElementById("partnerForm");
if (partnerForm) {
    partnerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("partSubmitBtn");
        btn.disabled = true;

        const { error } = await supabase.from("partners").insert([{
            author_name: document.getElementById("partAuthor").value.trim(),
            email: document.getElementById("partEmail").value.trim(),
            category: document.getElementById("partCategory").value,
            title: document.getElementById("partTitle").value.trim(),
            image_url: document.getElementById("partImg").value.trim(),
            description: document.getElementById("partDesc").value.trim(),
            discord_link: document.getElementById("partDiscord").value.trim(),
            status: "pending"
        }]);

        if (!error) {
            alert("🎉 Partner AD submitted! It will appear shortly.");
            partnerForm.reset();
            partnerModal.classList.add("hidden");
            document.body.classList.remove("modal-open");
        } else {
            alert("Error submitting partner AD.");
        }
        btn.disabled = false;
    });
}

// REVIEWS MODAL
const reviewsModal = document.getElementById("reviewsModal");
const closeReviewsModal = document.getElementById("closeReviewsModal");
if (closeReviewsModal) closeReviewsModal.addEventListener("click", () => reviewsModal.classList.add("hidden"));

function openReviewsModal(tutorId, tutorName) {
    document.getElementById("reviewsModalTitle").innerText = `Reviews for ${tutorName}`;
    document.getElementById("revTutorId").value = tutorId;
    const list = document.getElementById("reviewsList");
    const tutorRevs = allReviews.filter(r => r.tutor_id === tutorId);

    list.innerHTML = tutorRevs.length === 0
        ? `<p style="color:#94a3b8; font-size:13px;">No reviews yet. Be the first!</p>`
        : tutorRevs.map(r => `
            <div class="review-item">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <strong style="color:#f8fafc; font-size:13px;">${r.student_name}</strong>
                    <span style="font-size:12px;">${"⭐".repeat(r.rating)}</span>
                </div>
                <p style="color:#cbd5e1; font-size:12px;">${r.comment}</p>
            </div>`).join("");
    reviewsModal.classList.remove("hidden");
}

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const { error } = await supabase.from("reviews").insert([{
            tutor_id: parseInt(document.getElementById("revTutorId").value),
            student_name: document.getElementById("revStudentName").value.trim(),
            rating: parseInt(document.getElementById("revRating").value),
            comment: document.getElementById("revComment").value.trim()
        }]);
        if (!error) {
            alert("⭐ Thank you for your review!");
            reviewForm.reset();
            reviewsModal.classList.add("hidden");
            loadEducators();
        } else {
            alert("Could not post review.");
        }
    });
}

document.addEventListener("DOMContentLoaded", loadEducators);
