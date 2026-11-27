document.addEventListener("DOMContentLoaded", () => {
    // Yalnız <a> kitab düymələrini seçirik ki, shop.js-in #watchAdBtn düyməsi ilə toqquşmasın!
    const bookButtons = document.querySelectorAll('a.watch-ad-btn[data-link]');

    bookButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetLink = this.getAttribute('data-link');

            if (this.dataset.unlocked === "true") {
                window.open(targetLink, "_blank");
                return;
            }

            const adUrl = "https://www.profitableratecpmnetwork.com/fspm49jkm?key=88e5821febc3aed060a93ce3587926fc";
            const adWindow = window.open(adUrl, "_blank");

            if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
                alert("⚠️ Pop-up Blocked! Please allow pop-ups in your browser to unlock this resource.");
                return;
            }

            this.style.pointerEvents = 'none';
            let timeLeft = 10;
            this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;

            const timer = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Unlocking... ${timeLeft}s`;
                } else {
                    clearInterval(timer);
                    if (targetLink && !targetLink.includes("YOUR_")) {
                        this.dataset.unlocked = "true";
                        this.innerHTML = `<i class="fas fa-check-circle"></i> Ready! Tap to Open`;
                        this.style.background = "#10b981";
                        this.style.pointerEvents = 'auto';
                        window.open(targetLink, "_blank");
                    } else {
                        alert("Link is coming soon!");
                        this.innerHTML = `<i class="fas fa-play-circle"></i> Watch AD & Open`;
                        this.style.pointerEvents = 'auto';
                    }
                }
            }, 1000);
        });
    });
});
