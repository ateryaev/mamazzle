let actx = null;

export function beep(vol, freq, duration) {
  if (!actx) actx = new AudioContext();
  let osc = actx.createOscillator();
  let gn = actx.createGain();
  osc.connect(gn)
  osc.frequency.value = freq;
  osc.type = "triangle";
  gn.connect(actx.destination);
  gn.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime + duration * 0.001)
  osc.start(actx.currentTime);
  osc.stop(actx.currentTime + duration * 0.001)
}

export function beepButton() {
  beep(500, 160, 100);
}
export function beepSwipe() {
  beep(500, 220, 50);
}
export function beepSwipeComplete() {
  beep(500, 270, 100);
}
