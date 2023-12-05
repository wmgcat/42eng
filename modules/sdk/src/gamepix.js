import { EVENTS } from '../main.js';

async function FullScreen() {
  if (!EVENTS.ADStart('fullscreen')) return false;
  const res = await GamePix.interstitialAd();
  EVENTS.ADStop('fullscreen', res.success);

  if (res.success) return true;
  return false;
}

async function Rewarded(id) {
  if (!EVENTS.ADStart('rewarded')) return false;
  const res = await GamePix.rewardAd();
  EVENTS.ADStop('rewarded', id, res.success);
  if (res.success) return true;
  return false;
}

export {
  FullScreen, Rewarded
}