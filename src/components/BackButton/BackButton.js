import React from "react"
import icon from '../ButtonLink/design/icons8-arrow-50.png'
import './BackButton.css'

function BackButton({navigateBack}) {
    return (
        <button className='back-btn' onClick={navigateBack}>
            <img src={icon} alt=""></img>
            <span>Back</span>
        </button>
    )
}

export default BackButton
