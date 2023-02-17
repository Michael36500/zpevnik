import { pocket } from "./pocket";

const vowels = "AEIYOU"
const consonants = "BCDFGHJKLMNPQRSTVWXZ"

export async function newSession(){
    let code = ""
    code = code + consonants[parseInt(Math.random()*20)]
    code = code + vowels[parseInt(Math.random()*6)]
    code = code + consonants[parseInt(Math.random()*20)]
    code = code + vowels[parseInt(Math.random()*6)]
    code = code + consonants[parseInt(Math.random()*20)]
    await pocket.collection("session").create({code: code})
    return code
}

export async function subscribeToSession(code, funct){
    const record = await pocket.collection('session').getFirstListItem('code="'+code+'"')
    if(!record.id){
        alert("Error joining session")
        return
    }
    pocket.collection('session').subscribe(record.id, funct);
}

export async function changeSessionSong(code,song){
    const record = await pocket.collection('session').getFirstListItem('code="'+code+'"')
    if(!record.id){
        alert("Error changing song")
        return
    }
    console.log(record.id, song)
    pocket.collection('session').update(record.id, {song:song});
}