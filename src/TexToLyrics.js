import React from 'react';

export default class TexToLyrics extends React.Component{
    constructor(){
        super()
        this.state = {
            text:`Zuzana \\Dm{}byla dívka, \\C{}která žila v \\Dm{}Amesbury,\\\\
s jasnýma \\F{}očima a \\C{}řečmi pánům \\Dm{}navzdory,\\\\
souse\\F{}dé o ní \\C{}říkali, že \\Dm{}temná kouzla \\Am{}zná\\\\
a \\Bb{}že se lidem \\Am{}vyhýbá a s \\Bb{}ďáblem \\C{}pletky \\Dm{}má.`
        }
    }

    process(){
        let string = this.state.text;
        string = string.replaceAll(/\\[ABCDEFG]#?b?(.*?){}/g,t=>{
            t = t.replaceAll(/\[(.*?)\]/g,t=>{    
                return t.substring(1,t.length-1)
            })
            return "["+t.substring(1,t.length-2)+"]"
        })
        string = string.replaceAll("\\\\","")
        this.setState({text: string})
    }

    render(){
        return <div>
            <textarea rows="5" cols="100" value={this.state.text} onChange={(e)=>this.setState({text:e.target.value})}/>
            <button onClick={()=>this.process()}>Process</button>
        </div>
    }
}