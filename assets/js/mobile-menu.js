(function () {
    function closeMenu(widget) {
        const toggle = widget.querySelector(".elementor-menu-toggle");
        const dropdown = widget.querySelector("nav.elementor-nav-menu--dropdown");

        if (!toggle || !dropdown) {
            return;
        }

        toggle.classList.remove("elementor-active");
        toggle.setAttribute("aria-expanded", "false");
        dropdown.setAttribute("aria-hidden", "true");
        dropdown.style.maxHeight = "0px";

        dropdown.querySelectorAll("a").forEach((link) => {
            link.setAttribute("tabindex", "-1");
        });
    }

    function openMenu(widget) {
        const toggle = widget.querySelector(".elementor-menu-toggle");
        const dropdown = widget.querySelector("nav.elementor-nav-menu--dropdown");

        if (!toggle || !dropdown) {
            return;
        }

        toggle.classList.add("elementor-active");
        toggle.setAttribute("aria-expanded", "true");
        dropdown.setAttribute("aria-hidden", "false");
        dropdown.style.maxHeight = dropdown.scrollHeight + "px";

        dropdown.querySelectorAll("a").forEach((link) => {
            link.removeAttribute("tabindex");
        });
    }

    function toggleMenu(widget) {
        const toggle = widget.querySelector(".elementor-menu-toggle");
        const isOpen = toggle && toggle.getAttribute("aria-expanded") === "true";

        if (isOpen) {
            closeMenu(widget);
        } else {
            openMenu(widget);
        }
    }

    function initMobileMenus() {
        document.querySelectorAll(".elementor-widget-nav-menu").forEach((widget) => {
            const toggle = widget.querySelector(".elementor-menu-toggle");
            const dropdown = widget.querySelector("nav.elementor-nav-menu--dropdown");

            if (!toggle || !dropdown || toggle.dataset.adlMobileMenuReady) {
                return;
            }

            toggle.dataset.adlMobileMenuReady = "true";
            closeMenu(widget);

            toggle.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleMenu(widget);
            });

            toggle.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleMenu(widget);
                }
            });

            dropdown.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", () => closeMenu(widget));
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMobileMenus);
    } else {
        initMobileMenus();
    }

    window.addEventListener("resize", initMobileMenus);
})();
