if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
        if (document.querySelector("cart-drawer"))
          this.submitButton.setAttribute("aria-haspopup", "dialog");

        this.hideErrors = this.dataset.hideErrors === "true";
        this.error = false;
      }

      async onSubmitHandler(evt) {
        evt.preventDefault();

        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.classList.add("loading");
        this.querySelector(".loading-overlay__spinner").classList.remove(
          "hidden"
        );

        try {
          const config = fetchConfig("javascript");
          config.headers["X-Requested-With"] = "XMLHttpRequest";
          delete config.headers["Content-Type"];

          const formData = new FormData(this.form);

          if (!this.form.checkValidity()) {
            this.handleErrorMessage("Please fill in all required fields.");
            return;
          }

          if (this.cart) {
            formData.append(
              "sections",
              this.cart.getSectionsToRender().map((section) => section.id)
            );
            formData.append("sections_url", window.location.pathname);
            this.cart.setActiveElement(document.activeElement);
          }

          config.body = formData;

          const mainProductResponse = await fetch(
            `${routes.cart_add_url}`,
            config
          );
          const mainProductData = await mainProductResponse.json();

          if (mainProductData.status) {
            this.handleErrorMessage(mainProductData.description);
            this.error = true;
            return;
          }

          const addonProductsWrapper = document.querySelector(
            ".addon-products__wrapper"
          );
          const selectedAddon = addonProductsWrapper?.querySelector(
            'input[name="fav_product"]:checked'
          );

          if (selectedAddon) {
            const addonVariantId = selectedAddon.value;

            const response = await fetch("/cart/add.js", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: addonVariantId,
                quantity: 1,
                sections: this.cart
                  .getSectionsToRender()
                  .map((section) => section.id),
              }),
            });

            const addonProduct = await response.json();
            this.cart.renderContents(addonProduct);
          }

          if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          if (!selectedAddon) {
            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: "product-form",
              productVariantId: formData.get("id"),
            });

            // Render the main product response to the cart
            this.cart.renderContents(mainProductData);
          }
        } catch (error) {
          console.error("Error adding products to cart:", error);
          this.handleErrorMessage(
            "There was an error while adding to the cart."
          );
        } finally {
          this.submitButton.classList.remove("loading");
          if (this.cart && this.cart.classList.contains("is-empty"))
            this.cart.classList.remove("is-empty");
          if (!this.error) this.submitButton.removeAttribute("aria-disabled");
          this.querySelector(".loading-overlay__spinner").classList.add(
            "hidden"
          );
        }
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
