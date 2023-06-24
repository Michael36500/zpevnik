import React, { useEffect, useState } from 'react'
import './NumberInput.scss'
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa'

interface props {
    onChange: (v:number)=>any,
    defaultValue: number,
    step?: number,
    min?: number,
    max?: number,
}

export default function NumberInput({onChange =(v)=>{}, defaultValue = 0, step = 1, min=-Infinity, max=Infinity} : props){
    const [value, setValue] = useState(defaultValue)
    useEffect(()=>{
        onChange(value)
    }, [value, onChange])

    function update(dir: 1|-1){
        if(dir === -1 && value - step >= min){
            setValue(value-step)
        }
        else if(dir === 1 && value + step <= max){
            setValue(value+step)
        }
    }

    return <div className="number-input-component">
        <div className="btn unselectable" onClick={()=>update(-1)}>-</div>
        <input type="number" value={value} onChange={(e)=>setValue(parseInt(e.target.value))} />
        <div className="btn unselectable" onClick={()=>update(+1)}>+</div>
    </div>
}