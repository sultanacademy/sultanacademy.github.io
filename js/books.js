import { SULTAN_CONFIG } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const bookButtons = document.querySelectorAll('a.watch-ad-btn[data-book]');

    bookButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const bookKey = this.getAttribute('data-book');
            const readerUrl = `reader.html?book=${encodeURIComponent(bookKey)}`;

            if (this.dataset.unlocked === "true") {
                sessionStorage.setItem("sultan_unlocked_" + bookKey, "true");
                window.open(readerUrl, "_blank");
                return;
            }

            const adWindow = window.open(SULTAN_CONFIG.ADSTERRA_BOOK_URL, "_blank");
            if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
                alert("⚠️ Pop-up Blocked! Please allow pop-ups in your browser to unlock this material.");
                return;
            }

            const parentBox = this.parentElement;
            const oldProg = parentBox.querySelector(".ad-progress-wrap");
            if (oldProg) oldProg.remove();

            const progWrap = document.createElement("div");
            progWrap.className = "ad-progress-wrap";
            progWrap.style.cssText = "width:100%; margin-top:8px; text-align:left;";
            progWrap.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:11px; color:#38bdf8; font-weight:600; margin-bottom:5px;">
                    <span class="ad-prog-label"><i class="fas fa-book-open"></i> Preparing your book...</span>
                    <span class="ad-pct">0%</span>
                </div>
                <div style="width:100%; height:8px; background:#0a0f1d; border-radius:10px; overflow:hidden; border:1px solid #334155;">
                    <div class="ad-bar-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #38bdf8, #10b981); border-radius:10px; transition:width 0.1s linear;"></div>
                </div>
            `;
            parentBox.appendChild(progWrap);

            const barFill = progWrap.querySelector(".ad-bar-fill");
            const pctText = progWrap.querySelector(".ad-pct");
            const labelText = progWrap.querySelector(".ad-prog-label");
            const originalBtnHTML = this.innerHTML;

            this.style.pointerEvents = 'none';
            this.style.opacity = '0.7';
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Sponsor...`;

            const DURATION = 4000;
            const startTime = Date.now();

            const checkTimer = setInterval(() => {
                const elapsed = Date.now() - startTime;

                if (adWindow.closed && !document.hidden && elapsed < DURATION) {
                    clearInterval(checkTimer);
                    barFill.style.background = "#ef4444";
                    labelText.style.color = "#ef4444";
                    labelText.innerHTML = `<i class="fas fa-times-circle"></i> Ad closed early! Keep tab open 4s.`;
                    this.innerHTML = originalBtnHTML;
                    this.style.pointerEvents = 'auto';
                    this.style.opacity = '1';
                    return;
                }

                const pct = Math.min(100, Math.round((elapsed / DURATION) * 100));
                barFill.style.width = `${pct}%`;
                pctText.innerText = `${pct}%`;

                if (elapsed >= DURATION) {
                    clearInterval(checkTimer);
                    sessionStorage.setItem("sultan_unlocked_" + bookKey, "true");
                    this.dataset.unlocked = "true";
                    this.style.opacity = '1';
                    this.style.pointerEvents = 'auto';
                    this.style.background = "#10b981";
                    this.innerHTML = `<i class="fas fa-book-open"></i> Ready! Tap to Read`;
                    labelText.style.color = "#10b981";
                    labelText.innerHTML = `<i class="fas fa-check-circle"></i> Your book is ready!`;
                    window.open(readerUrl, "_blank");
                }
            }, 100);
        });
    });
});
