import {strapi} from '../strapi';

export function getCacheSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    return res;
}

export async function getSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    
    try {
        res = await strapi.getEntries("songs",{},{parameters:{_limit:1000}})
        localStorage.setItem("songs",JSON.stringify(res))
    } catch (error) {
        console.log(error)
    }

    return res
}

export async function createSong(data){
    return strapi.createEntry("songs", data)
}