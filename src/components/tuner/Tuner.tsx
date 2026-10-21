import React, { useEffect, useState } from "react";
import ChordHelper from "../../resources/model/chordHelper";
import model from "../../resources/model/model";
import { detectPitch, nearestString, STRINGS, TunerInstrument } from "../../resources/tuner/pitch";
import "./Tuner.scss";

const INTERVAL = 70; //ms between measurements
const HOLD = 800; //ms the last note stays on the screen after the sound is gone
const IN_TUNE = 5; //cents

//note name in the scale from the settings, e.g. "H2"
function noteName(midi: number) {
    const name = ChordHelper.getNoteNameById(midi % 12) || "";
    return name.replace("b", "♭") + Math.floor(midi / 12 - 1);
}

export default function Tuner() {
    const instrument: TunerInstrument = model.settings.chords === "ukulele" ? "ukulele" : "guitar";
    const [frequency, setFrequency] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let stopped = false;
        let stream: MediaStream | undefined;
        let context: AudioContext | undefined;
        let timer: number | undefined;

        async function start() {
            try {
                //filters made for voice calls would spoil the tone
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
                });
                if (stopped) return stream.getTracks().forEach((t) => t.stop());

                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                context = new AudioContextClass();
                await context.resume();
                const analyser = context.createAnalyser();
                analyser.fftSize = 4096;
                context.createMediaStreamSource(stream).connect(analyser); //not connected to speakers
                const samples = new Float32Array(analyser.fftSize);

                let smooth: number | null = null;
                let lastSound = 0;
                timer = window.setInterval(() => {
                    analyser.getFloatTimeDomainData(samples);
                    const f = detectPitch(samples, context!.sampleRate);
                    const now = Date.now();
                    if (f) {
                        //average only while it is the same note, so a new string shows at once
                        smooth = smooth && Math.abs(Math.log2(f / smooth)) < 0.04 ? smooth * 0.5 + f * 0.5 : f;
                        lastSound = now;
                        setFrequency(smooth);
                    } else if (now - lastSound > HOLD) {
                        smooth = null;
                        setFrequency(null);
                    }
                }, INTERVAL);
            } catch (e) {
                if (!stopped) setError(navigator.mediaDevices ? "Microphone is not available." : "Microphone needs a secure connection (https).");
            }
        }
        start();

        return () => {
            stopped = true;
            window.clearInterval(timer);
            stream?.getTracks().forEach((t) => t.stop());
            context?.close();
        };
    }, []);

    const found = frequency ? nearestString(frequency, instrument) : null;
    const cents = found ? Math.max(-50, Math.min(50, found.cents)) : 0;
    const inTune = !!found && Math.abs(found.cents) <= IN_TUNE;

    return (
        <div className={"tuner" + (inTune ? " in-tune" : "")}>
            <div className="strings">
                {STRINGS[instrument].map((midi, i) => (
                    <span key={i} className={found?.index === i ? "active" : ""}>
                        {noteName(midi)}
                    </span>
                ))}
            </div>
            {error ? (
                <div className="message">{error}</div>
            ) : (
                <>
                    <div className="note">{found ? noteName(found.midi) : "–"}</div>
                    <div className="meter">
                        <div className="mark" />
                        {found && <div className="needle" style={{ left: 50 + cents + "%" }} />}
                    </div>
                    <div className="info">
                        {found
                            ? `${inTune ? "In tune" : found.cents < 0 ? "Tune up" : "Tune down"} · ${found.cents > 0 ? "+" : ""}${Math.round(found.cents)} ¢ · ${frequency!.toFixed(1)} Hz`
                            : "Play a string"}
                    </div>
                </>
            )}
        </div>
    );
}
