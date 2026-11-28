import { SULTAN_CONFIG, supabase, escapeHTML, safeUrl, cleanHandle } from './config.js';

let allTutors = [];
let allReviews = [];
let currentCategoryFilter = "all";
let currentSearchQuery = "";
let currentQuickFilter = "all";

const tabDirEdu = document.getElementById("tabDirEducators");
const tabDirPart = document.getElementById("tabDirPartners");
const areaEdu = document.getElementById("dirEducatorsArea");
const areaPart = document.getElementById("dirPartnersArea");

function switchDirectoryTab(tab) {
    if (!tabDirEdu || !tabDirPart || !areaEdu || !areaPart) return;
    if (tab === "partners") {
        tabDirPart.classList.add("active"); tabDirEdu.classList.remove("active");
        areaPart.classList.remove("hidden"); areaEdu.classList.add("hidden");
        loadPartners();
    } else {
        tabDirEdu.classList.add("active"); tabDirPart.classList.remove("active");
        areaEdu.classList.remove("hidden"); areaPart.classList.add("hidden");
    }
}

if (tabDirEdu && tabDirPart) {
    tabDirEdu.addEventListener("click", () => switchDirectoryTab("educators"));
    tabDirPart.addEventListener("click", () => switchDirectoryTab("partners"));
    if (new URLSearchParams(window.location.search).get("tab") === "partners") switchDirectoryTab("partners");
}

// Dil & Bacarıq Bayrağı Avto-Detektoru
function getFlagIcon(lang = "", cat = "") {
    const s = `${lang} ${cat}`.toLowerCase();
    if (s.includes("german") || s.includes("deutsch") || s.includes("telc") || s.includes("goethe")) return "🇩🇪";
    if (s.includes("english") || s.includes("ielts") || s.includes("toefl")) return "🇬🇧";
    if (s.includes("azerbaijan") || s.includes("azər")) return "🇦🇿";
    if (s.includes("turkish") || s.includes("türk")) return "🇹🇷";
    if (s.includes("russian") || s.includes("rus")) return "🇷🇺";
    if (s.includes("spanish")) return "🇪🇸";
    if (s.includes("french")) return "🇫🇷";
    if (s.includes("italian")) return "🇮🇹";
    if (s.includes("arabic")) return "🇸🇦";
    if (s.includes("chinese") || s.includes("mandarin")) return "🇨🇳";
    if (s.includes("japanese")) return "🇯🇵";
    if (s.includes("korean")) return "🇰🇷";
    if (s.includes("tech") || s.includes("cod") || s.includes("python") || s.includes("web")) return "💻";
    if (s.includes("music") || s.includes("guitar") || s.includes("piano") || s.includes("tar") || s.includes("vocal")) return "🎵";
    return "🎓";
}

function injectSearchAndQuickFilters() {
    const dynamicFilters = document.getElementById("dynamicFilters");
    if (!dynamicFilters || document.getElementById("tutorSearchWrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "tutorSearchWrap";
    wrap.style.cssText = "max-width:750px; margin:0 auto 20px auto; display:flex; flex-direction:column; gap:12px;";
    wrap.innerHTML = `
        <div style="position:relative;">
            <i class="fas fa-search" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
            <input type="text" id="tutorSearchInput" placeholder="Search language, skill, name or subject (e.g. German, Python, Guitar)..."
                style="width:100%; padding:12px 16px 12px 42px; border-radius:25px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:13px; outline:none;">
        </div>
        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;" id="quickFilterPills">
            <button type="button" class="btn-secondary-sm quick-chip active" data-q="all" style="border-color:#38bdf8; color:#38bdf8;">All Prices</button>
            <button type="button" class="btn-secondary-sm quick-chip" data-q="trial">🎁 Free Trial</button>
            <button type="button" class="btn-secondary-sm quick-chip" data-q="free">💚 Free / Barter</button>
            <button type="button" class="btn-secondary-sm quick-chip" data-q="live">🔴 Live Discord</button>
            <button type="button" class="btn-secondary-sm quick-chip" data-q="swap">🔄 Skill Swap</button>
        </div>
    `;
    dynamicFilters.parentNode.insertBefore(wrap, dynamicFilters);

    document.getElementById("tutorSearchInput").addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderEducators();
    });

    wrap.querySelectorAll(".quick-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            wrap.querySelectorAll(".quick-chip").forEach(b => {
                b.classList.remove("active");
                b.style.borderColor = "#475569";
                b.style.color = "#f8fafc";
            });
            btn.classList.add("active");
            btn.style.borderColor = "#38bdf8";
            btn.style.color = "#38bdf8";
            currentQuickFilter = btn.dataset.q;
            renderEducators();
        });
    });
}

