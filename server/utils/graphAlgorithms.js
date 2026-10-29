/**
 * Pure JS graph algorithms that operate on a simple adjacency structure.
 * These run on top of data pulled from Neo4j, so centrality / community
 * detection work out-of-the-box without needing the GDS or APOC plugins.
 *
 * graph shape:
 *   nodes: [{ id, email, name, ... }]
 *   edges: [{ source: email, target: email }]  (undirected friendship)
 */

function buildAdjacency(nodes, edges) {
  const adjacency = new Map();
  nodes.forEach((n) => adjacency.set(n.id, new Set()));

  edges.forEach(({ source, target }) => {
    if (!adjacency.has(source)) adjacency.set(source, new Set());
    if (!adjacency.has(target)) adjacency.set(target, new Set());
    if (source !== target) {
      adjacency.get(source).add(target);
      adjacency.get(target).add(source);
    }
  });

  return adjacency;
}

// BFS from a single source -> distances + shortest path counts (for betweenness)
function bfsFrom(source, adjacency) {
  const dist = new Map([[source, 0]]);
  const sigma = new Map([[source, 1]]); // # shortest paths
  const preds = new Map();
  const order = [source];
  const queue = [source];

  while (queue.length) {
    const v = queue.shift();
    const neighbors = adjacency.get(v) || new Set();
    for (const w of neighbors) {
      if (!dist.has(w)) {
        dist.set(w, dist.get(v) + 1);
        queue.push(w);
        order.push(w);
      }
      if (dist.get(w) === dist.get(v) + 1) {
        sigma.set(w, (sigma.get(w) || 0) + (sigma.get(v) || 0));
        if (!preds.has(w)) preds.set(w, []);
        preds.get(w).push(v);
      }
    }
  }

  return { dist, sigma, preds, order };
}

// Brandes' algorithm for betweenness centrality (unweighted, undirected)
function betweennessCentrality(adjacency) {
  const nodes = [...adjacency.keys()];
  const betweenness = new Map(nodes.map((n) => [n, 0]));

  for (const s of nodes) {
    const { sigma, preds, order } = bfsFrom(s, adjacency);
    const delta = new Map(nodes.map((n) => [n, 0]));

    for (let i = order.length - 1; i >= 0; i--) {
      const w = order[i];
      const list = preds.get(w) || [];
      for (const v of list) {
        const c = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
        delta.set(v, delta.get(v) + c);
      }
      if (w !== s) betweenness.set(w, betweenness.get(w) + delta.get(w));
    }
  }

  const n = nodes.length;
  const scale = n > 2 ? 1 / ((n - 1) * (n - 2)) : 0; // normalize to [0,1], undirected -> /2 handled by double counting cancel
  const normalized = new Map();
  nodes.forEach((n2) => normalized.set(n2, betweenness.get(n2) * scale));
  return normalized;
}

function closenessCentrality(adjacency) {
  const nodes = [...adjacency.keys()];
  const closeness = new Map();

  nodes.forEach((s) => {
    const { dist } = bfsFrom(s, adjacency);
    const reachable = [...dist.values()].filter((d) => d > 0);
    const totalDist = reachable.reduce((a, b) => a + b, 0);
    const reachableCount = reachable.length;

    if (totalDist === 0 || reachableCount === 0) {
      closeness.set(s, 0);
    } else {
      // Wasserman-Faust improved closeness (accounts for disconnected graphs)
      const n = nodes.length;
      const score = (reachableCount / totalDist) * (reachableCount / (n - 1));
      closeness.set(s, score);
    }
  });

  return closeness;
}

function degreeCentrality(adjacency) {
  const nodes = [...adjacency.keys()];
  const n = nodes.length;
  const degree = new Map();
  nodes.forEach((v) => {
    const deg = (adjacency.get(v) || new Set()).size;
    degree.set(v, n > 1 ? deg / (n - 1) : 0);
  });
  return degree;
}

// Power-iteration eigenvector centrality (unweighted, undirected)
function eigenvectorCentrality(adjacency, iterations = 100, tolerance = 1e-6) {
  const nodes = [...adjacency.keys()];
  let x = new Map(nodes.map((n) => [n, 1 / Math.max(nodes.length, 1)]));

  for (let iter = 0; iter < iterations; iter++) {
    const xNext = new Map(nodes.map((n) => [n, 0]));

    nodes.forEach((v) => {
      let sum = 0;
      (adjacency.get(v) || new Set()).forEach((u) => {
        sum += x.get(u) || 0;
      });
      xNext.set(v, sum);
    });

    const norm = Math.sqrt(
      [...xNext.values()].reduce((acc, val) => acc + val * val, 0)
    );

    if (norm === 0) break;

    let diff = 0;
    nodes.forEach((v) => {
      const newVal = xNext.get(v) / norm;
      diff += Math.abs(newVal - (x.get(v) || 0));
      xNext.set(v, newVal);
    });

    x = xNext;
    if (diff < tolerance) break;
  }

  // Normalize to 0-1 range for readability
  const max = Math.max(...x.values(), 1e-9);
  const scaled = new Map();
  nodes.forEach((v) => scaled.set(v, max > 0 ? x.get(v) / max : 0));
  return scaled;
}

// BFS shortest path between two nodes -> array of node ids along the path
function shortestPathBFS(source, target, adjacency) {
  if (source === target) return [source];
  if (!adjacency.has(source) || !adjacency.has(target)) return null;

  const visited = new Set([source]);
  const queue = [[source]];

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];

    for (const neighbor of adjacency.get(node) || []) {
      if (neighbor === target) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null; // no path found
}

// Label Propagation community detection (fast, no external plugins required)
function detectCommunities(adjacency, maxIterations = 100) {
  const nodes = [...adjacency.keys()];
  const labels = new Map(nodes.map((n, i) => [n, i]));

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);

    for (const node of shuffled) {
      const neighbors = [...(adjacency.get(node) || [])];
      if (neighbors.length === 0) continue;

      const counts = new Map();
      neighbors.forEach((nb) => {
        const label = labels.get(nb);
        counts.set(label, (counts.get(label) || 0) + 1);
      });

      let bestLabel = labels.get(node);
      let bestCount = -1;
      for (const [label, count] of counts) {
        if (count > bestCount || (count === bestCount && label < bestLabel)) {
          bestCount = count;
          bestLabel = label;
        }
      }

      if (bestLabel !== labels.get(node)) {
        labels.set(node, bestLabel);
        changed = true;
      }
    }

    if (!changed) break;
  }

  // Re-index labels to consecutive ints 0..k, grouped by size (largest first)
  const groups = new Map();
  labels.forEach((label, node) => {
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(node);
  });

  const sortedGroups = [...groups.values()].sort((a, b) => b.length - a.length);
  const communityMap = new Map();
  sortedGroups.forEach((members, idx) => {
    members.forEach((node) => communityMap.set(node, idx));
  });

  return { communityMap, communities: sortedGroups };
}

function networkDensity(nodeCount, edgeCount) {
  if (nodeCount < 2) return 0;
  return (2 * edgeCount) / (nodeCount * (nodeCount - 1));
}

module.exports = {
  buildAdjacency,
  bfsFrom,
  betweennessCentrality,
  closenessCentrality,
  degreeCentrality,
  eigenvectorCentrality,
  shortestPathBFS,
  detectCommunities,
  networkDensity,
};
