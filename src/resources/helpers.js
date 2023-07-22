import { Lyrics } from "../components/lyrics";
import model from "./model/model";

export function normalize(string) {
    if (typeof string !== "string") return "";
    return string
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function isMobile() {
    return Boolean(window.innerWidth < 600);
}

export function getCurrentSongId() {
    let location = window.location;
    return location.pathname.substring(1);
}

export async function autoFit() {
    const alb = !model.settings.lineBreak; //avoid line break

    const delay = model.settings.autofitIntervalDelay;
    const element = model.settings.autofitShowTitle ? "song" : "lyrics";
    let songH = () =>
        document.getElementById(element)?.clientHeight +
        model.settings.fontSize;
    let songW = () =>
        document.getElementById("lyrics")?.clientWidth +
        model.settings.fontSize;

    let mainH = () => document.getElementById("main")?.clientHeight;
    let mainW = () => document.getElementById("main")?.clientWidth;
    if (!songH() || !mainH()) return;

    function correct(val) {
        const curFS = model.settings.fontSize;
        let fs = (curFS * 10 + val * 10) / 10;
        model.setSettings({ fontSize: fs });
    }

    if (songH() < mainH()) {
        //make font-size bigger
        let i = setInterval(() => {
            correct(0.1);
            if (songH() > mainH() || songW() > mainW()) {
                clearInterval(i);
                correct(-0.1);
                document.getElementById(element)?.scrollIntoView();
            }
        }, delay);
    }

    if (songH() > mainH() || songW() > mainW()) {
        let i = setInterval(() => {
            correct(-0.1);
            if (songH() < mainH() && (!alb || songW() < mainW())) {
                document.getElementById(element)?.scrollIntoView();
                clearInterval(i);
            }
        }, delay);
    }
}

export function set(name, val) {
    model.setSettings({ [name]: val });
}