async function loadEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    const dynamicFilters = document.getElementById("dynamicFilters");
    if (!tutorsGrid) return;

    injectSearchAndQuickFilters();

    const [{ data: tutors, error }, { data: reviews }] = await Promise.all([
        supabase.from("tutors").select("id, name, owner_username, avatar_url, category, language, subject, price, discord_channel, offers_live_sessions, offers_free_trial, cal_link, skill_swap_wanted, status").eq("status", "approved").order("id", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false })
    ]);

    allTutors = tutors || [];
    allReviews = reviews || [];

    if (error || allTutors.length === 0) {
        tutorsGrid.innerHTML = `<p style="grid-column:1/-1; color:#64748b; padding:30px;">No active educators right now.</p>`;
        return;
    }

    const filterCategories = new Set();
    allTutors.forEach(t => filterCategories.add((t.category || "Languages").trim()));

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
                currentCategoryFilter = btn.getAttribute("data-filter");
                renderEducators();
            });
        });

        const urlCat = new URLSearchParams(window.location.search).get("cat");
        if (urlCat) {
            const m = [...dynamicFilters.querySelectorAll(".filter-btn")].find(b => b.dataset.filter === urlCat.toLowerCase());
            if (m) m.click();
        }
    }

    renderEducators();

    const highlightId = new URLSearchParams(window.location.search).get("educator");
    if (highlightId) {
        const targetCard = document.getElementById(`tutor-card-${highlightId}`);
        if (targetCard) {
            targetCard.style.border = "2px solid #38bdf8";
            targetCard.style.boxShadow = "0 0 30px rgba(56, 189, 248, 0.35)";
            setTimeout(() => targetCard.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
        }
    }
}

