(() => {
  "use strict";

  const projects = {
    "siding-progress": {
      title: "Siding work in progress",
      date: "September 27, 2026",
      url: "https://www.facebook.com/carlosvinylsiding/posts/1553919186535565:953175407256444"
    },
    "before-after-july-one": {
      title: "Before & After: Exterior Siding",
      date: "July 19, 2026",
      url: "https://www.facebook.com/carlosvinylsiding/posts/1494383739155777"
    },
    "before-after-july-two": {
      title: "Before & After: Home Exterior",
      date: "July 19, 2026",
      url: "https://www.facebook.com/carlosvinylsiding/posts/1494380555822762"
    },
    "double-four-siding": {
      title: "New Double 4 vinyl siding",
      date: "Spring 2026",
      url: "https://www.facebook.com/carlosvinylsiding/posts/1432775595316592"
    },
    "cedar-impressions": {
      title: "Cedar Impressions vinyl siding",
      date: "May 2026",
      url: "https://www.facebook.com/carlosvinylsiding/posts/1432176368709848"
    }
  };

  const setUpNavigation = () => {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("[data-primary-navigation]");
    if (!toggle || !navigation) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (!navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 901px)").matches) closeMenu();
    });
  };

  const setUpFacebookEmbeds = () => {
    document.querySelectorAll("[data-fb-embed]").forEach((container) => {
      const project = projects[container.dataset.fbEmbed];
      if (!project) return;

      const width = Math.max(280, Math.min(500, Math.floor(container.parentElement.clientWidth || 500)));
      const frame = document.createElement("iframe");
      const embedUrl = new URL("https://www.facebook.com/plugins/post.php");
      embedUrl.searchParams.set("href", project.url);
      embedUrl.searchParams.set("show_text", "true");
      embedUrl.searchParams.set("width", String(width));

      frame.src = embedUrl.toString();
      frame.title = `Facebook project post: ${project.title}`;
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("allow", "encrypted-media; picture-in-picture; web-share");
      frame.style.setProperty("--embed-height", `${container.dataset.height || 590}px`);

      const placeholder = container.parentElement.querySelector("[data-embed-placeholder]");
      if (placeholder) {
        const fallbackLink = placeholder.querySelector("span:last-child");
        if (fallbackLink) {
          const link = document.createElement("a");
          link.href = project.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Open the Facebook post";
          fallbackLink.replaceWith(link);
        }
        frame.addEventListener("load", () => placeholder.remove(), { once: true });
      }

      container.append(frame);
    });
  };

  const fillCurrentYear = () => {
    const year = String(new Date().getFullYear());
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = year;
    });
  };

  const setUpQuoteForm = () => {
    const form = document.querySelector("#quote-form");
    if (!form) return;

    const referencePanel = document.querySelector("#selected-reference");
    const emptyReference = document.querySelector("#reference-empty");
    const referenceValue = document.querySelector("#gallery-reference-value");
    const serviceError = document.querySelector("#services-error");
    const copyButton = document.querySelector("#copy-request");
    const fallback = document.querySelector("#request-copy-fallback");
    const serviceCheckboxes = [...form.querySelectorAll('input[name="services"]')];
    let requestMessage = "";

    const selectReference = (projectId) => {
      const project = projects[projectId];
      if (!project || !referencePanel || !emptyReference || !referenceValue) return;
      document.querySelector("#reference-title").textContent = project.title;
      document.querySelector("#reference-date").textContent = project.date;
      referenceValue.value = `${project.title} — ${project.url}`;
      referencePanel.hidden = false;
      emptyReference.hidden = true;
    };

    const clearReference = () => {
      if (!referencePanel || !emptyReference || !referenceValue) return;
      referenceValue.value = "";
      referencePanel.hidden = true;
      emptyReference.hidden = false;
      const url = new URL(window.location.href);
      url.searchParams.delete("reference");
      window.history.replaceState({}, "", url.toString());
    };

    const params = new URLSearchParams(window.location.search);
    selectReference(params.get("reference"));

    const serviceSelections = {
      "vinyl-siding": ["Vinyl siding installation or replacement"],
      roofing: ["Roof replacement"],
      windows: ["Replacement windows"],
      "trim-gutters": ["Aluminum trim", "Gutters and downspouts"],
      "soffit-fascia": ["Soffit and fascia"],
      "other-exterior": ["Another home improvement project"]
    };
    (serviceSelections[params.get("service")] || []).forEach((service) => {
      const checkbox = serviceCheckboxes.find((input) => input.value === service);
      if (checkbox) checkbox.checked = true;
    });

    document.querySelector("[data-clear-reference]")?.addEventListener("click", clearReference);

    serviceCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (serviceCheckboxes.some((item) => item.checked) && serviceError) serviceError.textContent = "";
      });
    });

    copyButton?.addEventListener("click", async () => {
      if (!requestMessage) return;
      try {
        await navigator.clipboard.writeText(requestMessage);
        copyButton.textContent = "Request copied";
      } catch (_error) {
        if (fallback) {
          fallback.value = requestMessage;
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
          copyButton.textContent = "Select the text to copy";
        }
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!serviceCheckboxes.some((checkbox) => checkbox.checked)) {
        if (serviceError) serviceError.textContent = "Choose at least one service so we know what work to discuss.";
        serviceCheckboxes[0]?.focus();
        return;
      }
      if (serviceError) serviceError.textContent = "";

      const data = new FormData(form);
      const selectedServices = data.getAll("services");
      const lines = [
        "Carlos Vinyl Siding — Quote Request",
        "",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Email: ${data.get("email") || "Not provided"}`,
        `Best way to reach me: ${data.get("contactPreference")}`,
        "",
        `Town / city: ${data.get("town")}`,
        `ZIP: ${data.get("zip") || "Not provided"}`,
        `Project address: ${data.get("address") || "Not provided"}`,
        `Property type: ${data.get("propertyType")}`,
        `Stories: ${data.get("stories")}`,
        "",
        `Services: ${selectedServices.join(", ")}`,
        `Preferred start: ${data.get("timeline")}`,
        `Estimated budget: ${data.get("budget") || "Not provided"}`,
        "",
        `Project details: ${data.get("details")}`,
        `Gallery reference: ${data.get("galleryReference") || "None selected"}`
      ];
      requestMessage = lines.join("\n");
      const smsLink = document.querySelector("#open-sms");
      const confirmation = document.querySelector("#quote-confirmation");
      const submitButton = form.querySelector('[type="submit"]');

      if (smsLink) smsLink.href = `sms:+15089972540?body=${encodeURIComponent(requestMessage)}`;
      if (confirmation) {
        confirmation.hidden = false;
        confirmation.setAttribute("tabindex", "-1");
        confirmation.focus({ preventScroll: true });
        confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (submitButton) submitButton.textContent = "Request prepared";
      if (copyButton) copyButton.textContent = "Copy request details";
      if (fallback) fallback.hidden = true;
    });
  };

  setUpNavigation();
  setUpFacebookEmbeds();
  fillCurrentYear();
  setUpQuoteForm();
})();
