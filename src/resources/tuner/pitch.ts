//pitch detection and string tables for the tuner; knows nothing about the browser

export type TunerInstrument = "guitar" | "ukulele";

//midi numbers of the open strings, in the order the tuner shows them
export const STRINGS: { [instrument in TunerInstrument]: number[] } = {
    guitar: [40, 45, 50, 55, 59, 64], //E2 A2 D3 G3 B3 E4
    ukulele: [67, 60, 64, 69], //G4 C4 E4 A4 (re-entrant tuning)
};

export const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export const centsBetween = (frequency: number, target: number) => 1200 * Math.log2(frequency / target);

//the open string closest to the frequency (in cents, so the distance is the same for low and high strings)
export function nearestString(frequency: number, instrument: TunerInstrument) {
    const midis = STRINGS[instrument];
    let best = 0;
    midis.forEach((midi, i) => {
        if (Math.abs(centsBetween(frequency, midiToFrequency(midi))) < Math.abs(centsBetween(frequency, midiToFrequency(midis[best])))) best = i;
    });
    const target = midiToFrequency(midis[best]);
    return { index: best, midi: midis[best], target, cents: centsBetween(frequency, target) };
}

//YIN algorithm: returns the fundamental frequency in Hz or null when there is no clear tone
//samples need to be at least window + sampleRate / minFrequency long
export function detectPitch(samples: Float32Array, sampleRate: number, minFrequency = 60, maxFrequency = 1000): number | null {
    const window = 2048;
    const tauMax = Math.min(Math.floor(sampleRate / minFrequency), samples.length - window);
    const tauMin = Math.max(2, Math.floor(sampleRate / maxFrequency));
    if (tauMax <= tauMin) return null;

    let energy = 0;
    for (let i = 0; i < window; i++) energy += samples[i] * samples[i];
    if (Math.sqrt(energy / window) < 0.008) return null; //too quiet

    //difference function normalized by its running mean
    const d = new Float32Array(tauMax + 1);
    for (let tau = 1; tau <= tauMax; tau++) {
        let sum = 0;
        for (let i = 0; i < window; i++) {
            const delta = samples[i] - samples[i + tau];
            sum += delta * delta;
        }
        d[tau] = sum;
    }
    const n = new Float32Array(tauMax + 1);
    n[0] = 1;
    let running = 0;
    for (let tau = 1; tau <= tauMax; tau++) {
        running += d[tau];
        n[tau] = running ? (d[tau] * tau) / running : 1;
    }

    //the first dip under the threshold, followed down to its bottom
    const threshold = 0.15;
    let tau = -1;
    for (let t = tauMin; t < tauMax; t++) {
        if (n[t] < threshold) {
            while (t + 1 < tauMax && n[t + 1] < n[t]) t++;
            tau = t;
            break;
        }
    }
    if (tau < 0) return null;

    //parabolic interpolation for a more precise period
    const a = n[tau - 1];
    const b = n[tau];
    const c = n[tau + 1];
    const denominator = a - 2 * b + c;
    const shift = denominator ? (a - c) / (2 * denominator) : 0;
    return sampleRate / (tau + shift);
}