function renderEducators() {
    const tutorsGrid = document.getElementById("tutorsGrid");
    if (!tutorsGrid) return;

    const unlockedList = JSON.parse(localStorage.getItem("sultan_unlocked_tutors") || "[]");

    const filtered = allTutors.filter(t => {
        const mainCat = (t.category || "Languages").toLowerCase();
        const lang = (t.language || "").toLowerCase();
        const searchable = `${t.name} ${mainCat} ${lang} ${t.subject} ${t.price} ${t.skill_swap_wanted || ""}`.toLowerCase();

        if (currentCategoryFilter !== "all" && !mainCat.includes(currentCategoryFilter) && !lang.includes(currentCategoryFilter)) return false;
        if (currentSearchQuery && !searchable.includes(currentSearchQuery)) return false;

        if (currentQuickFilter === "trial" && !t.offers_free_trial) return false;
        if (currentQuickFilter === "free" && !(t.price || "").toLowerCase().includes("free") && !(t.price || "").includes("0")) return false;
        if (currentQuickFilter === "live" && !t.offers_live_sessions) return false;
        if (currentQuickFilter === "swap" && !(t.skill_swap_wanted && t.skill_swap_wanted.trim())) return false;

        return true;
    });

    if (filtered.length === 0) {
        tutorsGrid.innerHTML = `<p style="grid-column:1/-1; color:#94a3b8; padding:30px;">No educators match your search/filter.</p>`;
        return;
    }

    tutorsGrid.innerHTML = "";

    filtered.forEach(t => {
        const mainCat = (t.category || "Languages").trim();
        const flag = getFlagIcon(t.language, mainCat);
        const tutorRevs = allReviews.filter(r => r.tutor_id === t.id);

        let ratingText = `<strong>New</strong> <span class="rating-count">(No reviews yet)</span>`;
        if (tutorRevs.length > 0) {
            const avg = (tutorRevs.reduce((sum, r) => sum + r.rating, 0) / tutorRevs.length).toFixed(1);
            ratingText = `<span class="stars">${"⭐".repeat(Math.round(avg))}</span> <strong>${avg}</strong> <span class="rating-count">(${tutorRevs.length} reviews)</span>`;
        }

        // Kənar şəxslərin təxmin edə bilməyəcəyi otaq tokeni
        const roomToken = btoa(`${t.id}:${t.name}:SultanAcad`).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
        const jitsiUrl = `classroom.html?room=SultanAcad-${t.id}-${roomToken}`;
        const isUnlocked = unlockedList.some(x => x.id === t.id || x.name === t.name);
        const targetChatHandle = cleanHandle(t.owner_username || t.name);
        const safeDiscord = safeUrl(t.discord_channel, SULTAN_CONFIG.DISCORD_INVITE);
        const safeAvatar = safeUrl(t.avatar_url, "your-photo.jpg");
        const safeCal = t.cal_link ? safeUrl(t.cal_link, "") : "";

        const discordBtnHTML = isUnlocked
            ? `<a href="${safeDiscord}" target="_blank" rel="noopener" class="unlock-tutor-btn" style="background: #10b981;"><i class="fab fa-discord"></i> Open Discord Room ↗</a>`
            : `<button class="unlock-tutor-btn ad-gate-btn" data-tutor-id="${t.id}" data-target="${escapeHTML(safeDiscord)}" data-name="${escapeHTML(t.name)}" data-lang="${escapeHTML(t.language)}" data-subj="${escapeHTML(t.subject)}"><i class="fab fa-discord"></i> Unlock Discord (1-Time AD)</button>`;

        const card = document.createElement("div");
        card.className = "tutor-card";
        card.id = `tutor-card-${t.id}`;

        card.innerHTML = `
            <div class="tutor-header">
                <img src="${safeAvatar}" alt="${escapeHTML(t.name)}" class="tutor-avatar" onerror="this.src='your-photo.jpg'">
                <div class="tutor-main-info">
                    <h3>${escapeHTML(t.name)} <i class="fas fa-check-circle verified-badge"></i></h3>
                    <p class="tutor-title">${escapeHTML(t.subject)}</p>
                    <div class="tutor-rating">${ratingText}</div>
                </div>
            </div>
            <p class="tutor-bio">Category: <b>${escapeHTML(mainCat)}</b> • Teaching <b>${flag} ${escapeHTML(t.language)}</b></p>
            <div class="tutor-tags">
                <span>${escapeHTML(mainCat)}</span>
                <span>${flag} ${escapeHTML(t.language)}</span>
                ${t.offers_free_trial ? '<span style="color:#34d399; border-color:#34d399;">🎁 15m Free Trial</span>' : ''}
                ${t.offers_live_sessions ? '<span style="color:#10b981; border-color:#10b981;">🔴 Live Sessions</span>' : ''}
                ${t.skill_swap_wanted ? `<span style="color:#f59e0b; border-color:#f59e0b;">🔄 Swap: ${escapeHTML(t.skill_swap_wanted)}</span>` : ''}
            </div>
            <div class="tutor-footer">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="tutor-price">${escapeHTML(t.price)}</div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-reviews open-reviews-btn" data-id="${t.id}" data-name="${escapeHTML(t.name)}" type="button"><i class="fas fa-star"></i> Reviews (${tutorRevs.length})</button>
                        <button class="btn-secondary-sm share-tutor-btn" data-id="${t.id}" type="button" title="Copy Share Link"><i class="fas fa-share-alt"></i></button>
                    </div>
                </div>
                <div class="tutor-action-group">
                    <a href="chat.html?to=${encodeURIComponent(targetChatHandle)}&ctx=${encodeURIComponent('Book a Lesson')}" class="cal-booking-btn" style="background: #10b981; color: #fff !important;">
                        <i class="fas fa-comment-dots"></i> Send Message Request
                    </a>
                    ${discordBtnHTML}
                    <a href="${jitsiUrl}" target="_blank" rel="noopener" class="video-room-btn"><i class="fas fa-video"></i> Video Classroom ↗</a>
                    ${safeCal ? `<a href="${safeCal}" target="_blank" rel="noopener" class="cal-booking-btn"><i class="fas fa-calendar-alt"></i> Book on Cal.com ↗</a>` : ''}
                </div>
            </div>`;
        tutorsGrid.appendChild(card);
    });

    tutorsGrid.querySelectorAll(".share-tutor-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(`${window.location.origin}/tutors.html?educator=${btn.dataset.id}`);
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => btn.innerHTML = '<i class="fas fa-share-alt"></i>', 2000);
        });
    });

    tutorsGrid.querySelectorAll(".open-reviews-btn").forEach(btn => {
        btn.addEventListener("click", () => openReviewsModal(parseInt(btn.getAttribute("data-id")), btn.getAttribute("data-name")));
    });

    attachOneTimeDiscordUnlocker();
}

