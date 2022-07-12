import { useLocation } from "react-router";

export function normalize(string) {
    if (typeof string !== "string") return ""
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
 }
 
export function isMobile() {
    return Boolean(window.innerWidth < 600);
}

export function getCurrentSongId(){
    let location = window.location
    return parseInt(location.pathname.substring(1))
}