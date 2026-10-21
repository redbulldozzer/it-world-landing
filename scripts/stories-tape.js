(function () {
  const initStoriesTape = () => {
    document.querySelectorAll(".stories-tape").forEach((tape) => {
      const track = tape.querySelector(".stories-tape__track");
      let isDragging = false;
      let dragStartX = 0;
      let dragStartScroll = 0;

      const syncTrackHeight = () => {
        if (!track) return;

        const bottom = Array.from(track.children).reduce(
          (max, child) => Math.max(max, child.offsetTop + child.offsetHeight),
          0
        );

        track.style.height = `${Math.ceil(bottom)}px`;
      };

      syncTrackHeight();
      window.addEventListener("load", syncTrackHeight);
      window.addEventListener("resize", syncTrackHeight);

      if ("ResizeObserver" in window && track) {
        const resizeObserver = new ResizeObserver(syncTrackHeight);
        Array.from(track.children).forEach((child) => resizeObserver.observe(child));
      }

      tape.addEventListener("pointerdown", (event) => {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartScroll = tape.scrollLeft;
        tape.classList.add("is-dragging");
        tape.setPointerCapture(event.pointerId);
      });

      tape.addEventListener("pointermove", (event) => {
        if (!isDragging) return;
        tape.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
      });

      const stopDrag = (event) => {
        if (!isDragging) return;
        isDragging = false;
        tape.classList.remove("is-dragging");
        if (tape.hasPointerCapture(event.pointerId)) {
          tape.releasePointerCapture(event.pointerId);
        }
      };

      tape.addEventListener("pointerup", stopDrag);
      tape.addEventListener("pointercancel", stopDrag);
      tape.addEventListener("pointerleave", stopDrag);
    });
  };

  initStoriesTape();
})();
