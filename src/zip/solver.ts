// Solver for Zip: draw one path that starts at checkpoint 1, passes the numbered
// checkpoints in order, visits every cell exactly once, and never crosses a wall.
// It reasons about which edges between neighbouring cells the path must use, records
// each deduction as a readable step, and falls back to search only if that stalls.

export interface ZipStep {
  text: string;
}

export interface ZipSolution {
  path: [number, number][]; // every cell in visiting order, 0-based, empty if unsolvable
  steps: ZipStep[];
  logical: boolean; // path found by deduction alone, no search
  unique: boolean;
}

interface Input {
  size: number;
  numbers: [row: number, col: number, n: number][];
  walls: string[];
}

const cellName = (i: number, n: number) => `row ${Math.floor(i / n) + 1}, column ${(i % n) + 1}`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function solveZip({ size: n, numbers, walls }: Input): ZipSolution {
  const total = n * n;
  const wallSet = new Set(walls);
  // Open neighbours of each cell (wall keys: V_r_c sits right of (r,c), H_r_c sits below it)
  const open = (i: number) => {
    const r = Math.floor(i / n), c = i % n, out: number[] = [];
    if (c > 0 && !wallSet.has(`V_${r}_${c - 1}`)) out.push(i - 1);
    if (c < n - 1 && !wallSet.has(`V_${r}_${c}`)) out.push(i + 1);
    if (r > 0 && !wallSet.has(`H_${r - 1}_${c}`)) out.push(i - n);
    if (r < n - 1 && !wallSet.has(`H_${r}_${c}`)) out.push(i + n);
    return out;
  };
  const nb = Array.from({ length: total }, (_, i) => open(i));

  const order = [...numbers].sort((a, b) => a[2] - b[2]);
  const cp = order.map(([r, c]) => r * n + c); // checkpoint cells in order
  const start = cp[0], end = cp[cp.length - 1];
  const target = (i: number) => (i === start || i === end ? 1 : 2);

  // ---- Deduction on edges: 0 unknown, 1 on, 2 off ----
  const ends: [number, number][] = [];
  const edgesOf: number[][] = Array.from({ length: total }, () => []);
  for (let i = 0; i < total; i++)
    for (const j of nb[i])
      if (i < j) {
        edgesOf[i].push(ends.length);
        edgesOf[j].push(ends.length);
        ends.push([i, j]);
      }
  const other = (e: number, i: number) => (ends[e][0] === i ? ends[e][1] : ends[e][0]);
  const steps: ZipStep[] = [];

  const count = (st: Int8Array, i: number) => {
    let on = 0, unk = 0;
    for (const e of edgesOf[i]) {
      if (st[e] === 1) on++;
      else if (st[e] === 0) unk++;
    }
    return { on, unk };
  };

  const components = (st: Int8Array) => {
    const parent = Array.from({ length: total }, (_, i) => i);
    const sz = Array(total).fill(1);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    let cycle = false;
    ends.forEach(([a, b], e) => {
      if (st[e] !== 1) return;
      const ra = find(a), rb = find(b);
      if (ra === rb) cycle = true;
      else {
        parent[ra] = rb;
        sz[rb] += sz[ra];
      }
    });
    return { find, sz, cycle };
  };

  // The checkpoints on any stretch of path already drawn must run 1, 2, 3... with none skipped
  const cpId = new Map(cp.map((c, k) => [c, k]));
  const orderBroken = (st: Int8Array) => {
    const adj: number[][] = Array.from({ length: total }, () => []);
    ends.forEach(([a, b], e) => {
      if (st[e] === 1) {
        adj[a].push(b);
        adj[b].push(a);
      }
    });
    const seen = new Uint8Array(total);
    for (let s0 = 0; s0 < total; s0++) {
      if (seen[s0] || adj[s0].length > 1) continue;
      const ids: number[] = [];
      let prev = -1, cur = s0;
      for (;;) {
        seen[cur] = 1;
        const id = cpId.get(cur);
        if (id !== undefined) ids.push(id);
        const next = adj[cur].find((j) => j !== prev);
        if (next === undefined) break;
        prev = cur;
        cur = next;
      }
      if (ids.length < 2) continue;
      const step1 = ids[1] - ids[0];
      if (Math.abs(step1) !== 1 || ids.some((x, t) => t > 0 && x - ids[t - 1] !== step1)) return true;
    }
    return false;
  };

  // Applies the basic rules until nothing changes; returns true if the position is impossible.
  // Each deduction is passed to `log` when given.
  const propagate = (st: Int8Array, log?: (text: string) => void): boolean => {
    for (;;) {
      let moved = false;
      for (let i = 0; i < total && !moved; i++) {
        const { on, unk } = count(st, i);
        const t = target(i);
        if (on > t || on + unk < t) return true;
        if (unk > 0 && on + unk === t) {
          for (const e of edgesOf[i]) if (st[e] === 0) st[e] = 1;
          const sides = i === start ? "the starting cell" : i === end ? "the last checkpoint" : "";
          log?.(sides
            ? cap(`${cellName(i, n)} is ${sides} and has just one open side left, so the path leaves through it.`)
            : cap(`${cellName(i, n)} has only two open sides left and the path must pass through it, so it uses both.`));
          moved = true;
        } else if (unk > 0 && on === t) {
          for (const e of edgesOf[i]) if (st[e] === 0) st[e] = 2;
          log?.(cap(`${cellName(i, n)} already has ${t === 1 ? "its one connection" : "both of its connections"}, so its other sides are closed.`));
          moved = true;
        }
      }
      if (moved) continue;

      // A link that closes a loop, or joins the start to the end early, would strand other cells
      const { find, sz, cycle } = components(st);
      if (cycle) return true;
      if (find(start) === find(end) && sz[find(start)] < total) return true;
      if (orderBroken(st)) return true;
      for (let e = 0; e < ends.length && !moved; e++) {
        if (st[e] !== 0) continue;
        const [a, b] = ends[e];
        const ra = find(a), rb = find(b);
        const joinsEnds = ra !== rb && ((find(start) === ra && find(end) === rb) || (find(start) === rb && find(end) === ra));
        if (ra === rb || (joinsEnds && sz[ra] + sz[rb] < total)) {
          st[e] = 2;
          log?.(`Linking ${cellName(a, n)} to ${cellName(b, n)} would ${ra === rb ? "close a loop" : "join the start to the end"} before every cell is visited, so that link is closed.`);
          moved = true;
        }
      }
      if (!moved) return false;
    }
  };

  const edge = new Int8Array(ends.length);
  const say = (text: string) => steps.push({ text });
  let impossible = propagate(edge, say);
  // Trial: if assuming a link is used (or unused) breaks the rules, the opposite must hold
  while (!impossible && edge.includes(0)) {
    let progressed = false;
    for (let e = 0; e < ends.length && !progressed; e++) {
      if (edge[e] !== 0) continue;
      for (const val of [1, 2]) {
        const trial = Int8Array.from(edge);
        trial[e] = val;
        if (propagate(trial)) {
          edge[e] = 3 - val;
          const [a, b] = ends[e];
          say(`If the path ${val === 1 ? "used" : "skipped"} the link between ${cellName(a, n)} and ${cellName(b, n)}, the rules would soon break, so it ${val === 1 ? "cannot" : "must"} be used.`);
          impossible = propagate(edge, say);
          progressed = true;
          break;
        }
      }
    }
    if (!progressed) break;
  }

  // Read the path off if every cell now has its connections settled
  const onNb = (i: number) => edgesOf[i].filter((e) => edge[e] === 1).map((e) => other(e, i));
  let path: number[] | null = null;
  if (Array.from({ length: total }, (_, i) => i).every((i) => onNb(i).length === target(i))) {
    const p = [start];
    let prev = -1, cur = start;
    while (cur !== end) {
      const next = onNb(cur).find((j) => j !== prev);
      if (next === undefined) break;
      prev = cur;
      cur = next;
      p.push(cur);
    }
    if (p.length === total && followsOrder(p, cp)) path = p;
  }
  const logical = path !== null;

  // ---- Search, used for the fallback and to confirm the answer is unique ----
  const found = search(nb, total, cp, 2);
  if (!path) {
    if (found.length === 0) return { path: [], steps, logical: false, unique: false };
    path = found[0];
    steps.push({ text: "Deduction alone gets stuck here, so the rest of the route is found by trial and error." });
  }
  return { path: path.map((i) => [Math.floor(i / n), i % n] as [number, number]), steps, logical, unique: found.length === 1 };
}

