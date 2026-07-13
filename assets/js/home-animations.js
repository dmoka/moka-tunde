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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initReveal);
    } else {
        initReveal();
    }
})();
