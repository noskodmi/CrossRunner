import React, { useState } from 'react'
import './GameButton.css' // Make sure to create this CSS file

const GameButton = ({ imageUrl }) => {
    const [style, setStyle] = useState({})

    const handleTouch = () => {
        // Animation effect (like scale or shadow change)
        setStyle({
            transform: 'scale(0.95)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)'
        })

        // Reset the effect after some time
        setTimeout(() => {
            setStyle({})
        }, 150)
    }

    return (
        <div
            className="touchable-image"
            onMouseDown={handleTouch}
            onTouchStart={handleTouch}
            style={style}
        >
            <img src={imageUrl} alt="Touchable" />
        </div>
    )
}

export default GameButton
