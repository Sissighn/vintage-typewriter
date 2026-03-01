import { useRef, useCallback } from "react";

type AudioContextType = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  try {
    const Ctx: AudioContextType =
      window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

function playRegularKey(ctx: AudioContext, gain = 1.0, pitch = 1.0) {
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800 * pitch;
  filter.Q.value = 0.8;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain * 0.6, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();
}

function playEnterKey(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Ding (sine wave ~1200 Hz)
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);

  const dingGain = ctx.createGain();
  dingGain.gain.setValueAtTime(0.35, now);
  dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(dingGain);
  dingGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  // Carriage return sliding noise sweep
  const slideSize = ctx.sampleRate * 0.14;
  const slideBuffer = ctx.createBuffer(1, slideSize, ctx.sampleRate);
  const slideData = slideBuffer.getChannelData(0);
  for (let i = 0; i < slideSize; i++) {
    slideData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / slideSize, 3);
  }

  const slideSource = ctx.createBufferSource();
  slideSource.buffer = slideBuffer;

  const slideFilter = ctx.createBiquadFilter();
  slideFilter.type = "bandpass";
  slideFilter.frequency.setValueAtTime(600, now + 0.05);
  slideFilter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
  slideFilter.Q.value = 1.2;

  const slideGain = ctx.createGain();
  slideGain.gain.setValueAtTime(0.4, now + 0.05);
  slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  slideSource.connect(slideFilter);
  slideFilter.connect(slideGain);
  slideGain.connect(ctx.destination);
  slideSource.start(now + 0.05);
}

function playSpaceKey(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 5);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 600;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();
}

function playTabKey(ctx: AudioContext) {
  // Two quick successive clicks
  const delay = 0.06;
  for (let i = 0; i < 2; i++) {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 10);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 1.0;

    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime + i * delay;
    gainNode.gain.setValueAtTime(0.5, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(startTime);
  }
}

export function useTypewriterSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      ctxRef.current = getAudioContext();
    }
    if (!ctxRef.current) return null;
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const playKeySound = useCallback(
    (key: string) => {
      const ctx = getCtx();
      if (!ctx) return;

      if (key === "Enter") {
        playEnterKey(ctx);
      } else if (key === "Backspace") {
        // Softer, slightly higher-pitched click
        playRegularKey(ctx, 0.5, 1.3);
      } else if (key === " ") {
        playSpaceKey(ctx);
      } else if (key === "Tab") {
        playTabKey(ctx);
      } else {
        playRegularKey(ctx, 1.0, 1.0);
      }
    },
    [getCtx],
  );

  return { playKeySound };
}
