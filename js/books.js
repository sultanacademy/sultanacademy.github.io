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

            const adUrl = "https://arwf.org/4/3946e81041ccc9d120f1b729feb68fae";
            const adWindow = window.open(adUrl, "_blank");

            if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
                alert("⚠️ Pop-up Blocked! Please allow pop-ups in your browser to unlock this material.");
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
                    sessionStorage.setItem("sultan_unlocked_" + bookKey, "true");
                    this.dataset.unlocked = "true";
                    this.innerHTML = `<i class="fas fa-book-open"></i> Ready! Tap to Read`;
                    this.style.background = "#10b981";
                    this.style.pointerEvents = 'auto';
                    window.open(readerUrl, "_blank");
                }
            }, 1000);
        });
    });
});
