import {
  getKeys,
  setBoosts,
  setSkins,
  setTotalCoins,
  setMaxDistance,
  setTotalDistance,
  setFriendsScore,
  setLBBronze,
  setLBSilver,
  setLBGold,
  setLBPlatinum,
  setLBDiamond,
  setUserSettings,
  setWalletAddress,
  setLastTimestamp,
  settingsKeys,
  getMultipleSettings,
  removeWrongKeys,
  setCoinBoxes
} from "./storageHelpers";
const initData = {
  coins: 0,
  skins: [
    {
      name: 'runner',
      isBought: true,
      isChosen: true
    }
  ],
  boosts: [
    {
      name: 'wings',
      amount: 0
    },
  ],
  coinBox: [
    {
      name: 'coin box',
      amount: 0,
      used: 0
    }
  ],
  maxDistance: 0,
  totalDistance: 0,
  friends: [],
  leaderBoard: [],
  userSettings: [
    {
      name: "buttons",
      value: true
    },
    {
      name: "cameraMoves",
      value: false
    }
  ],
  walletAddress: 'none',
  lastTimestamp: 0,
}
export const initializeUserData = async (webApp) => {
  try {
    const responseKeys = await getKeys(webApp)
    //console.log('responseKeys', responseKeys)
    if (!responseKeys) throw new Error('Failed to fetch keys');

    //const knownKeys = responseKeys.filter(key => settingsKeys.includes(key));
    const unknownKeys = responseKeys.filter(key => !settingsKeys.includes(key));

    if (unknownKeys.length > 0) {
      // Remove unknown keys before initializing data
      await removeWrongKeys(webApp, unknownKeys);
      console.log(`Removed unknown keys: ${unknownKeys.join(', ')}`);
    }

    if (responseKeys.length === 0 || responseKeys.length !== settingsKeys.length || unknownKeys.length > 0) {
      // No keys exist, so initialize user data
      // console.log('initData', webApp.initData)
      // const authJWT = axios.get('http://157.230.109.1:8888/api/v1/user/userScore', {
      //   headers: {
      //     Authorization: webApp.initData.user.id
      //   }
      // })
      // console.log('authjwt', authJWT)
      const responseInitData = await Promise.all([
        setTotalCoins(webApp, initData.coins),
        setSkins(webApp, initData.skins),
        setBoosts(webApp, initData.boosts),
        setMaxDistance(webApp, initData.maxDistance),
        setTotalDistance(webApp, initData.totalDistance),
        setFriendsScore(webApp, initData.friends),
        // setLBBronze(webApp, initData.leaderBoard),
        // setLBSilver(webApp, initData.leaderBoard),
        // setLBGold(webApp, initData.leaderBoard),
        // setLBPlatinum(webApp, initData.leaderBoard),
        // setLBDiamond(webApp, initData.leaderBoard),
        setUserSettings(webApp, initData.userSettings),
        setWalletAddress(webApp, initData.walletAddress),
        setLastTimestamp(webApp, initData.lastTimestamp),
        setCoinBoxes(webApp, initData.coinBox)
      ])

      //console.log('respInitData', responseInitData)

      return initData; // Return initialized data
    } else {
      // Keys exist, return them or fetch additional user data if required
      // All keys are valid, fetch the settings values at once
      const settingsValues = await getMultipleSettings(webApp, settingsKeys);
      // console.log('settingsval', settingsValues)
      // Map the setting values to their corresponding keys based on index
      const result = {
        coins: Number(settingsValues.totalCoins),
        lastTimestamp: Number(settingsValues.lastTimestamp),
        skins: JSON.parse(settingsValues.skins),
        boosts: JSON.parse(settingsValues.boosts),
        totalDistance: Number(settingsValues.totalDistance),
        maxDistance: Number(settingsValues.maxDistance),
        friends: JSON.parse(settingsValues.userFriends),
        league1: JSON.parse(settingsValues.lbBronze),
        league2: JSON.parse(settingsValues.lbSilver),
        league3: JSON.parse(settingsValues.lbGold),
        league4: JSON.parse(settingsValues.lbPlatinum),
        league5: JSON.parse(settingsValues.lbDiamond),
        settings: JSON.parse(settingsValues.userSettings),
        walletAddress: settingsValues.userWalletAddress,
        coinBox: JSON.parse(settingsValues.userCoinBox)
      };
      

      //console.log('Fetched UserData', result);
      return result;
    }
  } catch (error) {
    console.error('Error during user data initialization:', error);
    const responseInitData = await Promise.all([
      setTotalCoins(webApp, initData.coins),
      setSkins(webApp, initData.skins),
      setBoosts(webApp, initData.boosts),
      setMaxDistance(webApp, initData.maxDistance),
      setTotalDistance(webApp, initData.totalDistance),
      setFriendsScore(webApp, initData.friends),
      // setLBBronze(webApp, initData.leaderBoard),
      // setLBSilver(webApp, initData.leaderBoard),
      // setLBGold(webApp, initData.leaderBoard),
      // setLBPlatinum(webApp, initData.leaderBoard),
      // setLBDiamond(webApp, initData.leaderBoard),
      setUserSettings(webApp, initData.userSettings),
      setWalletAddress(webApp, initData.walletAddress),
      setLastTimestamp(webApp, initData.lastTimestamp),
      setCoinBoxes(webApp, initData.coinBox)
    ])

    //console.log('respInitData', responseInitData)

    return initData; // Return initialized data
  }
};

