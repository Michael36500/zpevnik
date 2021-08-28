import {strapi} from '../strapi';

export function getCacheSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    return res;
}

export async function getSongs(){
    let res = JSON.parse(localStorage.getItem("songs"))
    
    try {
        res = await strapi.getEntries("songs")
        console.log(res)
        localStorage.setItem("songs",JSON.stringify(res))
    } catch (error) {
        console.log(error)
    }

    return res
}