import React, { useContext, useState, useEffect } from "react"
import tgLogo from '../ButtonLink/design/tglogo.png'
import './UserPage.css'
import { useTranslation } from "react-i18next";
import { UserContext } from "../../context/UserContext"
import { useTelegram } from "../../hooks/useTelegram";

function UserPage() {
    //const { isExcludedPage, navigateBack } = useBackButton()
    const [maxDistance, setMaxDistance] = useState(0)
    const [totalDistance, setTotalDistance] = useState(0)
    const [friends, setFriends] = useState([])
    const { userData } = useContext( UserContext )
    const { t } = useTranslation("common")
    const { user, webApp } = useTelegram()

    useEffect(() => {
        // Only update coins if userData and userData.coins are not null
        if (userData && userData.maxDistance != null) {
            setMaxDistance(userData.maxDistance);
        }
        if (userData && userData.totalDistance != null) {
            setTotalDistance(userData.totalDistance);
        }
        if (userData && userData.friends != null) {
            setFriends(userData.friends);
        }
    }, [userData]);
    
    const handleSendData = () => {
        try {
            // Assuming 'coins' is the data you want to send
            const link = `https://t.me/ton_runnerbot?start=${user.id}`
            const shareUrl = `https://t.me/share/url?text=&url=${link}`
            //webApp.sendData('create_invite')
            webApp.openTelegramLink(shareUrl);

        } catch(error) {
            console.error("Failed to send data:", error);
        }
    };
    return (
        <>
            {/* {!isExcludedPage && (
                <BackButton navigateBack={navigateBack} />
            )} */}
            <div id='frens-container'>
                <h3>{t('user-page.title')} {maxDistance}m</h3>
                <h3>{t('user-page.title1')} {totalDistance}m</h3>
                <h3>{t('user-page.title2')}</h3>
                <div id='frens-list'>
                    <li>
                        {friends.sort((a, b) => b.maxDistance - a.maxDistance).map((fren, id) => (
                            <ul key={id}>
                                <div className='fren-c'>
                                    <img src={tgLogo} alt=""></img>
                                    <div className='fren-info'>
                                        <span>{fren.fullname}</span>
                                    </div>
                                </div>
                                <span>{fren.maxDistance}</span>
                            </ul>
                        ))}
                    </li>
                </div>
                <button id="invite-btn" onClick={handleSendData}>{t('user-page.button')}</button>
            </div>
        </>
    )
}

export default UserPage
