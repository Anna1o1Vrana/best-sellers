function initBestSellersSplit() {
  const sections = document.querySelectorAll("[data-split-section]");
  const overlay = document.querySelector("[data-wishlist-overlay]");
  const closeBtn = document.querySelector("[data-wishlist-close]");
  const modalTitle = document.querySelector("[data-wishlist-product-title]");

  const openModal = (productTitle) => {
    if (!overlay) return;
    if (modalTitle) modalTitle.textContent = productTitle;
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  };

  if (overlay && !overlay.dataset.listenersBound) {
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.dataset.listenersBound = "true";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

  sections.forEach((section) => {
    const buttons = section.querySelectorAll("[data-menu-collection-btn]");
    const panels = section.querySelectorAll("[data-product-panel]");

    if (!buttons.length) return;

    const switchTab = (targetId, activeButton) => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      panels.forEach((panel) => panel.classList.remove("active"));

      activeButton.classList.add("active");
      const targetPanel = section.querySelector(`#${targetId}`);
      if (targetPanel) targetPanel.classList.add("active");
    };

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = button.getAttribute("data-target-product");
        switchTab(targetId, button);
      });
    });

    document.addEventListener("shopify:block:select", (e) => {
      if (!section.contains(e.target)) return;
      const btn =
        e.target.querySelector("[data-menu-collection-btn]") || e.target;
      const targetId = btn.getAttribute("data-target-product");
      if (targetId) switchTab(targetId, btn);
    });
    section.addEventListener("click", (e) => {
      const wishlistBtn = e.target.closest("[data-open-wishlist]");
      if (wishlistBtn) {
        e.preventDefault();
        const title = wishlistBtn.getAttribute("data-product-title");
        openModal(title);
        return;
      }

      const quickAddBtn = e.target.closest("[data-add-product-to-cart]");
      if (quickAddBtn) {
        e.preventDefault();
        if (
          quickAddBtn.hasAttribute("disabled") ||
          quickAddBtn.classList.contains("in-process")
        )
          return;

        const variantId = quickAddBtn.getAttribute("data-variant-id");
        if (!variantId) return;

        quickAddBtn.classList.add("in-process");
        quickAddBtn.setAttribute("disabled", "true");

        fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: variantId,
            quantity: 1,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Shopify API Error");
            return response.json();
          })
          .then((data) => {
            quickAddBtn.classList.remove("in-process");
            quickAddBtn.classList.add("product-added");

            setTimeout(() => {
              quickAddBtn.classList.remove("in-process");
              quickAddBtn.classList.remove("product-added");
              quickAddBtn.removeAttribute("disabled");
            }, 1000);
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);
            quickAddBtn.classList.remove("in-process");
            quickAddBtn.removeAttribute("disabled");
          });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initBestSellersSplit);

if (window.Shopify && Shopify.designMode) {
  document.addEventListener("shopify:section:load", initBestSellersSplit);
}
