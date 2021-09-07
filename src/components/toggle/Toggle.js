import React from 'react';
import './Toggle.js';
import './Toggle.scss';

export class Toggle extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            value: props.value || false,
        }
    }

    componentDidUpdate(prevProps,prevState){
        if(prevProps.value !== this.props.value){
            this.setState({value:this.props.value})
        }
        if(prevState.value !== this.state.value){
            if(this.props.onChange){
                this.props.onChange(this.state.value)
            }
        }
    }

    render(){
        return <div 
            className={"comp-toggle"+(this.state.value?" active":"")} 
            onClick={()=>this.setState({value:!this.state.value})}>
            <div className="thumb"></div>
        </div>
    }
}

