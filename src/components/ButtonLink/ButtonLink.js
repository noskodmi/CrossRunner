import React from "react";
import "./ButtonLink.css";
import arrow from './design/icons8-arrow-50.png'
import { Link } from 'react-router-dom';
import {useTranslation} from "react-i18next";

function ButtonLink({ type, title, description, icon }) {
    const { t } = useTranslation("common");
    const linkPath = type === "stats" ? "/stats" : type === "shop" ? "/shop" : "/";

    return (
        <Link to={linkPath} className={`btn ${type}`}>
            <div className="btn-icon">{icon}</div>
            <div className="btn-text">
                <div className="btn-title">{t(title)}</div>
                <div className="btn-description">{t(description)}</div>
            </div>
            <img className="btn-arrow" src={arrow} alt="Arrow icon" />
        </Link>
    );
}

export default ButtonLink;
