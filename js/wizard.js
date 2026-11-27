import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
    'https://ezccynahgubalainoqkf.supabase.co',
    'sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX'
);

function injectWizardModal() {
    if (document.getElementById("startWizardModal")) return;

    const modal = document.createElement("div");
    modal.id = "startWizardModal";
    modal.className = "auth-modal-overlay hidden";
    modal.innerHTML = `
        <div class="wizard-card">
            <button class="auth-close-btn" id="closeWizardBtn" type="button">&times;</button>

            <!-- STEP 1: CONNECT USERNAME -->
            <div id="wizStep1">
                <span class="wizard-step-badge">STEP 1 OF 3 • QUICK CONNECT</span>
                <h3 style="font-size:22px; margin-bottom:6px;">Start Your Journey</h3>
                <p style="font-size:13px; color:#94a3b8; margin-bottom:18px;">Enter a username to save your SP points & match with what you need right now.</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <input type="text" id="wizUsernameInput" maxlength="20" placeholder="Choose username (max 20 chars)..." style="padding:12px 15px; border-radius:12px; border:1px solid #334155; background:#1e293b; color:white;">
                    <button type="button" id="wizStep1NextBtn" class="submit-profile-btn" style="margin:0;">Continue <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>

            <!-- STEP 2: INTENT SELECTION -->
            <div id="wizStep2" class="hidden">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="wizard-step-badge" style="margin:0;">STEP 2 OF 3 • YOUR GOAL</span>
                    <a href="dashboard.html" style="font-size:12px; color:#10b981; font-weight:600;"><i class="fas fa-sliders-h"></i> Full Workspace</a>
                </div>
                <h3 style="font-size:20px; margin-bottom:4px;">Hi <span id="wizUserDisplay" style="color:#38bdf8;"></span>, what are you looking for?</h3>
                <div class="wizard-options-grid">
                    <button type="button" class="wizard-opt-btn" data-goal="Languages">
                        <i class="fas fa-globe-europe"></i>
                        <strong>Learn Languages</strong>
                        <span>German, English, Turkish & more</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Tech & Coding">
                        <i class="fas fa-code"></i>
                        <strong>Tech & Coding</strong>
                        <span>Web Dev, AI & Software skills</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Music & Arts">
                        <i class="fas fa-music"></i>
                        <strong>Music & Arts</strong>
                        <span>Instruments & creative skills</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Partners">
                        <i class="fas fa-handshake" style="color:#10b981;"></i>
                        <strong>Find a Partner</strong>
                        <span>Study buddy or project co-founder</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Shop">
                        <i class="fas fa-book" style="color:#f59e0b;"></i>
                        <strong>Books & Classrooms</strong>
                        <span>Study guides & free SP rewards</span>
                    </button>
                    <button type="button" class="wizard-opt-btn" data-goal="Teach">
                        <i class="fas fa-chalkboard-teacher" style="color:#818cf8;"></i>
                        <strong>Teach / Host Club</strong>
                        <span>Share skills & earn directly</span>
                    </button>
                </div>
            </div>

            <!-- STEP 3: INSTANT MATCHES -->
            <div id="wizStep3" class="hidden">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="wizard-step-badge" style="margin:0;">STEP 3 OF 3 • INSTANT MATCH</span>
                    <button type="button" id="wizBackBtn" style="background:transparent; border:none; color:#94a3b8; font-size:12px; cursor:pointer;">← Change Goal</button>
                </div>
                <h3 id="wizResultTitle" style="font-size:19px;">Matches for You</h3>
                <div id="wizResultsList" class="wizard-results-list"></div>
                <div id="wizResultFooter" style="margin-top:16px; display:flex; gap:10px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const step1 = document.getElementById("wizStep1");
    const step2 = document.getElementById("wizStep2");
    const step3 = document.getElementById("wizStep3");

    function openWizard() {
        modal.classList.remove("hidden");
        document.body.classList.add("modal-open");
        const savedUser = localStorage.getItem("sultan_user");
        if (savedUser) {
            document.getElementById("wizUserDisplay").innerText = savedUser;
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
            step3.classList.add("hidden");
        } else {
            step1.classList.remove("hidden");
            step2.classList.add("hidden");
            step3.classList.add("hidden");
        }
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest("#navStartBtn") || e.target.closest("#heroStartBtn")) {
            e.preventDefault();
            openWizard();
        }
    });

    document.getElementById("closeWizardBtn").addEventListener("click", () => {
        modal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    });

    document.getElementById("wizStep1NextBtn").addEventListener("click", async () => {
        const username = document.getElementById("wizUsernameInput").value.trim().toLowerCase();
        if (!username) return alert("Please enter a username!");

        const { data } = await supabase.from("users").select("id").eq("username", username).single();
        if (!data) await supabase.from("users").insert([{ username, role: "learner", sp: 0 }]);

        localStorage.setItem("sultan_user", username);
        const navTxt = document.getElementById("navStartText");
        if (navTxt) navTxt.innerText = username;
        document.getElementById("wizUserDisplay").innerText = username;

        step1.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    document.getElementById("wizBackBtn").addEventListener("click", () => {
        step3.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    document.querySelectorAll(".wizard-opt-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const goal = btn.getAttribute("data-goal");
            if (goal === "Teach") {
                window.location.href = "dashboard.html?mode=educator";
                return;
            }
            if (goal === "Shop") {
                window.location.href = "shop.html";
                return;
            }

            step2.classList.add("hidden");
            step3.classList.remove("hidden");
            const list = document.getElementById("wizResultsList");
            const footer = document.getElementById("wizResultFooter");
            list.innerHTML = `<p style="color:#94a3b8; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Finding best matches...</p>`;

            if (goal === "Partners") {
                document.getElementById("wizResultTitle").innerText = "Active Project & Study Partners";
                const { data } = await supabase.from("partners").select("id, author_name, title, category").eq("status", "approved").limit(4);
                list.innerHTML = (data && data.length > 0)
                    ? data.map(p => `
                        <div class="wizard-result-item">
                            <div>
                                <strong style="font-size:14px;">${p.title}</strong>
                                <span style="display:block; font-size:11px; color:#94a3b8;">By ${p.author_name} • ${p.category}</span>
                            </div>
                            <a href="tutors.html?tab=partners" style="background:#10b981; color:white; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600;">View</a>
                        </div>`).join("")
                    : `<p style="color:#94a3b8; font-size:13px;">No partner ads yet. Be the first to post one!</p>`;
                footer.innerHTML = `<a href="tutors.html?tab=partners" class="dash-action-btn" style="flex:1;">Browse / Post Partner AD</a>`;
            } else {
                document.getElementById("wizResultTitle").innerText = `Top ${goal} Educators`;
                const { data } = await supabase.from("tutors").select("id, name, subject, price").eq("status", "approved").eq("category", goal).limit(4);
                list.innerHTML = (data && data.length > 0)
                    ? data.map(t => `
                        <div class="wizard-result-item">
                            <div>
                                <strong style="font-size:14px;">${t.name}</strong>
                                <span style="display:block; font-size:11px; color:#94a3b8;">${t.subject} • ${t.price}</span>
                            </div>
                            <a href="tutors.html?cat=${encodeURIComponent(goal)}" style="background:#38bdf8; color:#0f172a; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700;">Connect</a>
                        </div>`).join("")
                    : `<p style="color:#94a3b8; font-size:13px;">Educators in ${goal} are joining soon. Check all educators!</p>`;
                footer.innerHTML = `<a href="tutors.html" class="dash-action-btn" style="flex:1;">Open All Educators</a>`;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", injectWizardModal);
