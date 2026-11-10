(() => {
  const data = JSON.parse(document.getElementById("nsData").textContent);
  const LEVELS = ["easy", "medium", "hard"];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const cn = (i) => "R" + (Math.floor(i / 9) + 1) + "C" + ((i % 9) + 1);

  // One replay viewer per difficulty; each only touches the elements inside its own container.
  function viewer(root, { puzzle, solution, steps }) {
    const $ = (sel) => root.querySelector(sel);
    const cells = [...root.querySelectorAll(".board .cell")];
    const items = [...root.querySelectorAll("ol.steps li")];
    const slider = $(".ns-slider");
    const caption = $(".ns-caption");
    const playBtn = $('[data-act="play"]');
    const playIcon = $(".play-icon");
    const playLabel = $(".play-label");
    const speedBtns = [...root.querySelectorAll(".speed-btn")];

    const blanks = puzzle.split("").filter((d) => d === "0").length;
    const count = $(".ns-count");
    const done = $(".ns-done");
    let k = 0;
    let timer = null;
    let delay = 350;
    // Cells revealed one at a time by tapping them, on top of the replayed steps
    const revealed = new Set();
    let lastRevealed = null;

    function render() {
      const v = [...puzzle].map(Number);
      for (let j = 0; j < k; j++) if (steps[j].type === "place") v[steps[j].cell] = steps[j].digit;
      revealed.forEach((i) => { v[i] = Number(solution[i]); });
      cells.forEach((c, i) => {
        c.textContent = v[i] || "";
        c.classList.remove("current", "elim");
      });
      items.forEach((li) => li.classList.toggle("active", +li.dataset.k === k));
      slider.value = k;
      const filled = v.filter((d, i) => d && puzzle[i] === "0").length;
      count.textContent = filled + " / " + blanks + " placed";
      done.hidden = filled < blanks;

      if (lastRevealed !== null) {
        cells[lastRevealed].classList.add("current");
        caption.innerHTML = '<span class="step-tag">Revealed</span> <b>' + cn(lastRevealed) + " = " + solution[lastRevealed] + ".</b> Tap another empty cell to reveal it.";
        return;
      }

      const s = steps[k - 1];
      if (!s) {
        caption.innerHTML = '<span class="step-tag">Initial State</span> <b>Original puzzle.</b> ' + puzzle.replace(/0/g, "").length + " clues given.";
        return;
      }
      if (s.type === "place") cells[s.cell].classList.add("current");
      else s.removed.forEach(([c]) => cells[c].classList.add("elim"));
      const extra = s.type === "elim" ? " Removed candidates: " + s.removed.map(([c, d]) => d + " from " + cn(c)).join(", ") + "." : "";
      caption.innerHTML = '<span class="step-tag">Step ' + k + " of " + steps.length + "</span> <b>" + s.tech + ".</b> " + s.why.replace(/</g, "&lt;") + extra;

      const active = items[k - 1];
      if (active && timer) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    const go = (n) => { k = Math.max(0, Math.min(steps.length, n)); lastRevealed = null; render(); };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
      playIcon.textContent = "▶";
      playLabel.textContent = "Play";
    };
    const stepForward = () => (k >= steps.length ? stop() : go(k + 1));

    speedBtns.forEach((b) => {
      b.onclick = () => {
        speedBtns.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        delay = Number(b.dataset.speed);
        if (timer) { clearInterval(timer); timer = setInterval(stepForward, delay); }
      };
    });
    $('[data-act="first"]').onclick = () => { stop(); revealed.clear(); go(0); };
    $('[data-act="last"]').onclick = () => { stop(); go(steps.length); };
    $('[data-act="prev"]').onclick = () => { stop(); go(k - 1); };
    // "Place one" jumps to the next step that actually puts a digit on the board
    $('[data-act="next"]').onclick = () => {
      stop();
      let n = k + 1;
      while (n < steps.length && steps[n - 1].type !== "place") n++;
      go(n);
    };
    slider.oninput = () => { stop(); go(+slider.value); };
    items.forEach((li) => { li.onclick = () => { stop(); go(+li.dataset.k); }; });
    // Tapping an empty cell reveals only that cell's answer
    cells.forEach((c, i) => {
      c.onclick = () => {
        if (puzzle[i] !== "0" || c.textContent) return;
        stop();
        revealed.add(i);
        lastRevealed = i;
        render();
      };
    });
    playBtn.onclick = () => {
      if (timer) { stop(); return; }
      if (k >= steps.length) go(0);
      playIcon.textContent = "⏸";
      playLabel.textContent = "Pause";
      timer = setInterval(stepForward, delay);
    };

    return { stop };
  }

  const roots = {};
  const viewers = {};
  LEVELS.forEach((l) => {
    roots[l] = document.querySelector('.ns-level[data-level="' + l + '"]');
    viewers[l] = viewer(roots[l], data[l]);
  });

  function show(level) {
    LEVELS.forEach((l) => {
      roots[l].hidden = l !== level;
      if (l !== level) viewers[l].stop();
    });
    document.querySelectorAll("#nsTabs [data-level]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.level === level)));
  }

  document.getElementById("nsTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-level]");
    if (!b) return;
    store.set("ns-level", b.dataset.level);
    history.replaceState(null, "", "#" + b.dataset.level);
    show(b.dataset.level);
  });

  const fromHash = location.hash.slice(1);
  const saved = store.get("ns-level");
  show(LEVELS.includes(fromHash) ? fromHash : LEVELS.includes(saved) ? saved : "easy");
})();
