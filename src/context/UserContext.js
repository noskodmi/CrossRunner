import React, { createContext, useState, useEffect, useRef } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { initializeUserData } from '../helpers/userInit';
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { setLastTimestamp, setFriendsScore, setMaxDistance, setTotalCoins, setTotalDistance, setLBBronze, setLBSilver, setLBGold, setLBDiamond, setLBPlatinum } from '../helpers/storageHelpers';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userScore, setUserScore] = useState(0); // Initialize with a default score, for example, 0
  const [userData, setUserData] = useState(null); // Additional state for user data
  const [authJWT, setAuthJWT] = useState(null); // Additional state for user data
  const { webApp } = useTelegram()
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitialized = useRef(false);
  const leagues = ['Novice', 'Casual', 'Athlete', 'Half Marathone', 'Marathone'];
  const [leagueData, setLeagueData] = useState({
    Novice: [],
    Casual: [],
    Athlete: [],
    'Half-Marathone': [],
    Marathone: []
  });
  // Function to load user data (and possibly the score)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const paramsAuthJWT = searchParams.get('authJWT')
        if (paramsAuthJWT) {
          setAuthJWT(paramsAuthJWT)
        }
        const data = await initializeUserData(webApp)
        const response = await axios.get('http://157.230.109.1:8888/api/v1/user/userScore', {
          headers: {
            Authorization: `Bearer ${paramsAuthJWT}`
          }
        })
        const responseData = response.data;

        if (responseData?.friends) {
          setFriendsScore(webApp, responseData.friends)
          data.friends = responseData.friends
        }
        if (responseData?.totalCoins) {
          setTotalCoins(webApp, responseData.totalCoins)
          data.coins = responseData.totalCoins
        }
        if (responseData?.totalDistance) {
          setTotalDistance(webApp, responseData.totalDistance)
          data.totalDistance = responseData.totalDistance
        }
        if (responseData?.maxDistance) {
          setMaxDistance(webApp, responseData.maxDistance)
          data.maxDistance = responseData.maxDistance
        }

        const currentTimestamp = responseData.timestamp
        // Convert 5 minutes to milliseconds
        const oneMinutesInMilliseconds = 5 * 60 * 1000;
        const latestTimestamp = data.lastTimestamp
        //console.log('curts', currentTimestamp, latestTimestamp,'lts', data)
        //if (currentTimestamp - latestTimestamp >= oneMinutesInMilliseconds) {
          const responseLB = await axios.get('http://157.230.109.1:8888/api/v1/leaderboard');

          if (responseLB.data) {
            const newLeagueData = {};
            // Create initial empty arrays for each league
            leagues.forEach(league => {
              newLeagueData[league] = [];
            });
            setLastTimestamp(webApp, responseLB.data.timestamp)
            data.lastTimestamp = responseLB.data.timestamp
            // Fill the arrays with corresponding users
            responseLB.data.leaderboard.forEach((item, idx) => {
              const leagueName = item._id;
              if (newLeagueData.hasOwnProperty(leagueName) && Array.isArray(item.users)) {
                newLeagueData[leagueName] = item.users.map(user => ({
                  name: user.fullname,
                  league: leagueName,
                  maxDistance: user.maxDistance
                }));
              }
              if (leagueName === 'Novice') {
                data.league1 = newLeagueData[leagueName]
                //setLBBronze(webApp, newLeagueData[leagueName])
              }
              if (leagueName === 'Casual') {
                data.league2 = newLeagueData[leagueName]
                //setLBSilver(webApp, newLeagueData[leagueName])
              }
              if (leagueName === 'Athlete') {
                data.league3 = newLeagueData[leagueName]
                //setLBGold(webApp, newLeagueData[leagueName])
              }
              if (leagueName === 'Half Marathone') {
                data.league4 = newLeagueData[leagueName]
                //setLBDiamond(webApp, newLeagueData[leagueName])
              }
              if (leagueName === 'Marathone') {
                data.league5 = newLeagueData[leagueName]
                //setLBPlatinum(webApp, newLeagueData[leagueName])
              }
            });
            setLastTimestamp(webApp, currentTimestamp)
            setLeagueData(newLeagueData);
          }
        // }else{
        //   const leagueDataLocal = {}
        //   leagueDataLocal['Novice'] = data.league1
        //   leagueDataLocal['Casual'] = data.league2
        //   leagueDataLocal['Athlete'] = data.league3
        //   leagueDataLocal['Half Marathone'] = data.league4
        //   leagueDataLocal['Marathone'] = data.league5
        //   setLeagueData(leagueDataLocal);
        // }
        setUserData(data); // Set the user data retrieved from the server
        // If user data contains the score, update it as well:
        // setUserScore(data.score);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Handle error, e.g., by setting state or showing an error message
      }
    };
    if (!hasInitialized.current) {
      loadUserData();
      hasInitialized.current = true;
    }
  }, []);

  return (
    <UserContext.Provider value={{ userScore, setUserScore, userData, setUserData, authJWT, leagueData }}>
      {children}
    </UserContext.Provider>
  );
};