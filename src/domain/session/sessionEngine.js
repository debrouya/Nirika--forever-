export function createSet(w, r) {
  return {
    w: Number(w) || 0,
    r: Number(r) || 0,
    volume: (Number(w) || 0) * (Number(r) || 0),
  }
}

export function isNewPR(weight, pr) {
  return weight > pr
}
