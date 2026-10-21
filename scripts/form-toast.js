(function () {
  window.createFormToast = function createFormToast(statusNode) {
    let formToastTimer;

    const getToast = () => {
      let toast = document.querySelector(".form-toast");

      if (!toast) {
        toast = document.createElement("div");
        toast.className = "form-toast";
        document.body.append(toast);
      }

      return toast;
    };

    return function showFormStatus(type, message, autoHide = type !== "sending") {
      const toast = getToast();

      if (statusNode) {
        statusNode.textContent = message;
      }

      clearTimeout(formToastTimer);
      toast.textContent = message;
      toast.className = `form-toast form-toast--${type} is-visible`;
      toast.setAttribute("role", type === "error" ? "alert" : "status");
      toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

      if (autoHide) {
        formToastTimer = window.setTimeout(() => {
          toast.classList.remove("is-visible");
        }, 5200);
      }
    };
  };
})();
