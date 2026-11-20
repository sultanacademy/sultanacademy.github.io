// --- SULTAN ACADEMY: GDPR & EU COMPLIANT PRIVACY CONSENT ---
document.addEventListener("DOMContentLoaded", () => {
    // İstifadəçi artıq qəbul edibsə, heç nə göstərmə
    if (localStorage.getItem("sultan_cookie_consent") === "true") return;

    // Zərif qara-şüşə bildiriş qutusu
    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.style.cssText = `
        position: fixed;
        bottom: 25px;
        left: 25px;
        max-width: 380px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 20px;
        padding: 18px 22px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        z-index: 999999;
        color: #f8fafc;
        font-family: 'Poppins', sans-serif;
        font-size: 13px;
        line-height: 1.5;
        animation: fadeIn 0.4s ease-out;
    `;

    banner.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
            <i class="fas fa-cookie-bite" style="color: #f59e0b; font-size: 22px; margin-top: 2px;"></i>
            <div>
                <strong style="color: #ffffff; font-size: 14px; display: block;">Privacy & Analytics Notice</strong>
                <span style="color: #94a3b8; font-size: 12px;">We use standard privacy-first cookies to analyze learning traffic and improve academy services.</span>
            </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="acceptCookieBtn" style="
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 7px 18px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
            ">Accept & Continue</button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("acceptCookieBtn").addEventListener("click", () => {
        localStorage.setItem("sultan_cookie_consent", "true");
        banner.style.opacity = "0";
        banner.style.transition = "opacity 0.3s ease";
        setTimeout(() => banner.remove(), 300);
    });
});