async function loadPartners() {
    const grid = document.getElementById("partnersGrid");
    if (!grid) return;

    const { data: partners } = await supabase.from("partners").select("id, author_name, owner_username, category, title, description, image_url, discord_link").eq("status", "approved").order("id", { ascending: false });
    if (!partners || partners.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; color:#64748b; padding:30px;">No partner ads yet.</p>`;
        return;
    }

    grid.innerHTML = partners.map(p => {
        const targetHandle = cleanHandle(p.owner_username || p.author_name);
        return `
        <div class="tutor-card">
            <div class="partner-img-wrap"><img src="${safeUrl(p.image_url, 'logo.png')}" alt="${escapeHTML(p.title)}" onerror="this.src='logo.png'"></div>
            <div class="tutor-tags" style="margin-bottom:10px;"><span style="color:#10b981; border-color:#10b981;">${escapeHTML(p.category)}</span><span>By ${escapeHTML(p.author_name)}</span></div>
            <h3 style="font-size:17px; color:#ffffff; margin-bottom:8px;">${escapeHTML(p.title)}</h3>
            <p class="tutor-bio">${escapeHTML(p.description)}</p>
            <div class="tutor-footer">
                <div class="tutor-action-group">
                    <a href="chat.html?to=${encodeURIComponent(targetHandle)}&ctx=${encodeURIComponent('Project / Study Partner')}" class="cal-booking-btn" style="background: #10b981; color: #fff !important;"><i class="fas fa-comment-dots"></i> Send Message Request</a>
                    <a href="${safeUrl(p.discord_link, SULTAN_CONFIG.DISCORD_INVITE)}" target="_blank" rel="noopener" class="unlock-tutor-btn"><i class="fab fa-discord"></i> Open Discord Link ↗</a>
                </div>
            </div>
        </div>`;
    }).join("");
}

function attachOneTimeDiscordUnlocker() {
    document.querySelectorAll(".ad-gate-btn").forEach(btn => {
        if (btn.dataset.bound === "true") return;
        btn.dataset.bound = "true";

        btn.addEventListener("click", function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute("data-target");
            const tutorId = parseInt(this.getAttribute("data-tutor-id"));

            if (this.dataset.unlocked === "true") { window.open(targetUrl, "_blank"); return; }

            const adWindow = window.open(SULTAN_CONFIG.ADSTERRA_TUTOR_URL, "_blank");
            if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
                return alert("⚠️ Pop-up Blocked! Please allow pop-ups to unlock this Discord classroom once.");
            }

            const parentBox = this.parentElement;
            const oldProg = parentBox.querySelector(".ad-progress-wrap");
            if (oldProg) oldProg.remove();

            const progWrap = document.createElement("div");
            progWrap.className = "ad-progress-wrap";
            progWrap.style.cssText = "width:100%; margin-top:4px; text-align:left;";
            progWrap.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#38bdf8; font-weight:600; margin-bottom:4px;">
                    <span class="ad-prog-label"><i class="fab fa-discord"></i> Preparing classroom...</span>
                    <span class="ad-pct">0%</span>
                </div>
                <div style="width:100%; height:7px; background:#0f172a; border-radius:10px; overflow:hidden;">
                    <div class="ad-bar-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #5865F2, #10b981); transition:width 0.1s linear;"></div>
                </div>`;
            parentBox.insertBefore(progWrap, this.nextSibling);

            const barFill = progWrap.querySelector(".ad-bar-fill");
            const pctText = progWrap.querySelector(".ad-pct");
            const labelText = progWrap.querySelector(".ad-prog-label");
            const originalHTML = this.innerHTML;

            this.style.pointerEvents = "none";
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Sponsor...`;

            const DURATION = 4000;
            const startTime = Date.now();

            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (adWindow.closed && !document.hidden && elapsed < DURATION) {
                    clearInterval(timer);
                    barFill.style.background = "#ef4444";
                    labelText.style.color = "#ef4444";
                    labelText.innerHTML = `<i class="fas fa-times-circle"></i> Ad closed early! Keep open 4s.`;
                    this.innerHTML = originalHTML;
                    this.style.pointerEvents = "auto";
                    return;
                }
                const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
                barFill.style.width = `${pct}%`;
                pctText.innerText = `${pct}%`;

                if (elapsed >= DURATION) {
                    clearInterval(timer);
                    this.dataset.unlocked = "true";
                    this.innerHTML = `<i class="fas fa-check-circle"></i> Unlocked! Tap to Open ↗`;
                    this.style.background = "#10b981";
                    this.style.pointerEvents = "auto";
                    labelText.style.color = "#10b981";
                    labelText.innerHTML = `<i class="fas fa-check-circle"></i> Classroom ready!`;

                    if (tutorId) supabase.rpc("increment_tutor_unlock", { p_tutor_id: tutorId });
                    const saved = JSON.parse(localStorage.getItem("sultan_unlocked_tutors") || "[]");
                    const name = this.getAttribute("data-name");
                    if (!saved.some(x => x.id === tutorId || x.name === name)) {
                        saved.push({ id: tutorId, name, language: this.getAttribute("data-lang"), subject: this.getAttribute("data-subj"), link: targetUrl });
                        localStorage.setItem("sultan_unlocked_tutors", JSON.stringify(saved));
                    }
                    window.open(targetUrl, "_blank");
                }
            }, 100);
        });
    });
}

