// --- SULTAN ACADEMY: DIVIDED SIDEBAR + TOP-RIGHT SHOP/START/SETTINGS ---
document.addEventListener("DOMContentLoaded", () => {
    // Bütün səhifələrdə Footer yazısını avtomatik Sultan Academy edirik
    document.querySelectorAll(".footer p").forEach(p => {
        p.innerHTML = p.innerHTML.replace("Sultan Alizada", "Sultan Academy");
    });

    const headerContainer = document.getElementById("main-header");
    if (!headerContainer) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const activeUser = localStorage.getItem("sultan_user");

    const menuItemsDB = {
        home: { label: "Home", href: "index.html", icon: "fas fa-home" },
        dashboard: { label: "Dashboard", href: "dashboard.html", icon: "fas fa-th-large" },
        become_educator: { label: "Become an Educator", href: "become-educator.html", icon: "fas fa-chalkboard-teacher" },
        find_educators: { label: "Find Educators", href: "tutors.html", icon: "fas fa-search" },
        chat: { label: "Messages & Tools", href: "chat.html", icon: "fas fa-comments" },
        live_clubs: { label: "Weekly Live Clubs & Workshops", href: "clubs.html", icon: "fas fa-broadcast-tower" },
        skill_swap: { label: "Skill Swap", href: "skill-swap.html", icon: "fas fa-exchange-alt" },
        lang_exchange: { label: "Language & Cultural Exchange", href: "exchange.html", icon: "fas fa-globe" },
        projects: {
            label: "Projects",
            type: "dropdown",
            icon: "fas fa-layer-group",
            children: [
                { label: "STUTOR", href: "stutor.html" },
                { label: "Global Professionals", href: "global.html" },
                { label: "Sultan Academy Kids", href: "kids.html" },
                { label: "Easy Azerbaijani", href: "easy-azerbaijani.html" },
                { label: "TARAZ (Music)", href: "taraz.html" },
                { label: "MUSICO (Global)", href: "musico.html" }
            ]
        },
        leaderboard: { label: "Leaderboard", href: "leaderboard.html", icon: "fas fa-trophy" },
        testimonials: { label: "Testimonials", href: "testimonials.html", icon: "fas fa-comment-alt" },
        contact: { label: "Contact & Feedback", href: "contact.html", icon: "fas fa-envelope" }
    };

const defaultLayout = {
        general: ["home", "dashboard", "chat", "become_educator", "find_educators", "skill_swap", "lang_exchange", "live_clubs"],
        others: ["leaderboard", "projects", "testimonials", "contact"]
    };

    const STORAGE_KEY = "sultan_sidebar_layout_v2";
    let savedLayout;
    try {
        savedLayout = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultLayout;
        if (!savedLayout.general || !savedLayout.others) savedLayout = defaultLayout;
        savedLayout.general = savedLayout.general.filter(id => menuItemsDB[id]);
        savedLayout.others = savedLayout.others.filter(id => menuItemsDB[id]);

        const existingIds = new Set([...savedLayout.general, ...savedLayout.others]);
        Object.keys(menuItemsDB).forEach(k => {
            if (!existingIds.has(k)) {
                if (defaultLayout.others.includes(k)) savedLayout.others.push(k);
                else savedLayout.general.push(k);
            }
        });
    } catch {
        savedLayout = defaultLayout;
    }

    function renderItemHTML(id) {
        const item = menuItemsDB[id];
        if (!item) return "";

        if (item.type === "dropdown") {
            const isChildActive = item.children.some(c => c.href === currentPage);
            const subHTML = item.children.map(c =>
                `<a href="${c.href}" class="sidebar-sublink ${currentPage === c.href ? 'active' : ''}">${c.label}</a>`
            ).join("");
            return `
                <li class="sidebar-item" draggable="true" data-id="${id}">
                    <div class="sidebar-row">
                        <button type="button" class="sidebar-link sidebar-projects-toggle ${isChildActive ? 'active' : ''}">
                            <i class="${item.icon}"></i>
                            <span>${item.label}</span>
                            <i class="fas fa-chevron-down drop-arrow ${isChildActive ? 'rotated' : ''}"></i>
                        </button>
                        <span class="drag-handle" title="Hold & drag to reorder"><i class="fas fa-grip-vertical"></i></span>
                    </div>
                    <div class="sidebar-submenu ${isChildActive ? '' : 'hidden'}">${subHTML}</div>
                </li>`;
        }

        const isActive = (item.href === currentPage) || (currentPage === "" && item.href === "index.html");

        return `
            <li class="sidebar-item" draggable="true" data-id="${id}">
                <div class="sidebar-row">
                    <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''}">
                        <i class="${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                    <span class="drag-handle" title="Hold & drag to reorder"><i class="fas fa-grip-vertical"></i></span>
                </div>
            </li>`;
    }

    headerContainer.innerHTML = `
        <button id="mobileSidebarToggle" class="mobile-sidebar-btn" type="button" aria-label="Open Menu">
            <i class="fas fa-bars"></i>
        </button>

        <div class="top-utility-bar">
            <a href="shop.html" class="top-shop-btn">
                <i class="fas fa-shopping-bag"></i> Shop
            </a>
            <button id="navStartBtn" class="top-start-btn" type="button">
                <i class="fas fa-bolt"></i> <span id="navStartText">${activeUser ? `Start • ${activeUser}` : 'Start'}</span>
            </button>
            <button id="openSettingsBtn" class="settings-gear-btn" type="button" title="Settings & Account">
                <i class="fas fa-cog"></i>
            </button>
        </div>

       <div id="sidebarBackdrop" class="sidebar-backdrop hidden"></div>
        <aside id="leftSidebar" class="left-sidebar">
            <div class="sidebar-brand">
                <a href="index.html">
                    <img src="logo.png" alt="Logo" style="width:28px; height:28px; border-radius:8px; object-fit:cover;">
                    <span>SULTAN ACADEMY</span>
                </a>
                <button id="closeMobileSidebar" class="mobile-close-sb" type="button">&times;</button>
            </div>

            <div class="sidebar-scroll">
                <div class="sidebar-group-title">GENERAL</div>
                <ul class="sidebar-list" id="sidebarGeneral" data-group="general">
                    ${savedLayout.general.map(renderItemHTML).join("")}
                </ul>

                <div class="sidebar-divider"></div>

                <div class="sidebar-group-title">OTHERS</div>
                <ul class="sidebar-list" id="sidebarOthers" data-group="others">
                    ${savedLayout.others.map(renderItemHTML).join("")}
                </ul>
            </div>
        </aside>

        <div id="settingsModal" class="auth-modal-overlay hidden">
            <div class="wizard-card" style="max-width:460px;">
                <button class="auth-close-btn" id="closeSettingsModal" type="button">&times;</button>
                <h3 style="margin-bottom:14px;"><i class="fas fa-cog" style="color:#38bdf8;"></i> Account & Settings</h3>
                
                <div style="background:#1e293b; padding:14px; border-radius:14px; border:1px solid #334155; margin-bottom:16px;">
                    <span style="font-size:11px; color:#94a3b8; display:block;">Current Identity</span>
                    <strong style="font-size:16px; color:#ffffff;">${activeUser ? activeUser : 'Guest (Not connected)'}</strong>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:12px; color:#cbd5e1; display:block; margin-bottom:6px;">Preferred Language (Coming Soon)</label>
                    <select id="prefLangSelect" style="width:100%; padding:10px; border-radius:10px; background:#1e293b; border:1px solid #334155; color:white;">
                        <option value="en">🇬🇧 English (Default)</option>
                        <option value="de">🇩🇪 Deutsch (Coming Soon)</option>
                        <option value="tr">🇹🇷 Türkçe (Coming Soon)</option>
                        <option value="az">🇦🇿 Azərbaycan (Coming Soon)</option>
                    </select>
                </div>

                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
                    <button type="button" id="resetSidebarBtn" class="btn-secondary-sm" style="flex:1;">
                        <i class="fas fa-undo"></i> Reset Menu Order
                    </button>
                    ${activeUser ? `<button type="button" id="settingsLogoutBtn" class="btn-secondary-sm" style="flex:1; color:#f59e0b; border-color:#f59e0b;"><i class="fas fa-sign-out-alt"></i> Log Out</button>` : ''}
                </div>

                ${activeUser ? `
                <div style="border-top:1px solid #334155; padding-top:16px;">
                    <button type="button" id="toggleDeleteBoxBtn" style="background:transparent; border:1px solid #ef4444; color:#ef4444; width:100%; padding:9px; border-radius:10px; font-weight:600; font-size:12px; cursor:pointer;">
                        <i class="fas fa-trash-alt"></i> Delete My Account
                    </button>
                    <form id="deleteAccountForm" class="hidden" style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
                        <label style="font-size:12px; color:#fca5a5;">Required Feedback: Why are you leaving? *</label>
                        <textarea id="deleteFeedbackInput" rows="2" maxlength="180" required placeholder="Your honest feedback is required..." style="background:#1e293b; border:1px solid #ef4444; color:white; padding:10px; border-radius:10px; font-size:12px;"></textarea>
                        <button type="submit" id="confirmDeleteBtn" style="background:#ef4444; color:white; border:none; padding:10px; border-radius:10px; font-weight:700; font-size:12px; cursor:pointer;">
                            Permanently Delete Account
                        </button>
                    </form>
                </div>` : ''}
            </div>
        </div>
    `;

const leftSidebar = document.getElementById("leftSidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const mobileBtn = document.getElementById("mobileSidebarToggle");
    const closeMobileBtn = document.getElementById("closeMobileSidebar");

    function openMobSidebar() {
        leftSidebar.classList.add("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.remove("hidden");
        document.body.classList.add("sidebar-mobile-open");
    }
    function closeMobSidebar() {
        leftSidebar.classList.remove("open");
        if (sidebarBackdrop) sidebarBackdrop.classList.add("hidden");
        document.body.classList.remove("sidebar-mobile-open");
    }

    if (mobileBtn) mobileBtn.addEventListener("click", openMobSidebar);
    if (closeMobileBtn) closeMobileBtn.addEventListener("click", closeMobSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobSidebar);

    document.querySelectorAll(".sidebar-projects-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const sub = btn.closest(".sidebar-item").querySelector(".sidebar-submenu");
            sub.classList.toggle("hidden");
            btn.querySelector(".drop-arrow").classList.toggle("rotated");
        });
    });

    let draggedItem = null;
    const lists = document.querySelectorAll(".sidebar-list");

    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.addEventListener("dragstart", () => {
            draggedItem = item;
            setTimeout(() => item.classList.add("dragging"), 0);
        });
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            draggedItem = null;
            const generalIds = [...document.querySelectorAll("#sidebarGeneral .sidebar-item")].map(el => el.dataset.id);
            const othersIds = [...document.querySelectorAll("#sidebarOthers .sidebar-item")].map(el => el.dataset.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ general: generalIds, others: othersIds }));
        });
    });

    lists.forEach(list => {
        list.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (!draggedItem) return;
            const draggableElements = [...list.querySelectorAll(".sidebar-item:not(.dragging)")];
            const afterElement = draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - box.top - box.height / 2;
                return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
            }, { offset: Number.NEGATIVE_INFINITY }).element;
            if (afterElement == null) list.appendChild(draggedItem);
            else list.insertBefore(draggedItem, afterElement);
        });
    });

    const settingsModal = document.getElementById("settingsModal");
    document.getElementById("openSettingsBtn").addEventListener("click", () => settingsModal.classList.remove("hidden"));
    document.getElementById("closeSettingsModal").addEventListener("click", () => settingsModal.classList.add("hidden"));

    document.getElementById("resetSidebarBtn").addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    });

    const logoutBtn = document.getElementById("settingsLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("sultan_user");
            window.location.reload();
        });
    }

    const toggleDelBtn = document.getElementById("toggleDeleteBoxBtn");
    const delForm = document.getElementById("deleteAccountForm");
    if (toggleDelBtn && delForm) {
        toggleDelBtn.addEventListener("click", () => delForm.classList.toggle("hidden"));
        delForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const feedback = document.getElementById("deleteFeedbackInput").value.trim();
            if (feedback.length < 3) return alert("Please write brief feedback before deleting.");

            const btn = document.getElementById("confirmDeleteBtn");
            btn.disabled = true;
            btn.innerText = "Deleting...";

            const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
            const sb = createClient("https://ezccynahgubalainoqkf.supabase.co", "sb_publishable_ipRtiX4xI1SYlMxU8YAWQw_D8txWLKX");

            const { data, error } = await sb.rpc("delete_my_account", { p_username: activeUser, p_feedback: feedback });
            if (!error && data === true) {
                localStorage.removeItem("sultan_user");
                localStorage.removeItem("sultan_role");
                localStorage.removeItem("sultan_dual_unlocked");
                alert("Your account has been deleted. Thank you for your feedback!");
                window.location.href = "index.html";
            } else {
                alert("Could not delete account right now.");
                btn.disabled = false;
                btn.innerText = "Permanently Delete Account";
            }
        });
    }
});
