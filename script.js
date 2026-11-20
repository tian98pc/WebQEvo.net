/**
 * Quantum Evolution SpA — Interacciones principales (2026)
 *
 * CONFIGURACIÓN DEL FORMULARIO DE COTIZACIÓN (Web3Forms):
 * 1. Entra a https://web3forms.com/ y solicita tu Access Key gratuita para info@quantumevo.net
 * 2. Pega tu clave en WEB3FORMS_ACCESS_KEY abajo y haz push a GitHub.
 */
const WEB3FORMS_ACCESS_KEY = "5832e4d3-074f-4f58-aea2-1ae0ddf36629";
const WHATSAPP_NUMBER = "56228121175";
const CONTACT_EMAIL = "info@quantumevo.net";

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initServicePreselect();
  initQuoteForm();
});

function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (!menuToggle || !mainNav) return;

  const setOpen = (isOpen) => {
    mainNav.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !isOpen);
      icon.classList.toggle("fa-xmark", isOpen);
    }
  };

  menuToggle.addEventListener("click", () => {
    setOpen(!mainNav.classList.contains("open"));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("open")) {
      setOpen(false);
      menuToggle.focus();
    }
  });
}

function initServicePreselect() {
  const serviceSelect = document.getElementById("servicio");
  if (!serviceSelect) return;

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("servicio");
  if (!requested) return;

  const matchingOption = Array.from(serviceSelect.options).find(
    (opt) => opt.value.toLowerCase() === requested.toLowerCase()
  );
  if (matchingOption) {
    serviceSelect.value = matchingOption.value;
  }
}

function buildQuoteSummary(form) {
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const telefono = form.telefono.value.trim();
  const servicio = form.servicio.value;
  const modalidad = form.modalidad.value;
  const mensaje = form.mensaje.value.trim();

  const lines = [
    "Hola Quantum Evolution SpA, quisiera solicitar una cotización:",
    "",
    `• Nombre: ${nombre || "(No indicado)"}`,
    `• Correo: ${email || "(No indicado)"}`,
    telefono ? `• Teléfono: ${telefono}` : null,
    `• Servicio: ${servicio}`,
    `• Modalidad: ${modalidad}`,
    `• Detalle: ${mensaje || "(Sin detalle adicional)"}`
  ].filter(Boolean);

  return lines.join("\n");
}

function initQuoteForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;

  const statusBox = document.getElementById("form-status");
  const submitBtn = form.querySelector('button[type="submit"]');
  const whatsappBtn = document.getElementById("btn-quote-whatsapp");

  const showStatus = (type, html) => {
    if (!statusBox) return;
    statusBox.className = `form-status is-visible form-status--${type}`;
    statusBox.innerHTML = html;
  };

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      if (!form.reportValidity()) return;
      const text = encodeURIComponent(buildQuoteSummary(form));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const isKeyConfigured =
      WEB3FORMS_ACCESS_KEY &&
      !WEB3FORMS_ACCESS_KEY.startsWith("PEGAR_AQUI");

    if (!isKeyConfigured) {
      const summary = buildQuoteSummary(form);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
      const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Cotización web: ${form.servicio.value}`
      )}&body=${encodeURIComponent(summary)}`;

      showStatus(
        "warn",
        `<strong>Envío por correo pendiente de activar:</strong> falta configurar tu clave gratuita de Web3Forms en <code>script.js</code>. Mientras tanto, puedes enviar esta misma solicitud al instante por <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700;">WhatsApp</a> o <a href="${mailtoUrl}" style="text-decoration:underline;font-weight:700;">tu cliente de correo</a>.`
      );
      return;
    }

    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';

    try {
      const formData = new FormData(form);
      formData.set("access_key", WEB3FORMS_ACCESS_KEY);
      formData.set("subject", `Nueva cotización — ${form.servicio.value} (${form.nombre.value.trim()})`);
      formData.set("from_name", "Web Quantum Evolution SpA");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showStatus(
          "success",
          "<strong>¡Cotización enviada con éxito!</strong> Recibimos tu solicitud y te responderemos a la brevedad a tu correo o WhatsApp."
        );
        form.reset();
      } else {
        throw new Error(result.message || "No se pudo completar el envío");
      }
    } catch (error) {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildQuoteSummary(form))}`;
      showStatus(
        "warn",
        `<strong>No pudimos enviar el formulario en este momento.</strong> Por favor inténtalo de nuevo o envíanos tu solicitud directo por <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;font-weight:700;">WhatsApp</a>.`
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });
}
