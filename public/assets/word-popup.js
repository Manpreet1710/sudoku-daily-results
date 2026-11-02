// "Word of the Day" popup: shown once a day, the player taps the tiles to flip them and reveal the word.
// Words live in /assets/word-of-day.json. Add ?wotd=1 to any URL to show the popup again.
(() => {
  const KEY = "wotd_seen";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const now = new Date();
  const today = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
  const forced = new URLSearchParams(location.search).get("wotd") === "1";
  if (!forced && store.get(KEY) === today) return;

  const css = `
.wd-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(9,13,22,.6);backdrop-filter:blur(5px);opacity:0;transition:opacity .25s}
.wd-ov.on{opacity:1}
.wd-card{position:relative;width:min(440px,100%);overflow:hidden;text-align:center;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:24px;box-shadow:0 30px 60px -12px rgba(0,0,0,.45);transform:translateY(18px) scale(.96);transition:transform .3s cubic-bezier(.2,.9,.3,1.2)}
.wd-ov.on .wd-card{transform:none}
.wd-head{padding:26px 24px 20px;color:#fff;background:linear-gradient(135deg,#4f46e5,#7c3aed 55%,#ec4899)}
.wd-eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.9}
.wd-title{margin:6px 0 0;font-size:24px;font-weight:800;letter-spacing:-.02em;color:#fff;display:block}
.wd-x{position:absolute;top:12px;right:12px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font-size:20px;line-height:1;cursor:pointer}
.wd-x:hover{background:rgba(255,255,255,.35)}
.wd-body{padding:26px 22px 24px}
.wd-tiles{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;perspective:700px;cursor:pointer;margin:0 0 6px}
.wd-tile{--s:clamp(32px,calc((min(92vw,440px) - 76px) / var(--n) - 6px),52px);width:var(--s);height:calc(var(--s) * 1.18);position:relative;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.3,.7,.3,1);transition-delay:calc(var(--i) * 90ms)}
.wd-tile>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:12px;backface-visibility:hidden;font-weight:800;text-transform:uppercase}
.wd-front{background:var(--soft);border:2px solid var(--line);color:var(--muted);font-size:calc(var(--s) * .5)}
.wd-back{transform:rotateX(180deg);color:#fff;font-size:calc(var(--s) * .55);background:linear-gradient(145deg,#6aaa64,#3f8a46);box-shadow:0 6px 14px rgba(63,138,70,.4)}
.wd-open .wd-tile{transform:rotateX(180deg)}
.wd-hint{font-size:14px;font-weight:700;color:var(--accent);margin:8px 0 0;animation:wd-pulse 1.4s ease-in-out infinite}
.wd-open .wd-hint{display:none}
@keyframes wd-pulse{0%,100%{opacity:1}50%{opacity:.45}}
.wd-info{max-height:0;overflow:hidden;opacity:0;transition:max-height .5s ease .45s,opacity .4s ease .6s}
.wd-open .wd-info{max-height:260px;opacity:1}
.wd-pos{display:inline-block;margin:14px 0 8px;padding:3px 12px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.wd-mean{margin:0 0 8px;font-size:17px;font-weight:700;line-height:1.45}
.wd-ex{margin:0;font-style:italic;color:var(--ink-2);font-size:14.5px;line-height:1.5}
.wd-actions{display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap}
.wd-btn{font:inherit;font-weight:700;font-size:14px;padding:10px 20px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);cursor:pointer;text-decoration:none}
.wd-btn:hover{border-color:var(--accent);color:var(--accent)}
.wd-btn.p{background:linear-gradient(135deg,#4f46e5,#6366f1);border-color:transparent;color:#fff}
.wd-btn.p:hover{color:#fff;filter:brightness(1.08)}
.wd-spark{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.wd-spark i{position:absolute;top:-12px;width:8px;height:14px;border-radius:2px;animation:wd-fall linear forwards}
@keyframes wd-fall{to{top:105%;transform:rotate(540deg)}}
@media (prefers-reduced-motion:reduce){.wd-tile,.wd-card,.wd-info{transition:none}.wd-hint{animation:none}}
`;

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  fetch("/assets/word-of-day.json")
    .then((r) => r.json())
    .then((words) => {
      if (!Array.isArray(words) || !words.length) return;
      // Same word for everyone on the same calendar day
      const day = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
      const w = words[day % words.length];
      const letters = [...w.word];

      document.head.appendChild(el("style", "", css));
      const ov = el("div", "wd-ov");
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-modal", "true");
      ov.setAttribute("aria-label", "Word of the day");
      ov.innerHTML =
        '<div class="wd-card"><button class="wd-x" type="button" aria-label="Close">×</button>' +
        '<div class="wd-head"><div class="wd-eyebrow">✨ Word of the Day</div><h2 class="wd-title">Can you guess what it means?</h2></div>' +
        '<div class="wd-body"><div class="wd-tiles" style="--n:' + letters.length + '" role="button" tabindex="0" aria-label="Tap to reveal the word">' +
        letters.map((c, i) => '<div class="wd-tile" style="--i:' + i + '"><span class="wd-front">?</span><span class="wd-back">' + esc(c) + "</span></div>").join("") +
        '</div><p class="wd-hint">👆 Tap the tiles to reveal the word</p>' +
        '<div class="wd-info"><span class="wd-pos">' + esc(w.pos) + '</span><p class="wd-mean">' + esc(w.meaning) + '</p><p class="wd-ex">“' + esc(w.example) + '”</p></div>' +
        '<div class="wd-actions"><a class="wd-btn p" href="/word-search">Play Word Search</a><button class="wd-btn wd-close" type="button">Close</button></div></div>' +
        '<div class="wd-spark"></div></div>';
      document.body.appendChild(ov);
      requestAnimationFrame(() => ov.classList.add("on"));

      const card = ov.querySelector(".wd-card");
      const tiles = ov.querySelector(".wd-tiles");
      const close = () => {
        store.set(KEY, today);
        ov.classList.remove("on");
        setTimeout(() => ov.remove(), 250);
        document.removeEventListener("keydown", onKey);
      };
      const onKey = (e) => { if (e.key === "Escape") close(); };
      const reveal = () => {
        if (card.classList.contains("wd-open")) return;
        card.classList.add("wd-open");
        store.set(KEY, today);
        const spark = ov.querySelector(".wd-spark");
        const colors = ["#6aaa64", "#f7da21", "#ec4899", "#6366f1", "#38bdf8"];
        setTimeout(() => {
          for (let i = 0; i < 26; i++) {
            const p = el("i");
            p.style.left = Math.random() * 100 + "%";
            p.style.background = colors[i % colors.length];
            p.style.animationDuration = 1.4 + Math.random() * 1.4 + "s";
            p.style.animationDelay = Math.random() * 0.4 + "s";
            spark.appendChild(p);
          }
        }, letters.length * 90 + 300);
      };

      tiles.addEventListener("click", reveal);
      tiles.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); } });
      ov.querySelector(".wd-x").addEventListener("click", close);
      ov.querySelector(".wd-close").addEventListener("click", close);
      ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
      document.addEventListener("keydown", onKey);
      if (forced && location.hash === "#open") reveal(); // preview: /?wotd=1#open
    })
    .catch(() => {});
})();
