import React, { useContext, useState } from "react";
import './Stats.css';
import { useTranslation } from "react-i18next";
import tgLogo from '../ButtonLink/design/tglogo.png'
import { UserContext } from "../../context/UserContext";
function Stats() {
    const leagues = ['Novice', 'Casual', 'Athlete', 'Half Marathone', 'Marathone'];
    const [currentLeagueIndex, setCurrentLeagueIndex] = useState(0);
    const { leagueData } = useContext(UserContext)
    const { t } = useTranslation("common");

    const currentLeague = leagues[currentLeagueIndex];
    const filteredUsers = Object.values(leagueData).flatMap(users => users).filter(user => user.league === currentLeague);

    const navigateLeagues = (direction) => {
        setCurrentLeagueIndex(prevIndex => {
            if (direction === 'left') {
                return prevIndex > 0 ? prevIndex - 1 : leagues.length - 1;
            } else {
                return prevIndex < leagues.length - 1 ? prevIndex + 1 : 0;
            }
        });
    };

    return (
        <div>
            {/* {!isExcludedPage && <BackButton navigateBack={navigateBack} />} */}
            <div id='stats-container'>
                <h1>{t('stats.title')}</h1>
                <div className="league-navigation">
                    <button onClick={() => navigateLeagues('left')}>{'<'}</button>
                    <h2>{currentLeague.charAt(0).toUpperCase() + currentLeague.slice(1)} {t('stats.league')} </h2>
                    <button onClick={() => navigateLeagues('right')}>{'>'}</button>
                </div>
                <div id='stats-list'>
                    {filteredUsers.sort((a, b) => b.maxDistance - a.maxDistance).map((user, id) => (
                        <ul key={id}>
                            <div className='stats-c'>
                                <img src={tgLogo} alt={user.name}></img>
                                <div className='stats-info'>
                                    <span>{user.name}</span>
                                    <h6>{user.league}</h6>
                                </div>
                            </div>
                            <span>{user.maxDistance}</span>
                        </ul>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Stats
