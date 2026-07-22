(function () {
    function showAll(items) {
        items.forEach((item) => item.classList.add("is-visible"));
    }

    function initReveal() {
        const items = Array.from(document.querySelectorAll(".adl-reveal"));

        if (!items.length) {
            return;
        }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            showAll(items);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.16 });

        items.forEach((item) => observer.observe(item));
    }

    function initHeroSlideshow() {
        const hero = document.querySelector(".elementor-40 .elementor-element.elementor-element-18cce59");

        if (!hero || hero.querySelector(".adl-hero-slideshow")) {
            return;
        }

        const images = [
            "/assets/images/2026/07/sajat/budapest-duna-varos-1532.jpg",
            "/assets/images/2026/07/sajat/tunde-jozsef-attila-10.jpg",
            "/assets/images/2026/07/sajat/szines-nappali-1800.jpg",
            "/assets/images/2026/07/sajat/teraszos-hangulat-1684.jpg",
        ];
        const slideshow = document.createElement("div");

        slideshow.className = "adl-hero-slideshow";
        slideshow.setAttribute("aria-hidden", "true");

        images.forEach((image) => {
            const slide = document.createElement("span");

            slide.style.backgroundImage = `url("${image}")`;
            slideshow.appendChild(slide);
        });

        hero.prepend(slideshow);
    }

    function initHome() {
        initHeroSlideshow();
        initReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHome);
    } else {
        initHome();
    }
})();
