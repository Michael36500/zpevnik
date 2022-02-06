import { Redirect, Route, Switch, withRouter } from "react-router";
import { useSwipeable } from "react-swipeable";
import { Song } from "./components/song";
import NewSong from "./pages/NewSong";
import Settings from "./pages/Settings";
import TestPage from "./pages/TestPage";
import TexToLyrics from "./TexToLyrics";

function Main({settings={}, song, updateSettings=()=>{}, location, history, songIds=[]}){
    const songId=parseInt(location.pathname.substring(1,location.pathname.length))
    const next=songIds[(songIds.indexOf(songId)+1)%songIds.length]
    const prev=songIds[(songIds.indexOf(songId)-1)>=0?(songIds.indexOf(songId)-1):songIds.length-1]
    //console.log(songIds)
    //console.log(songId,next,prev)

    const handlers = useSwipeable({
        onSwipedLeft: ()=>{history.push("/"+next)},
        onSwipedRight: ()=>{history.push("/"+prev)},
    })

    return<div id="main" >
        <Switch>
            <Route path="/settings"><Settings settings={settings} onChange={v => updateSettings(v)} songs={songIds.length} /></Route>
            <Route path="/new" exact><NewSong /></Route>
            <Route path="/ttl" exact><TexToLyrics /></Route>
            <Route path="/test"><TestPage/></Route>
            <Route path="/:id" render={ctx => <Song
                song={song}
                columns={settings.columns}
                fontsize={settings.fontsize}
                trans={settings.transpose}
                swipes={!!songId?handlers:{}}
                prev={prev} next={next}
                transposeCapo={settings.transposeCapo}
            />} />
            <Route path="/" exact><Redirect to="/1" /></Route>
        </Switch>
    </div>
 }

 export default withRouter(Main)