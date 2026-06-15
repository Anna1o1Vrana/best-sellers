function initBestSellersSplit() {
  const sections = document.querySelectorAll("[data-split-section]");
  const overlay = document.querySelector("[data-wishlist-overlay]");
  const closeBtn = document.querySelector("[data-wishlist-close]");
  const modalTitle = document.querySelector("[data-wishlist-product-title]");
  console.log(sections, overlay, closeBtn, modalTitle);

  const openModal = (productTitle) => {
    if (!overlay) return;
    modalTitle.textContent = productTitle;
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  };

  if (overlay && !overlay.dataset.listenersBound) {
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.dataset.listenersBound = "true";
  }

  sections.forEach((section) => {
    const buttons = section.querySelectorAll(".menu-collection-btn");
    const panels = section.querySelectorAll(".split-product-panel");

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
      const btn = e.target.querySelector(".menu-collection-btn") || e.target;
      const targetId = btn.getAttribute("data-target-product");
      if (targetId) switchTab(targetId, btn);
    });
    section.addEventListener("click", (e) => {
      const wishlistBtn = e.target.closest(".action-btn--wishlist");
      if (wishlistBtn) {
        e.preventDefault();
        const title = wishlistBtn.getAttribute("data-product-title");
        openModal(title);
      }

      const quickAddBtn = e.target.closest(".action-btn--quick-add");
      if (quickAddBtn) {
        e.preventDefault();
        if (quickAddBtn.hasAttribute("disabled")) return;

        const variantId = quickAddBtn.getAttribute("data-variant-id");

        quickAddBtn.style.pointerEvents = "none";
        quickAddBtn.style.opacity = "0.6";

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
          .then((response) => response.json())
          .then((data) => {
            quickAddBtn.style.pointerEvents = "auto";
            quickAddBtn.style.opacity = "1";
            quickAddBtn.style.backgroundColor = "#e8f5e9";
            setTimeout(
              () => (quickAddBtn.style.backgroundColor = "#ffffff"),
              1000,
            );
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);
            quickAddBtn.style.pointerEvents = "auto";
            quickAddBtn.style.opacity = "1";
          });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initBestSellersSplit);

if (window.Shopify && Shopify.designMode) {
  document.addEventListener("shopify:section:load", initBestSellersSplit);
}
