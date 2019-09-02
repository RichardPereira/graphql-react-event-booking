import React from 'react';
import './Modal.css';

const modal = props => (
    <div className="modal">
        <header><h1>{props.title}</h1></header>
        <section className="modal__content">{props.chidren}</section>
        <section className="modal__actions">
            {props.canCancel  && <button className="btn" onClick={props.onConfirm}>Cancel</button>}
            {props.canConfirm && <button className="btn" onClick={props.onCancel}>Confirm</button>}
        </section>
    </div>

);

export default modal;