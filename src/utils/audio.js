let audioCtx = null

export function beep(freq = 800, dur = 150) {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const o = audioCtx.createOscillator()
    o.type = 'square'
    o.frequency.value = freq
    o.connect(audioCtx.destination)
    o.start()
    o.stop(audioCtx.currentTime + dur / 1000)
  } catch {}
}
