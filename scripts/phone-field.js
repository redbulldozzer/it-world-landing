(function () {
  const patternToPlaceholder = (pattern) => pattern.replace(/#/g, "0");

  const normalizePhoneDigits = (value, code, country) => {
    const digits = value.replace(/\D/g, "");
    const codeDigits = code.replace(/\D/g, "");

    if (value.trim().startsWith("+") && codeDigits && digits.startsWith(codeDigits)) {
      return digits.slice(codeDigits.length);
    }

    if ((country === "RU" || country === "KZ") && digits.length === 11 && digits.startsWith("8")) {
      return digits.slice(1);
    }

    if (codeDigits && digits.length > codeDigits.length + 3 && digits.startsWith(codeDigits)) {
      return digits.slice(codeDigits.length);
    }

    return digits;
  };

  const formatPhone = (value, pattern, code, country) => {
    const digits = normalizePhoneDigits(value, code, country);
    let digitIndex = 0;
    let formatted = "";

    for (const char of pattern) {
      if (char === "#") {
        if (digitIndex >= digits.length) break;
        formatted += digits[digitIndex];
        digitIndex += 1;
      } else if (digitIndex < digits.length) {
        formatted += char;
      }
    }

    return formatted;
  };

  const initPhoneFields = () => {
    document.querySelectorAll("[data-phone-field]").forEach((field) => {
      const countrySelect = field.querySelector("[data-phone-country]");
      const flagNode = field.querySelector("[data-phone-flag]");
      const codeNode = field.querySelector("[data-phone-code]");
      const codeInput = field.querySelector("[data-phone-code-input]");
      const phoneInput = field.querySelector("[data-phone-input]");

      const getSelectedOption = () => countrySelect?.selectedOptions?.[0];

      const syncCountry = () => {
        const option = getSelectedOption();
        if (!option) return;

        const code = option.dataset.code || "";
        const country = option.value || "RU";
        const pattern = option.dataset.pattern || "### ### ###";

        if (flagNode) flagNode.dataset.country = country;
        if (codeNode) codeNode.textContent = code;
        if (codeInput) codeInput.value = code;
        if (phoneInput) {
          phoneInput.placeholder = patternToPlaceholder(pattern);
          phoneInput.maxLength = pattern.length;
          phoneInput.value = formatPhone(phoneInput.value, pattern, code, country);
        }
      };

      countrySelect?.addEventListener("change", syncCountry);

      phoneInput?.addEventListener("input", () => {
        const option = getSelectedOption();
        const code = option?.dataset.code || "";
        const country = option?.value || "RU";
        const pattern = option?.dataset.pattern || "### ### ###";
        phoneInput.value = formatPhone(phoneInput.value, pattern, code, country);
        phoneInput.setCustomValidity("");
      });

      syncCountry();
    });
  };

  initPhoneFields();
})();
