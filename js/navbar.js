document.addEventListener("DOMContentLoaded", () => {
    const headerContainer = document.getElementById("main-header");
    if (!headerContainer) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const activeUser = localStorage.getItem("sultan_user");

    headerContainer.innerHTML = `
        <nav class="navbar">
            <div class="navbar-inner">
                <a href="index.html" class="nav-brand">SULTAN ACADEMY</a>

                <button class="menu-toggle" id="mobile-menu" aria-label="Toggle Navigation" type="button">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </button>

                <ul class="nav-list" id="nav-list">
                    <li><a href="index.html" class="${currentPage === 'index.html' || currentPage === '' ? 'active-link' : ''}">Home</a></li>
                    <li><a href="tutors.html" class="${currentPage === 'tutors.html' ? 'active-link' : ''}">Find Educators</a></li>
                    <li><a href="contact.html" class="${currentPage === 'contact.html' ? 'active-link' : ''}">Contact</a></li>
                </ul>

                <div class="nav-actions">
                    <a href="shop.html" class="nav-shop-btn"><i class="fas fa-shopping-bag"></i> Shop</a>
                    <button id="navStartBtn" class="nav-join-btn" type="button">
                        <i class="fas fa-bolt"></i> <span id="navStartText">${activeUser ? `Start • ${activeUser}` : 'Start'}</span>
                    </button>
                </div>
            </div>
        </nav>
    `;

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
