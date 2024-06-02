import React, { useState, useContext, useEffect } from "react"
import { Link } from 'react-router-dom'
import './Main.css'
import ButtonLink from "../ButtonLink/ButtonLink"
import CountUp from "react-countup";
import coin from '../ButtonLink/design/ton-coin-with-shadow.png'
import { useTelegram } from "../../hooks/useTelegram";
import { UserContext } from "../../context/UserContext"
import {useTranslation} from "react-i18next";


function Main() {
    const { t } = useTranslation("common");
    const { i18n } = useTranslation();
    // const [showGame, setShowGame] = useState(false);
    const [coins, setCoins] = useState(null);
    const [ name, setName ] = useState("Profile")
    const { userScore, setUserScore, userData, setUserData } = useContext(UserContext)
    const { user, webApp } = useTelegram()

    
    useEffect(() => {
        //i18n.changeLanguage("ru")
        i18n.changeLanguage(user.language_code)
        const userName = user.username || "Profile"
        const fullname = (user.first_name || user.last_name) ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : userName
        setName(fullname)
        document.documentElement.lang = i18n.language
        // Only load coins if userData and userData.coins are not null
        if (userData && userData.coins !== null) {
            setCoins(userData.coins); 
        }
    }, [userData]);

    const buttons = {
        stats: {
            'type': 'stats',
            'title': 'button-link.stats',
            'description': 'button-link.stats-description',
            'icon': '😍'
        },
        shop: {
            'type': 'shop',
            'title': 'button-link.shop',
            'description': 'button-link.shop-description',
            'icon': '🤑'
        }
    }
    let dailyCoinBank = 600
    
    if (!userData) { // Check if there is no user data and display a spinner centered on the screen
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        );
    }
    return (
        <div className='main-menu'>
            {/* {showGame ? (
                <ThreeJsGame onBackClick={() => setShowGame(false)} />
            ) : ( */}
                <>
                    <div className='main-score'>
                        <div><Link to="/user">{name}</Link></div>
                        <div><Link to="/total-coins"><CountUp duration={3} className="counter" start={coins-userScore} end={coins}/> {t('main.coins')}</Link></div>
                    </div>

                    <div id="game-info">
                        <h1>{t('main.title')}</h1>
                        <div id="bank-info">
                            <img src={coin}></img>
                            <span class='bank-amount'>{dailyCoinBank}</span>
                        </div>
                        <button id="coin-btn" /* onClick={() => setShowGame(true)}*/ >
                            <Link to="/game">{t('main.button')}</Link>
                        </button>
                        {/* <div onClick={() => setShowGame(true)}>
                  <GameButton imageUrl={coin} />
              </div> */}
                    </div>
                    <ButtonLink {...buttons.stats} />
                    <ButtonLink {...buttons.shop} />
                </>
            {/* )} */}
        </div>
    )
}

export default Main
