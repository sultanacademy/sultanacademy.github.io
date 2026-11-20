// --- SULTAN ACADEMY: TƏK MƏRKƏZDƏN İDARƏ OLUNAN VAHİD NAVBAR ---
document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.getElementById("main-header");
    if (!headerContainer) return;

    // Hansı səhifədə olduğumuzu müəyyən edirik
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    headerContainer.innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="nav-brand">SULTAN ACADEMY</a>

            <button class="menu-toggle" id="mobile-menu" aria-label="Toggle Navigation" type="button">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>

            <!-- Testimonials buradan silindi, sırf əsas səhifələr qaldı -->
            <ul class="nav-list" id="nav-list">
                <li><a href="index.html" class="${currentPage === 'index.html' || currentPage === '' ? 'active-link' : ''}">Home</a></li>
                <li><a href="tutors.html" class="${currentPage === 'tutors.html' ? 'active-link' : ''}">Find Educators</a></li>
                <li><a href="contact.html" class="${currentPage === 'contact.html' ? 'active-link' : ''}">Contact</a></li>
            </ul>

            <div class="nav-actions">
                <a href="shop.html" class="nav-shop-btn"><i class="fas fa-shopping-bag"></i> Shop</a>
                <a href="dashboard.html" class="nav-join-btn"><i class="fas fa-chart-line"></i> Dashboard</a>
            </div>
        </nav>
    `;

    // Mobil menyu açılıb-bağlanması
    const menuToggle = document.getElementById("mobile-menu");
    const navList = document.getElementById("nav-list");

    if (menuToggle && navList) {
        menuToggle.addEventListener("click", () => {
            navList.classList.toggle("active");
            menuToggle.classList.toggle("open");
            document.body.classList.toggle("menu-open", navList.classList.contains("active"));
        });
    }
});
