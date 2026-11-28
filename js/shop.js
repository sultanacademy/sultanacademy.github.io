import { SULTAN_CONFIG, supabase, escapeHTML, safeUrl, cleanHandle } from './config.js';

const userPointsDisplay = document.getElementById('userPoints');
const watchAdBtn = document.getElementById('watchAdBtn');
const adStatus = document.getElementById('adStatus');
const productsGrid = document.getElementById('productsGrid');
const loggedInUser = document.getElementById('loggedInUser');
const userNameText = document.getElementById('userNameText');
const loginBox = document.querySelector('.login-box');
const sectionDesc = document.querySelector('.section-desc');

let currentUser = localStorage.getItem('sultan_user');
let currentToken = localStorage.getItem('sultan_token');
let currentSP = 0;

// 1. Login Box-u Google Password Manager dəstəkli Form-a çeviririk (shop.html-i dəyişmədən!)
function setupAuthBox() {
    if (!loginBox) return;

    // Əgər saytdan artıq giriş edilibsə, avtomatik balansını yüklə!
    if (currentUser && currentToken) {
        loadUserBalance();
        return;
    }

    loginBox.innerHTML = `
        <form id="shopAuthForm" autocomplete="on" style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; width:100%;">
            <input type="text" id="userInput" name="username" autocomplete="username" maxlength="20" required placeholder="Username..." value="${escapeHTML(currentUser || '')}" style="max-width:220px;" />
            <input type="password" id="shopPassInput" name="password" autocomplete="current-password" minlength="4" maxlength="32" required placeholder="Password / PIN..." style="max-width:200px;" />
            <button type="submit" id="loginBtn"><i class="fas fa-sign-in-alt"></i> Sign In / Save</button>
        </form>
    `;

    document.getElementById('shopAuthForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        const username = cleanHandle(document.getElementById('userInput').value);
        const password = document.getElementById('shopPassInput').value;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

        const { data, error } = await supabase.rpc('auth_user', { p_username: username, p_password: password });
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In / Save';

        if (error || !data || !data.ok) {
            return alert(data?.error || 'Authentication failed.');
        }

        currentUser = data.username;
        currentToken = data.token;
        currentSP = data.sp || 0;

        localStorage.setItem('sultan_user', currentUser);
        localStorage.setItem('sultan_token', currentToken);

        showLoggedInUI();
    });
}

async function loadUserBalance() {
    const { data } = await supabase.from('users').select('sp').eq('username', currentUser).single();
    currentSP = data?.sp || 0;
    showLoggedInUI();
}

function showLoggedInUI() {
    userPointsDisplay.innerText = currentSP;
    loggedInUser.classList.remove('hidden');
    userNameText.innerHTML = `${escapeHTML(currentUser)} <button type="button" id="shopLogoutBtn" style="margin-left:8px; background:transparent; border:1px solid #475569; color:#94a3b8; font-size:11px; padding:2px 8px; border-radius:8px; cursor:pointer;">Log out</button>`;
    if (loginBox) loginBox.classList.add('hidden');
    if (sectionDesc) sectionDesc.innerText = "Signed in! Watch sponsor ads or redeem your SP below.";

    const outBtn = document.getElementById('shopLogoutBtn');
    if (outBtn) {
        outBtn.addEventListener('click', () => {
            localStorage.removeItem('sultan_user');
            localStorage.removeItem('sultan_token');
            window.location.reload();
        });
    }
}

