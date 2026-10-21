(function () {
  const getPhoneValidation = (form) => {
    const formData = new FormData(form);
    const phone = formData.get("phone") || "";
    const phoneDigits = String(phone).replace(/\D/g, "");
    const phoneInput = form.querySelector("[data-phone-input]");
    const countrySelect = form.querySelector("[data-phone-country]");
    const selectedCountry = countrySelect?.selectedOptions?.[0];
    const phonePattern = selectedCountry?.dataset.pattern || "";
    const requiredPhoneDigits = (phonePattern.match(/#/g) || []).length;

    return {
      formData,
      phoneDigits,
      phoneInput,
      isValid: !phoneInput || !requiredPhoneDigits || phoneDigits.length >= requiredPhoneDigits,
    };
  };

  const submitPayload = async (endpoint, form, payload) => {
    if (!endpoint) {
      console.info("Feedback form payload", payload);
      return;
    }

    const isGoogleScript = endpoint.includes("script.google.com");

    if (isGoogleScript) {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(payload),
      });
      return;
    }

    const response = await fetch(endpoint, {
      method: form.getAttribute("method") || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
  };

  const getInvalidMessage = (field) => {
    if (field.matches("[data-phone-input]")) {
      return "Введите телефон полностью.";
    }

    if (field.matches("[name='terms']")) {
      return "Нужно принять условия обработки персональных данных.";
    }

    return "Заполните обязательные поля.";
  };

  const initFeedbackForm = () => {
    const feedbackForm = document.querySelector("#feedback-form");
    const formStatus = document.querySelector("#form-status");

    if (!feedbackForm || !formStatus) return;

    const showFormStatus = window.createFormToast(formStatus);

    feedbackForm.addEventListener(
      "invalid",
      (event) => {
        showFormStatus("error", getInvalidMessage(event.target));
      },
      true
    );

    feedbackForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = feedbackForm.querySelector("[type='submit']");
      const { formData, phoneDigits, phoneInput, isValid } = getPhoneValidation(feedbackForm);

      if (!isValid) {
        phoneInput.setCustomValidity("Введите телефон полностью");
        phoneInput.reportValidity();
        showFormStatus("error", "Введите телефон полностью.");
        return;
      }

      const phoneCode = formData.get("phoneCode") || "";
      formData.set("phoneFull", `${phoneCode}${phoneDigits}`);
      formData.set("terms", feedbackForm.elements.terms?.checked ? "yes" : "no");
      formData.set("newsletter", feedbackForm.elements.newsletter?.checked ? "yes" : "no");

      const endpoint = feedbackForm.dataset.endpoint || feedbackForm.getAttribute("action");

      submitButton?.setAttribute("disabled", "true");
      showFormStatus("sending", "Отправляем отклик...");

      try {
        const payload = Object.fromEntries(formData);
        payload.pageUrl = window.location.href;

        await submitPayload(endpoint, feedbackForm, payload);

        showFormStatus(
          "success",
          "Спасибо! Отклик сохранен. Мы свяжемся с Вами в течение одного рабочего дня."
        );

        feedbackForm.reset();
        feedbackForm.querySelector("[data-phone-country]")?.dispatchEvent(new Event("change"));
      } catch (error) {
        console.error(error);
        showFormStatus("error", "Не удалось отправить отклик. Попробуйте еще раз.");
      } finally {
        submitButton?.removeAttribute("disabled");
      }
    });
  };

  initFeedbackForm();
})();
