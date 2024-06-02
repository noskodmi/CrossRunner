import React from "react"
import './TotalCoins.css'
import arrow from '../ButtonLink/design/icons8-arrow-50.png'
import trcoin from '../ButtonLink/design/trCoin.png'
import { useTranslation } from "react-i18next";


function TotalCoins() {
    const { t } = useTranslation("common")

    return (
        <>
            <div id='coins-container'>
                <div id='coins-heading'>
                    <img id='total-coins-img' src={trcoin}></img>
                    <h1>{t('total-coins.title')}</h1>
                </div>
                <div id='coin-options'>
                    <div id='daily'>
                        <h2>{t('total-coins.group1.title')}</h2>
                        <button className="coins-btn">
                            <div className="coins-btn-container">
                                <div className="coins-btn-text">{t('total-coins.group1.option1')}</div>
                                <span>+100<img src={arrow} alt=""></img></span>
                            </div>
                        </button>
                    </div>
                    <div id='challenge'>
                        <h2>{t('total-coins.group2.title')}</h2>
                        <button className="coins-btn">
                            <div className="coins-btn-container">
                                <div className="coins-btn-text">{t('total-coins.group2.option1')}</div>
                                <span>+200<img src={arrow} alt=""></img></span>
                            </div>
                        </button>
                        <button className="coins-btn">
                            <div className="coins-btn-container">
                                <div className="coins-btn-text">{t('total-coins.group2.option2')}</div>
                                <span>+500<img src={arrow} alt=""></img></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TotalCoins