// 2. ANTI-CHEAT REKLAM SİSTEMİ (Server-side RPC ilə)
if (watchAdBtn) {
    watchAdBtn.addEventListener('click', () => {
        if (!currentUser || !currentToken) {
            alert("Please sign in with your Username & Password at the top first!");
            return;
        }

        const adWindow = window.open(SULTAN_CONFIG.ADSTERRA_BOOK_URL, "_blank");
        if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
            alert("⚠️ Pop-up Blocked! Please allow pop-ups to watch the sponsor ad.");
            return;
        }

        watchAdBtn.disabled = true;
        adStatus.classList.remove('hidden');
        adStatus.innerHTML = `
            <div style="max-width:340px; margin:12px auto 0 auto; text-align:left;">
                <div style="display:flex; justify-content:space-between; font-size:12px; color:#f59e0b; font-weight:600; margin-bottom:5px;">
                    <span id="spBarLabel">Preparing your +10 SP reward...</span>
                    <span id="spBarPct">0%</span>
                </div>
                <div style="width:100%; height:9px; background:#0a0f1d; border-radius:10px; overflow:hidden; border:1px solid #334155;">
                    <div id="spBarFill" style="width:0%; height:100%; background:linear-gradient(90deg, #f59e0b, #10b981); transition:width 0.1s linear;"></div>
                </div>
            </div>
        `;

        const DURATION = 10500;
        const startTime = Date.now();
        watchAdBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Watching Sponsor Ad...`;

        const countdownTimer = setInterval(async () => {
            const elapsed = Date.now() - startTime;

            if (adWindow.closed && !document.hidden && elapsed < DURATION) {
                clearInterval(countdownTimer);
                document.getElementById("spBarFill").style.background = "#ef4444";
                document.getElementById("spBarLabel").style.color = "#ef4444";
                document.getElementById("spBarLabel").innerText = "❌ You closed the ad too early! No SP awarded.";
                watchAdBtn.innerHTML = `<i class="fas fa-play-circle"></i> Watch Sponsor Ad (+10 SP)`;
                watchAdBtn.disabled = false;
                return;
            }

            const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
            document.getElementById("spBarFill").style.width = `${pct}%`;
            document.getElementById("spBarPct").innerText = `${pct}%`;

            if (elapsed >= DURATION) {
                clearInterval(countdownTimer);
                document.getElementById("spBarLabel").innerText = "Verifying securely...";

                const { data, error } = await supabase.rpc('claim_ad_sp', { p_username: currentUser, p_token: currentToken });

                if (!error && data && data.ok) {
                    currentSP = data.sp;
                    userPointsDisplay.innerText = currentSP;
                    document.getElementById("spBarLabel").style.color = "#10b981";
                    document.getElementById("spBarLabel").innerText = "🎉 Success! +10 SP Added!";
                } else {
                    document.getElementById("spBarLabel").style.color = "#ef4444";
                    document.getElementById("spBarLabel").innerText = data?.error || "❌ Verification failed.";
                }

                watchAdBtn.innerHTML = `<i class="fas fa-play-circle"></i> Watch Sponsor Ad (+10 SP)`;
                watchAdBtn.disabled = false;
                setTimeout(() => { adStatus.classList.add('hidden'); }, 4000);
            }
        }, 100);
    });
}

// 3. REWARDS SHOP (Server-side Alış + İkon klik xətası düzəldildi!)
async function loadShopItems() {
    const { data: items, error } = await supabase.from('shop_items').select('*');

    if (error) {
        productsGrid.innerHTML = "<p class='loading-spinner'>Error loading items.</p>";
        return;
    }
    if (!items || items.length === 0) {
        productsGrid.innerHTML = "<p class='loading-spinner'>Shop is currently empty.</p>";
        return;
    }

    productsGrid.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${safeUrl(item.cover_img, 'logo.png')}" alt="Cover" class="product-image" onerror="this.src='logo.png'">
            <h3 class="product-title">${escapeHTML(item.title)}</h3>
            <p class="product-price">${parseInt(item.price, 10)} SP</p>
            <button class="buy-btn" data-id="${item.id}">
                <i class="fas fa-unlock"></i> Unlock Item
            </button>
        `;
        productsGrid.appendChild(card);
    });

    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!currentUser || !currentToken) {
                alert("Please sign in at the top first!");
                return;
            }
            const itemId = parseInt(btn.getAttribute('data-id'), 10);
            btn.disabled = true;

            const { data, error } = await supabase.rpc('purchase_shop_item', {
                p_username: currentUser,
                p_token: currentToken,
                p_item_id: itemId
            });

            btn.disabled = false;

            if (!error && data && data.ok) {
                currentSP = data.sp;
                userPointsDisplay.innerText = currentSP;
                alert("Purchase successful! The material will open in a new tab.");
                window.open(safeUrl(data.drive_link), "_blank");
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Purchased';
                btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
            } else {
                alert(data?.error || "Purchase failed.");
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setupAuthBox();
    loadShopItems();
});