function followsOrder(p: number[], cp: number[]) {
  let k = 0;
  for (const cell of p) if (cell === cp[k] && ++k === cp.length) break;
  return k === cp.length && p[p.length - 1] === cp[cp.length - 1];
}

// Depth-first search for a Hamiltonian path that hits the checkpoints in order
function search(nb: number[][], total: number, cp: number[], limit: number): number[][] {
  const out: number[][] = [];
  const seen = new Uint8Array(total);
  const path: number[] = [];
  const isCp = new Map(cp.map((c, k) => [c, k]));
  const end = cp[cp.length - 1];

  // Every unvisited cell must still be reachable from the head, and a cell with a single free
  // neighbour left can only be where the path ends
  const feasible = (head: number) => {
    const reach = new Uint8Array(total);
    const stack = [head];
    reach[head] = 1;
    let count = 0;
    while (stack.length) {
      const x = stack.pop()!;
      for (const y of nb[x]) if (!seen[y] && !reach[y]) (reach[y] = 1), count++, stack.push(y);
    }
    if (count !== total - path.length) return false;
    let dead = 0;
    for (let i = 0; i < total; i++) {
      if (seen[i]) continue;
      let free = 0;
      for (const j of nb[i]) if (!seen[j] || j === head) free++;
      if (free < 2 && i !== end) dead++;
      if (free === 0) return false;
    }
    return dead === 0;
  };

  const go = (cur: number, next: number) => {
    if (out.length >= limit) return;
    if (path.length === total) {
      if (cur === end) out.push([...path]);
      return;
    }
    for (const j of nb[cur]) {
      if (seen[j]) continue;
      const k = isCp.get(j);
      if (k !== undefined && k !== next) continue; // checkpoint out of order
      if (j === end && path.length + 1 !== total) continue; // the last checkpoint closes the path
      seen[j] = 1;
      path.push(j);
      if (feasible(j)) go(j, k === next ? next + 1 : next);
      path.pop();
      seen[j] = 0;
    }
  };

  seen[cp[0]] = 1;
  path.push(cp[0]);
  go(cp[0], 1);
  return out;
}
