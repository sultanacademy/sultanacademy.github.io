document.addEventListener("DOMContentLoaded", async () => {
    // 1. PWA Manifest & Service Worker qoşulması
    if (!document.querySelector('link[rel="manifest"]')) {
        const mf = document.createElement("link");
        mf.rel = "manifest";
        mf.href = "manifest.json";
        document.head.appendChild(mf);
    }
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }

    // 2. Config & Supabase yükləmə
    const { SULTAN_CONFIG, escapeHTML, supabase } = await import("./config.js");

    // 3. Footer və Bütün "YOUR_WISE_LINK_HERE" linklərini avtomatik düzəlt!
    document.querySelectorAll(".footer p").forEach(p => {
        p.innerHTML = p.innerHTML.replace("Sultan Alizada", "Sultan Academy");
    });
    document.querySelectorAll('a[href="YOUR_WISE_LINK_HERE"], a.metallic-support-btn').forEach(a => {
        a.href = SULTAN_CONFIG.WISE_LINK;
    });

    const headerContainer = document.getElementById("main-header");
    if (!headerContainer) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const activeUser = localStorage.getItem("sultan_user");
    const activeToken = localStorage.getItem("sultan_token");

    const menuItemsDB = {
        home: { label: "Home", href: "index.html", icon: "fas fa-home" },
        quick_start: { label: activeUser ? `Account • ${escapeHTML(activeUser)}` : "Sign In / Quick Start", type: "action", id: "navStartBtn", icon: "fas fa-bolt" },
        dashboard: { label: "Dashboard", href: "dashboard.html", icon: "fas fa-th-large" },
        chat: { label: "Messages & Tools", href: "chat.html", icon: "fas fa-comments" },
        library: { label: "Library & Shop", href: "shop.html", icon: "fas fa-book" },
        become_educator: { label: "Become an Educator", href: "become-educator.html", icon: "fas fa-chalkboard-teacher" },
        find_educators: { label: "Find Educators", href: "tutors.html", icon: "fas fa-search" },
        skill_swap: { label: "Skill Swap", href: "skill-swap.html", icon: "fas fa-exchange-alt" },
        lang_exchange: { label: "Language & Cultural Exchange", href: "exchange.html", icon: "fas fa-globe" },
        live_clubs: { label: "Weekly Live Clubs & Workshops", href: "clubs.html", icon: "fas fa-broadcast-tower" },
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
        general: ["home", "quick_start", "dashboard", "chat", "library", "become_educator", "find_educators", "skill_swap", "lang_exchange", "live_clubs"],
        others: ["leaderboard", "projects", "testimonials", "contact"]
    };

    const STORAGE_KEY = "sultan_sidebar_layout_v5";
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

        if (item.type === "action") {
            return `
                <li class="sidebar-item" draggable="true" data-id="${id}">
                    <div class="sidebar-row">
                        <button type="button" id="${item.id}" title="${item.label}" class="sidebar-link" style="color:#38bdf8;">
                            <i class="${item.icon}" style="color:#38bdf8;"></i>
                            <span class="nav-label-txt" id="navStartText">${item.label}</span>
                        </button>
                        <span class="drag-handle" title="Hold & drag to reorder"><i class="fas fa-grip-vertical"></i></span>
                    </div>
                </li>`;
        }

        if (item.type === "dropdown") {
            const isChildActive = item.children.some(c => c.href === currentPage);
            const subHTML = item.children.map(c =>
                `<a href="${c.href}" class="sidebar-sublink ${currentPage === c.href ? 'active' : ''}">${c.label}</a>`
            ).join("");
            return `
                <li class="sidebar-item" draggable="true" data-id="${id}">
                    <div class="sidebar-row">
                        <button type="button" title="${item.label}" class="sidebar-link sidebar-projects-toggle ${isChildActive ? 'active' : ''}">
                            <i class="${item.icon}"></i>
                            <span class="nav-label-txt">${item.label}</span>
                            <i class="fas fa-chevron-down drop-arrow ${isChildActive ? 'rotated' : ''}"></i>
                        </button>
                        <span class="drag-handle" title="Hold & drag to reorder"><i class="fas fa-grip-vertical"></i></span>
                    </div>
                    <div class="sidebar-submenu ${isChildActive ? '' : 'hidden'}">${subHTML}</div>
                </li>`;
        }

        const isActive = (item.href === currentPage) || (currentPage === "" && item.href === "index.html");
        const badgeSlot = id === "chat" ? `<span id="navUnreadBadge" class="hidden" style="margin-left:auto; background:#ef4444; color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:12px;">0</span>` : "";

        return `
            <li class="sidebar-item" draggable="true" data-id="${id}">
                <div class="sidebar-row">
                    <a href="${item.href}" title="${item.label}" class="sidebar-link ${isActive ? 'active' : ''}">
                        <i class="${item.icon}"></i>
                        <span class="nav-label-txt">${item.label}</span>
                        ${badgeSlot}
                    </a>
                    <span class="drag-handle" title="Hold & drag to reorder"><i class="fas fa-grip-vertical"></i></span>
                </div>
            </li>`;
    }

    // Yuxarı sağda YALNIZ Settings çarxı saxlayırıq (heç vaxt mobil menyu ilə toqquşmur!)
    headerContainer.innerHTML = `
        <button id="mobileSidebarToggle" class="mobile-sidebar-btn" type="button" aria-label="Open Menu">
            <i class="fas fa-bars"></i>
        </button>

        <div class="top-utility-bar">
            <button id="openSettingsBtn" class="settings-gear-btn" type="button" title="Settings & Account">
                <i class="fas fa-cog"></i>
            </button>
        </div>

        <div id="sidebarBackdrop" class="sidebar-backdrop hidden"></div>
        <aside id="leftSidebar" class="left-sidebar">
            <div class="sidebar-brand">
                <a href="index.html">
                    <img src="logo.png" alt="Logo" style="width:30px; height:30px; border-radius:8px; object-fit:cover; flex-shrink:0;">
                    <span class="brand-text">SULTAN ACADEMY</span>
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
                    <strong style="font-size:16px; color:#ffffff;">${activeUser ? escapeHTML(activeUser) : 'Guest (Not signed in)'}</strong>
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

    // Real-Time Unread Mesaj Badge yoxlaması
    if (activeUser) {
        const { data: unreadCount } = await supabase.rpc("get_unread_count", { p_username: activeUser });
        if (unreadCount && unreadCount > 0) {
            const badge = document.getElementById("navUnreadBadge");
            if (badge) {
                badge.innerText = unreadCount;
                badge.classList.remove("hidden");
            }
            const mobBtn = document.getElementById("mobileSidebarToggle");
            if (mobBtn) {
                mobBtn.innerHTML = `<i class="fas fa-bars"></i><span style="position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:9px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${unreadCount}</span>`;
            }
        }
    }

    // Mobil Sidebar & Drag-Drop
    const leftSidebar = document.getElementById("leftSidebar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");
    const mobileBtn = document.getElementById("mobileSidebarToggle");
    const closeMobileBtn = document.getElementById("closeMobileSidebar");

    function openMobSidebar(e) {
        if (e) e.stopPropagation();
        leftSidebar.classList.add("open");
        sidebarBackdrop.classList.remove("hidden");
        document.documentElement.classList.add("sidebar-mobile-open");
        document.body.classList.add("sidebar-mobile-open");
    }
    function closeMobSidebar() {
        leftSidebar.classList.remove("open");
        sidebarBackdrop.classList.add("hidden");
        document.documentElement.classList.remove("sidebar-mobile-open");
        document.body.classList.remove("sidebar-mobile-open");
    }

    if (mobileBtn) mobileBtn.addEventListener("click", openMobSidebar);
    if (closeMobileBtn) closeMobileBtn.addEventListener("click", closeMobSidebar);
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener("click", closeMobSidebar);
        sidebarBackdrop.addEventListener("touchend", (e) => { e.preventDefault(); closeMobSidebar(); });
    }
    document.addEventListener("click", (e) => {
        if (leftSidebar.classList.contains("open") && !leftSidebar.contains(e.target) && !mobileBtn.contains(e.target)) closeMobSidebar();
    });

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
        item.addEventListener("dragstart", () => { draggedItem = item; setTimeout(() => item.classList.add("dragging"), 0); });
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
    document.getElementById("resetSidebarBtn").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); });

    const logoutBtn = document.getElementById("settingsLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("sultan_user");
            localStorage.removeItem("sultan_token");
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
            if (!activeToken) return alert("Please sign in with your password again to delete your account.");

            const btn = document.getElementById("confirmDeleteBtn");
            btn.disabled = true;
            btn.innerText = "Deleting...";

            const { data, error } = await supabase.rpc("delete_my_account", { p_username: activeUser, p_token: activeToken, p_feedback: feedback });
            if (!error && data === true) {
                localStorage.removeItem("sultan_user");
                localStorage.removeItem("sultan_token");
                localStorage.removeItem("sultan_role");
                localStorage.removeItem("sultan_dual_unlocked");
                alert("Your account has been deleted. Thank you for your feedback!");
                window.location.href = "index.html";
            } else {
                alert("Session invalid. Please log out and sign in with your password first.");
                btn.disabled = false;
                btn.innerText = "Permanently Delete Account";
            }
        });
    }
});
