function loadGoogleAnalytics() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-4H914F5E57";
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", "G-4H914F5E57");
}

document.addEventListener("DOMContentLoaded", () => {
    const savedConsent = localStorage.getItem("sultan_cookie_consent");

    if (savedConsent === "true") {
        loadGoogleAnalytics();
        return;
    }
    if (savedConsent === "false") {
        return;
    }

    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; max-width: 390px;
        background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(14px);
        border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 20px;
        padding: 18px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        z-index: 999999; color: #f8fafc; font-family: 'Poppins', sans-serif;
    `;

    banner.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:14px;">
            <i class="fas fa-shield-alt" style="color:#38bdf8; font-size:20px; margin-top:2px;"></i>
            <div>
                <strong style="font-size:14px; display:block; margin-bottom:3px;">Privacy & Cookies</strong>
                <span style="color:#94a3b8; font-size:12px; line-height:1.4; display:block;">
                    We only enable analytics cookies if you accept. Read our <a href="privacy.html" style="color:#38bdf8; text-decoration:underline !important;">Privacy Policy</a>.
                </span>
            </div>
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button id="declineCookieBtn" style="background:transparent; color:#94a3b8; border:1px solid #334155; padding:7px 14px; border-radius:10px; font-size:12px; cursor:pointer;">Decline</button>
            <button id="acceptCookieBtn" style="background:linear-gradient(135deg,#10b981,#059669); color:white; border:none; padding:7px 16px; border-radius:10px; font-weight:600; font-size:12px; cursor:pointer;">Accept</button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("acceptCookieBtn").addEventListener("click", () => {
        localStorage.setItem("sultan_cookie_consent", "true");
        loadGoogleAnalytics();
        banner.remove();
    });

    document.getElementById("declineCookieBtn").addEventListener("click", () => {
        localStorage.setItem("sultan_cookie_consent", "false");
        banner.remove();
    });
});
