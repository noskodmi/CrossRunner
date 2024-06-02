import React from 'react';
import './Modal.css'

const Modal = ({ isOpen, close, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={close}>X</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
