import { supabase, escapeHTML, cleanHandle } from './config.js';

function injectWizardModal() {
    if (document.getElementById("startWizardModal")) return;

    const modal = document.createElement("div");
    modal.id = "startWizardModal";
    modal.className = "auth-modal-overlay hidden";
    modal.innerHTML = `
        <div class="wizard-card">
            <button class="auth-close-btn" id="closeWizardBtn" type="button">&times;</button>

            <!-- STEP 1: SECURE USERNAME + PASSWORD (GOOGLE AUTO-SAVE READY) -->
            <div id="wizStep1">
                <span class="wizard-step-badge">STEP 1 OF 3 • ACCOUNT & QUICK START</span>
                <h3 style="font-size:22px; margin-bottom:6px;">Welcome to Sultan Academy</h3>
                <p style="font-size:13px; color:#94a3b8; margin-bottom:16px;">Sign in or create a new account. Your browser can save your password automatically.</p>
                
                <form id="wizAuthForm" autocomplete="on" style="display:flex; flex-direction:column; gap:10px;">
                    <input type="text" id="wizUsernameInput" name="username" autocomplete="username" maxlength="20" required placeholder="Username (e.g. sultan99)" style="padding:12px 15px; border-radius:12px; border:1px solid #334155; background:#1e293b; color:white;">
                    <input type="password" id="wizPasswordInput" name="password" autocomplete="current-password" minlength="4" maxlength="32" required placeholder="Password / PIN (min 4 chars)" style="padding:12px 15px; border-radius:12px; border:1px solid #334155; background:#1e293b; color:white;">
                    <button type="submit" id="wizStep1NextBtn" class="submit-profile-btn" style="margin:0;">Sign In / Create & Continue <i class="fas fa-arrow-right"></i></button>
                </form>
                <button type="button" id="wizSkipToGoalsBtn" style="background:transparent; border:none; color:#94a3b8; font-size:12px; cursor:pointer; margin-top:10px; width:100%;">Skip & browse as guest →</button>
            </div>

            <!-- STEP 2: MULTIPLE CHOICE INTENT SELECTION -->
            <div id="wizStep2" class="hidden">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                    <span class="wizard-step-badge" style="margin:0;">STEP 2 OF 3 • MULTIPLE CHOICE</span>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <button type="button" id="wizChangeUserBtn" style="background:transparent; border:none; color:#94a3b8; font-size:11px; cursor:pointer;"><i class="fas fa-user-edit"></i> Switch User</button>
                        <a href="dashboard.html" style="font-size:12px; color:#10b981; font-weight:600;"><i class="fas fa-sliders-h"></i> Workspace</a>
                    </div>
                </div>
                <h3 style="font-size:19px; margin-bottom:4px;">Hi <span id="wizUserDisplay" style="color:#38bdf8;">Explorer</span>, select everything you want today:</h3>
                
                <div class="wizard-options-grid">
                    <button type="button" class="wizard-opt-btn" data-goal="Languages">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-globe-europe"></i>
                        <strong>Learn Languages</strong>
                        <span>German, English, Turkish & more</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Tech & Coding">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-code"></i>
                        <strong>Tech & Coding</strong>
                        <span>Web Dev, AI & Software</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Music & Arts">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-music"></i>
                        <strong>Music (TARAZ & MUSICO)</strong>
                        <span>Instruments, Vocals & Karaoke</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Coaching & Skills">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-rocket" style="color:#f59e0b;"></i>
                        <strong>Coaching & Prep</strong>
                        <span>Productivity & Exams</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Partners">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-handshake" style="color:#10b981;"></i>
                        <strong>Find a Partner</strong>
                        <span>Study buddy or co-founder</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Teach">
                        <span class="opt-check"><i class="fas fa-check"></i></span>
                        <i class="fas fa-chalkboard-teacher" style="color:#818cf8;"></i>
                        <strong>Teach / Earn</strong>
                        <span>Share skills as an Educator</span>
                    </button>
                </div>

                <div class="wizard-yellow-note">
                    <i class="fas fa-lightbulb"></i>
                    <span>You can join as a Learner, an Educator, or <b>both</b> — and seamlessly switch inside your Workspace!</span>
                </div>

                <button type="button" id="wizShowMatchesBtn" class="submit-profile-btn" style="width:100%; margin-top:14px;">
                    Show My Matches <i class="fas fa-arrow-right"></i>
                </button>
            </div>

            <!-- STEP 3 -->
            <div id="wizStep3" class="hidden">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="wizard-step-badge" style="margin:0;">STEP 3 OF 3 • YOUR MATCHES</span>
                    <button type="button" id="wizBackBtn" style="background:transparent; border:none; color:#94a3b8; font-size:12px; cursor:pointer;">← Change Choices</button>
                </div>
                <h3 style="font-size:19px;">Personalized Picks for You</h3>
                <div id="wizResultsList" class="wizard-results-list"></div>
                <div id="wizResultFooter" style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;"></div>
            </div>

            <div id="wizCookieBox" class="hidden" style="margin-top:18px; padding-top:14px; border-top:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <span style="font-size:11px; color:#94a3b8;">
                        <i class="fas fa-cookie-bite" style="color:#f59e0b;"></i> Allow analytics cookies? (<a href="privacy.html" style="color:#38bdf8; text-decoration:underline !important;">Privacy</a>)
                    </span>
                    <div style="display:flex; gap:8px;">
                        <button type="button" id="wizCookieDecline" style="background:transparent; border:1px solid #475569; color:#94a3b8; padding:4px 10px; border-radius:8px; font-size:11px; cursor:pointer;">Decline</button>
                        <button type="button" id="wizCookieAccept" style="background:#10b981; border:none; color:#fff; padding:4px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer;">Accept</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const step1 = document.getElementById("wizStep1");
    const step2 = document.getElementById("wizStep2");
    const step3 = document.getElementById("wizStep3");
    const wizCookieBox = document.getElementById("wizCookieBox");
    let selectedGoals = new Set();

    function refreshCookieBox() {
        wizCookieBox.classList.toggle("hidden", localStorage.getItem("sultan_cookie_consent") !== null);
    }

    function openWizard(forceStep2 = false) {
        modal.classList.remove("hidden");
        document.body.classList.add("modal-open");
        refreshCookieBox();

        const savedUser = localStorage.getItem("sultan_user");
        const savedToken = localStorage.getItem("sultan_token");

        if ((savedUser && savedToken) || forceStep2) {
            document.getElementById("wizUserDisplay").innerText = savedUser || "Explorer";
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
            step3.classList.add("hidden");
        } else {
            if (savedUser) document.getElementById("wizUsernameInput").value = savedUser;
            step1.classList.remove("hidden");
            step2.classList.add("hidden");
            step3.classList.add("hidden");
        }
    }

    function closeWizard() {
        modal.classList.add("hidden");
        document.body.classList.remove("modal-open");
        localStorage.setItem("sultan_wizard_seen", "true");
        if (localStorage.getItem("sultan_cookie_consent") === null && window.showBottomCookieBanner) {
            window.showBottomCookieBanner();
        }
    }

    const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    if (isHome && !localStorage.getItem("sultan_wizard_seen")) {
        setTimeout(() => openWizard(false), 600);
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest("#navStartBtn") || e.target.closest("#heroStartBtn")) {
            e.preventDefault();
            openWizard(false);
        }
        if (e.target.closest("#exploreNewSkillBtn")) {
            e.preventDefault();
            openWizard(true);
        }
        if (e.target === modal) closeWizard();
    });

    document.getElementById("closeWizardBtn").addEventListener("click", closeWizard);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeWizard(); });

    document.getElementById("wizCookieAccept").addEventListener("click", () => { if (window.setCookieChoice) window.setCookieChoice(true); refreshCookieBox(); });
    document.getElementById("wizCookieDecline").addEventListener("click", () => { if (window.setCookieChoice) window.setCookieChoice(false); refreshCookieBox(); });

    document.getElementById("wizAuthForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = cleanHandle(document.getElementById("wizUsernameInput").value);
        const password = document.getElementById("wizPasswordInput").value;
        const btn = document.getElementById("wizStep1NextBtn");
        if (!username || password.length < 4) return alert("Enter valid username and password (min 4 chars).");

        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Verifying...`;

        const { data, error } = await supabase.rpc("auth_user", { p_username: username, p_password: password });
        btn.disabled = false;
        btn.innerHTML = `Sign In / Create & Continue <i class="fas fa-arrow-right"></i>`;

        if (error || !data || !data.ok) {
            return alert(data?.error || "Login error. Try again.");
        }

        localStorage.setItem("sultan_user", data.username);
        localStorage.setItem("sultan_token", data.token);
        const navTxt = document.getElementById("navStartText");
        if (navTxt) navTxt.innerText = `Account • ${data.username}`;
        document.getElementById("wizUserDisplay").innerText = data.username;
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    document.getElementById("wizSkipToGoalsBtn").addEventListener("click", () => {
        document.getElementById("wizUserDisplay").innerText = "Explorer";
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    document.getElementById("wizChangeUserBtn").addEventListener("click", () => {
        localStorage.removeItem("sultan_user");
        localStorage.removeItem("sultan_token");
        const navTxt = document.getElementById("navStartText");
        if (navTxt) navTxt.innerText = "Sign In / Quick Start";
        step2.classList.add("hidden");
        step1.classList.remove("hidden");
    });

    document.getElementById("wizBackBtn").addEventListener("click", () => {
        step3.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    document.querySelectorAll(".wizard-opt-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const goal = btn.getAttribute("data-goal");
            if (selectedGoals.has(goal)) { selectedGoals.delete(goal); btn.classList.remove("selected"); }
            else { selectedGoals.add(goal); btn.classList.add("selected"); }
        });
    });

    document.getElementById("wizShowMatchesBtn").addEventListener("click", async () => {
        if (selectedGoals.size === 0) return alert("Please select at least one option!");

        localStorage.setItem("sultan_wizard_seen", "true");
        const goalsArr = Array.from(selectedGoals);
        const wantsTeach = goalsArr.includes("Teach");
        const wantsPartners = goalsArr.includes("Partners");
        const eduCategories = goalsArr.filter(g => g !== "Teach" && g !== "Partners");

        if (wantsTeach) {
            localStorage.setItem("sultan_dual_unlocked", "true");
            localStorage.setItem("sultan_role", "educator");
        } else {
            localStorage.setItem("sultan_role", "student");
        }

        if (wantsTeach && eduCategories.length === 0 && !wantsPartners) {
            window.location.href = "dashboard.html?mode=educator";
            return;
        }

        step2.classList.add("hidden");
        step3.classList.remove("hidden");
        const list = document.getElementById("wizResultsList");
        const footer = document.getElementById("wizResultFooter");
        list.innerHTML = `<p style="color:#94a3b8; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading your personalized matches...</p>`;

        let html = "";

        if (eduCategories.length > 0) {
            const { data: tutors } = await supabase.from("tutors").select("id, name, category, subject, price").eq("status", "approved").in("category", eduCategories).limit(4);
            if (tutors && tutors.length > 0) {
                html += tutors.map(t => `
                    <div class="wizard-result-item">
                        <div><strong style="font-size:13px;">🎓 ${escapeHTML(t.name)}</strong><span style="display:block; font-size:11px; color:#94a3b8;">${escapeHTML(t.category)} • ${escapeHTML(t.subject)} (${escapeHTML(t.price)})</span></div>
                        <a href="tutors.html?educator=${t.id}" style="background:#38bdf8; color:#0f172a; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700;">Connect</a>
                    </div>`).join("");
            } else {
                html += `<div class="wizard-result-item"><div><strong style="font-size:13px;">Educators in ${escapeHTML(eduCategories.join(", "))}</strong><span style="display:block; font-size:11px; color:#94a3b8;">Check our growing directory & live Discord rooms!</span></div><a href="tutors.html" style="background:#38bdf8; color:#0f172a; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700;">Browse</a></div>`;
            }
        }

        if (selectedGoals.has("Music & Arts")) {
            html += `
                <div class="wizard-result-item" style="border-color: rgba(245,158,11,0.4);">
                    <div><strong style="font-size:13px; color:#f59e0b;">🎵 TARAZ & MUSICO</strong><span style="display:block; font-size:11px; color:#94a3b8;">Concerts, National & Global Instruments, Karaoke</span></div>
                    <div style="display:flex; gap:6px;">
                        <a href="taraz.html" style="background:#f59e0b; color:#0f172a; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700;">TARAZ</a>
                        <a href="musico.html" style="background:#38bdf8; color:#0f172a; padding:5px 10px; border-radius:8px; font-size:11px; font-weight:700;">MUSICO</a>
                    </div>
                </div>`;
        }

        if (wantsPartners) {
            const { data: partners } = await supabase.from("partners").select("id, author_name, title, category").eq("status", "approved").limit(3);
            if (partners && partners.length > 0) {
                html += partners.map(p => `
                    <div class="wizard-result-item">
                        <div><strong style="font-size:13px;">🤝 ${escapeHTML(p.title)}</strong><span style="display:block; font-size:11px; color:#94a3b8;">By ${escapeHTML(p.author_name)} • ${escapeHTML(p.category)}</span></div>
                        <a href="tutors.html?tab=partners" style="background:#10b981; color:white; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600;">View</a>
                    </div>`).join("");
            } else {
                html += `<div class="wizard-result-item"><div><strong style="font-size:13px;">🤝 Project & Study Partners</strong><span style="display:block; font-size:11px; color:#94a3b8;">Post or find a collaborator on our board!</span></div><a href="tutors.html?tab=partners" style="background:#10b981; color:white; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600;">Open</a></div>`;
            }
        }

        list.innerHTML = html;
        footer.innerHTML = `
            <a href="dashboard.html" class="dash-action-btn" style="flex:1;">Open My Workspace</a>
            ${wantsTeach ? `<a href="dashboard.html?mode=educator" class="dash-action-btn secondary" style="flex:1;">Setup Educator Card</a>` : `<a href="shop.html" class="dash-action-btn secondary" style="flex:1;">Library & Shop</a>`}
        `;
    });
}

document.addEventListener("DOMContentLoaded", injectWizardModal);
