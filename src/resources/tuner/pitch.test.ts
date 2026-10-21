import { centsBetween, detectPitch, midiToFrequency, nearestString } from "./pitch";

const rate = 48000;

//string-like tone: strong overtones, the fundamental is not the loudest
function tone(frequency: number, harmonics = [1, 0.7, 0.5, 0.3]) {
    const samples = new Float32Array(4096);
    for (let i = 0; i < samples.length; i++)
        samples[i] = 0.3 * harmonics.reduce((sum, amp, h) => sum + amp * Math.sin((2 * Math.PI * frequency * (h + 1) * i) / rate), 0) / 2;
    return samples;
}

describe("pitch detection", () => {
    it.each([82.41, 110, 146.83, 196, 246.94, 329.63, 261.63, 392, 440])("finds %f Hz", (f) => {
        const found = detectPitch(tone(f), rate) as number;
        expect(Math.abs(centsBetween(found, f))).toBeLessThan(3);
    });

    it("finds a tone with a weak fundamental", () => {
        const found = detectPitch(tone(110, [0.3, 1, 0.8, 0.4]), rate) as number;
        expect(Math.abs(centsBetween(found, 110))).toBeLessThan(3);
    });

    it("ignores silence and noise", () => {
        expect(detectPitch(new Float32Array(4096), rate)).toBeNull();
        const noise = Float32Array.from({ length: 4096 }, () => (Math.random() - 0.5) * 0.4);
        expect(detectPitch(noise, rate)).toBeNull();
    });
});

describe("strings", () => {
    it("picks the nearest string and tells how far off it is", () => {
        const s = nearestString(midiToFrequency(45) * 1.01, "guitar");
        expect(s.index).toBe(1);
        expect(s.cents).toBeCloseTo(17.2, 0);
        expect(nearestString(430, "ukulele").index).toBe(3);
    });
});