const partnerModal = document.getElementById("partnerModal");
const openPartnerModalBtn = document.getElementById("openPartnerModalBtn");
const closePartnerModal = document.getElementById("closePartnerModal");
if (openPartnerModalBtn) openPartnerModalBtn.addEventListener("click", () => { partnerModal.classList.remove("hidden"); document.body.classList.add("modal-open"); });
if (closePartnerModal) closePartnerModal.addEventListener("click", () => { partnerModal.classList.add("hidden"); document.body.classList.remove("modal-open"); });

const partnerForm = document.getElementById("partnerForm");
if (partnerForm) {
    partnerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("partSubmitBtn");
        btn.disabled = true;
        const authorName = document.getElementById("partAuthor").value.trim();
        const myHandle = cleanHandle(localStorage.getItem("sultan_user") || authorName);

        const { error } = await supabase.from("partners").insert([{
            author_name: authorName, owner_username: myHandle,
            email: document.getElementById("partEmail").value.trim(),
            category: document.getElementById("partCategory").value,
            title: document.getElementById("partTitle").value.trim(),
            image_url: document.getElementById("partImg").value.trim(),
            description: document.getElementById("partDesc").value.trim(),
            discord_link: document.getElementById("partDiscord").value.trim(),
            status: "pending"
        }]);
        if (!error) { alert("🎉 Partner AD submitted!"); partnerForm.reset(); partnerModal.classList.add("hidden"); document.body.classList.remove("modal-open"); }
        else alert("Error submitting.");
        btn.disabled = false;
    });
}

const reviewsModal = document.getElementById("reviewsModal");
const closeReviewsModal = document.getElementById("closeReviewsModal");
if (closeReviewsModal) closeReviewsModal.addEventListener("click", () => reviewsModal.classList.add("hidden"));

function openReviewsModal(tutorId, tutorName) {
    document.getElementById("reviewsModalTitle").innerText = `Reviews for ${tutorName}`;
    document.getElementById("revTutorId").value = tutorId;
    const revNameInput = document.getElementById("revStudentName");
    const savedUser = localStorage.getItem("sultan_user");
    if (revNameInput && savedUser) { revNameInput.value = savedUser; revNameInput.readOnly = true; }

    const list = document.getElementById("reviewsList");
    const tutorRevs = allReviews.filter(r => r.tutor_id === tutorId);
    list.innerHTML = tutorRevs.length === 0 ? `<p style="color:#94a3b8; font-size:13px;">No reviews yet.</p>` : tutorRevs.map(r => `
        <div class="review-item"><div style="display:flex; justify-content:space-between;"><strong>${escapeHTML(r.student_name)}</strong><span>${"⭐".repeat(r.rating)}</span></div><p style="font-size:12px; color:#cbd5e1;">${escapeHTML(r.comment)}</p></div>`).join("");
    reviewsModal.classList.remove("hidden");
}

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const me = localStorage.getItem("sultan_user");
        const token = localStorage.getItem("sultan_token");
        if (!me || !token) {
            alert("Please sign in first (open menu -> Sign In / Quick Start) to leave a verified review!");
            const startBtn = document.getElementById("navStartBtn");
            if (startBtn) startBtn.click();
            return;
        }
        const { data, error } = await supabase.rpc("submit_tutor_review", {
            p_username: me,
            p_token: token,
            p_tutor_id: parseInt(document.getElementById("revTutorId").value),
            p_rating: parseInt(document.getElementById("revRating").value),
            p_comment: document.getElementById("revComment").value.trim()
        });
        if (!error && data?.ok) {
            alert("⭐ Thank you! Your verified review has been saved.");
            reviewForm.reset();
            reviewsModal.classList.add("hidden");
            loadEducators();
        } else {
            alert(data?.error || "Could not post review.");
        }
    });
}

document.addEventListener("DOMContentLoaded", loadEducators);
