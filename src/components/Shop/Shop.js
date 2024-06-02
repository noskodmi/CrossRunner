import React, { useContext, useEffect, useState } from "react"
import './Shop.css'
import arrow from '../ButtonLink/design/icons8-arrow-50.png'
import { useTranslation } from "react-i18next";
import { useTelegram } from "../../hooks/useTelegram"
import { setBoosts, setCoinBoxes, setSkins, setTotalCoins, setWalletAddress } from "../../helpers/storageHelpers"
import gran from '../ButtonLink/design/gran.png'
import cok from '../ButtonLink/design/cok.png'
import runner from '../ButtonLink/design/runner.png'
import robot from '../ButtonLink/design/robot.png'
import trap from '../ButtonLink/design/trap.png'
import zai from '../ButtonLink/design/zai.png'
import coolman from '../ButtonLink/design/coolman.png'
import trCoin from '../ButtonLink/design/trCoin.png'
import wingImg from '../ButtonLink/design/wings.png'
import rainbowImg from '../ButtonLink/design/rainbow.png'
import specialImg from '../ButtonLink/design/tonCoin.png'
import box1 from '../ButtonLink/design/box1.png'
import box2 from '../ButtonLink/design/box2.png'
import box3 from '../ButtonLink/design/box3.png'
import { UserContext } from "../../context/UserContext"
import Modal from "./Modal"
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useTonConnect } from "../../hooks/useTonConnect";
import axios from 'axios'

const Shop = () => {
    const { webApp } = useTelegram()
    const userFriendlyAddress = useTonAddress();
    const [characters, setCharacters] = useState(null)
    const [coins, setCoins] = useState(null)
    const [powerups, setPowerups] = useState(null)
    const [coinBox, setCoinBox] = useState(null)
    const [selectedCharacter, setSelectedCharacter] = useState(null)
    const [selectedBoost, setSelectedBoost] = useState(null)
    const [selectedTonItem, setSelectedTonItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { sender, connected } = useTonConnect()
    //const [tonConnectUI, setOptions] = useTonConnectUI()
    const { userData, setUserData, authJWT } = useContext(UserContext)
    const { t } = useTranslation("common");
    // const [tonRecipient, setTonRecipient] = useState(
    //     "UQAblBzIVomq7_zN8dF6D6lSiSa-wyPBEuRvUc6CDMV59bET"
    //   );
      
    useEffect(() => {
        // Only update coins if userData and userData.coins are not null
        if (userData && userData.coins != null) {
            setCoins(userData.coins);
            setPowerups(userData.boosts)
            setCharacters(userData.skins)
            //console.log('userdatacoinbox', userData.coinBox)
            setCoinBox(userData.coinBox)
        }
        if(connected){
            if(userFriendlyAddress && userData.walletAddress !== userFriendlyAddress){
                setWalletAddress(webApp, userFriendlyAddress)
                axios.post('http://157.230.109.1:8888/api/v1/user/userScore', {
                    walletAddress: userFriendlyAddress,
                  }, {
                    headers: {
                      Authorization: `Bearer ${authJWT}`
                    }
                  })
            }
        }
    }, [userData]);

    const openDetailScreen = (character) => {
        const char = {
            name: character.name,
            isBought: false,
            isChosen: false
        }
        const boughtChar = characters.filter(boughtCharacter => boughtCharacter.name === char.name)[0]
        if (boughtChar) {
            setSelectedCharacter(boughtChar)
        } else {
            setSelectedCharacter(char)
        }
        setIsModalOpen(true);
    };

    const closeDetailScreen = () => {
        setSelectedCharacter(null);
        setIsModalOpen(false);
    };

    const openDetailTONScreen = (tonItem) => {
        if(!connected){
            webApp.showAlert(t('shop.tonShop.connectWalletAlert'))
            return
        }
        const item = {
            name: tonItem.name,
            amount: 0,
            used: 0
        }
        const boughtItem = coinBox.find(boughtCoinBox => boughtCoinBox.name === tonItem.name)
        if (boughtItem) {
            console.log('tonscreenboughtitem', boughtItem)
            setSelectedTonItem(boughtItem)
        } else {
            console.log('tonscreennewitem', item)
            setSelectedTonItem(item)
        }
        setIsModalOpen(true);
    };

    const openDetailBoostScreen = (boost) => {
        const powerUp = {
            name: boost.name,
            amount: 0
        }
        const boughtBooust = powerups.find(boughtPowerUp => boughtPowerUp.name === powerUp.name)
        if (boughtBooust) {
            setSelectedBoost(boughtBooust)
        } else {
            setSelectedBoost(powerUp)
        }
        setIsModalOpen(true);
    };

    const closeDetailBoostScreen = () => {
        setSelectedBoost(null);
        setIsModalOpen(false);
    };

    const closeDetailTonScreen = () => {
        setSelectedTonItem(null);
        setIsModalOpen(false);
    };

    const buyCharacter = async (character) => {
        if (shopPriceCharacters[character.name].price < coins) {
            const newTotalCoins = coins - shopPriceCharacters[character.name].price
            setTotalCoins(webApp, newTotalCoins)
            const uncheckedCharacters = characters.map(skin => ({ ...skin, isChosen: false }))
            character.isBought = true
            character.isChosen = true
            const updatedSkins = [...uncheckedCharacters]
            updatedSkins.push(character)
            await axios.post('http://157.230.109.1:8888/api/v1/user/userScore', {
                coins: newTotalCoins,
              }, {
                headers: {
                  Authorization: `Bearer ${authJWT}`
                }
              })
            setUserData({ ...userData, coins: newTotalCoins, skins: updatedSkins });
            setCharacters(updatedSkins)
            setSkins(webApp, updatedSkins);
        }
        closeDetailScreen()
    }

    const choseCharacter = (character) => {
        const uncheckedCharacters = characters.map(skin => ({ ...skin, isChosen: false }))

        const updatedSkins = uncheckedCharacters.map(skin => {
            if (skin.name === character.name) {
                return { ...skin, isChosen: true };
            }
            return skin;
        });
        setCharacters(updatedSkins)
        setUserData({ ...userData, skins: updatedSkins });
        setSkins(webApp, updatedSkins)
        closeDetailScreen()
    }

    const buyBoost = async (boost) => {
        if (shopPrice[boost.name].price < coins) {
            const newTotalCoins = coins - shopPrice[boost.name].price
            setTotalCoins(webApp, newTotalCoins)
            const hasPowerUp = powerups.find(powerup => powerup.name === boost.name)
            let updatedBoosts

            if(hasPowerUp){
                updatedBoosts = powerups.map(powerup => {
                    if (powerup.name === boost.name) {
                        return { ...boost, amount: powerup.amount + 1 };
                    }
                    return powerup;
                })
            }else{
                updatedBoosts = [...powerups]
                updatedBoosts.push({"name": boost.name, "amount": 1})
            }
            await axios.post('http://157.230.109.1:8888/api/v1/user/userScore', {
                coins: newTotalCoins,
              }, {
                headers: {
                  Authorization: `Bearer ${authJWT}`
                }
              })
            setUserData({ ...userData, coins: newTotalCoins, boosts: updatedBoosts });
            setPowerups(updatedBoosts)
            setBoosts(webApp, updatedBoosts);
        }
        closeDetailBoostScreen()
    }

    const activateBoost = (boost) => {
        const updatedPowerups = powerups.map(powerup => {
            if (powerup.name === boost.name) {
                return { ...boost, amount: boost.amount - 1 };
            }
            return powerup;
        });
        setPowerups(updatedPowerups)
        setUserData({ ...userData, boosts: updatedPowerups });
        closeDetailBoostScreen()
    }

    const buyTonItem = (tonItem) => {
        console.log('tonitembuy', tonItem)
        webApp.showAlert(t('shop.tonShop.comeBackLater'))
        return
        // sender.send({
        //     to: Address.parse(tonRecipient),
        //     value: toNano(tonShopPrice[tonItem.name].price),
        //     body: comment(`Pay ${tonShopPrice[tonItem.name].price} for ${tonItem.name}`),
        //   });
        if (tonShopPrice[tonItem.name].price < coins) {
            const newTotalCoins = coins - tonShopPrice[tonItem.name].price
            setTotalCoins(webApp, newTotalCoins)
            const hasCoinBox = coinBox.find(box => box.name === tonItem.name)
            let updatedBoxes

            if(hasCoinBox){
                updatedBoxes = coinBox.map(box => {
                    if (box.name === tonItem.name) {
                        return { ...box, amount: box.amount + 1 };
                    }
                    return box;
                })
            }else{
                updatedBoxes = [...coinBox]
                updatedBoxes.push({"name": tonItem.name, "amount": 1})
            }
            setUserData({ ...userData, coins: newTotalCoins, coinBox: updatedBoxes });
            setCoinBox(updatedBoxes)
            setCoinBoxes(webApp, updatedBoxes);
        }
        closeDetailBoostScreen()
    }

    const activateTonItem = (tonItem) => {
        const updatedBoxes = coinBox.map(box => {
            if (box.name === tonItem.name) {
                return { ...box, amount: box.amount - 1, used: box.used + 1 };
            }
            return box;
        });
        setCoinBox(updatedBoxes)
        setUserData({ ...userData, coinBox: updatedBoxes });
        closeDetailTonScreen()
    }

    const tonShopPrice = {
        'coin box': {
            name: 'coin box',
            price: 1,
            emoji: '🪙',
            info: "shop.tonShop.box1.info",
            image: box1
        },
        'medium box': {
            name: 'medium box',
            price: 5,
            emoji: '💰',
            info: "shop.tonShop.box2.info",
            image: box2
        },
        'large box': {
            name: 'large box',
            price: 20,
            emoji: '🗃',
            info: "shop.tonShop.box3.info",
            image: box3
        },
    }

    const shopPrice = {
        wings: {
            name: 'wings',
            price: 100,
            emoji: '🦋',
            image: wingImg,
            info: "shop.powerups.wings.info"
        },
        rainbow: {
            name: 'rainbow',
            price: 200,
            emoji: '🌈',
            image: rainbowImg,
            info: "shop.powerups.rainbow.info"
        },
        special: {
            name: 'special',
            price: 300,
            emoji: '🪙',
            image: specialImg,
            info: "shop.powerups.special.info"
        },

    }
    
    const shopPriceCharacters = {
        runner: {
            name: 'runner',
            price: 0,
            emoji: '🏃',
            image: runner,
            info: "shop.characters.runner.info"
        },
        cok: {
            name: 'cok',
            price: 1000,
            emoji: '👽',
            image: cok,
            info: "shop.characters.cok.info"
        },
        gran: {
            name: 'gran',
            price: 10000,
            emoji: '👵',
            image: gran,
            info: "shop.characters.gran.info"
        },
        robot: {
            name: 'robot',
            price: 50000,
            emoji: '🤖',
            image: robot,
            info: "shop.characters.robot.info"
        },
        zai: {
            name: 'zai',
            price: 100000,
            emoji: '🐰',
            image: zai,
            info: "shop.characters.zai.info"
        },
        coolman: {
            name: 'coolman',
            price: 150000,
            emoji: '💪',
            image: coolman,
            info: "shop.characters.coolman.info"
        },
        trap: {
            name: 'trap',
            price: 200000,
            emoji: '😎',
            image: trap,
            info: "shop.characters.robot.info"
        }
    }

    return (
        <div>
            <div id='shop-container' >
                <h1 className={isModalOpen ? 'blur-effect' : ''}>
                {t('shop.title1')} <span> {coins} </span><img className='trcoin' src={trCoin} alt="Coin Logo" />
                    </h1>
                    <div id='tonShop-options'>
                        <div className={isModalOpen ? 'blur-effect' : ''}>
                        <div class="container">
                            <h2>{t('shop.tonShop.title')}</h2>
                            <TonConnectButton />
                        </div>
                            {coinBox ? (Object.values(tonShopPrice).map((item, index) => (
                                <button key={index} className="shop-btn" onClick={() => openDetailTONScreen(item)} >
                                    <div className="shop-btn-container">
                                        {item.emoji} {t(item.name)}
                                        <div>
                                            <div className="boost-amount">{coinBox.find(powerup => powerup.name === item.name)?.amount || 0} {t('shop.left')} </div>
                                            <div>{item.price}<img src={arrow} alt="Arrow" /></div>
                                        </div>
                                    </div>
                                </button>
                            ))) : <p>{t('shop.loading')}</p>}
                        </div>
                    </div>
                    <div id='shop-options'>
                    <div id='daily' className={isModalOpen ? 'blur-effect' : ''}>
                        <h2>{t('shop.powerups.title')}</h2>
                        {powerups ? (Object.values(shopPrice).map((item, index) => (
                            <button key={index+10} className="shop-btn" onClick={() => openDetailBoostScreen(item)} >
                                <div className="shop-btn-container">
                                    {item.emoji} {t(item.name)}
                                    <div>
                                        <div className="boost-amount">{powerups.find(powerup => powerup.name === item.name)?.amount || 0} {t('shop.left')} </div>
                                        <div>{item.price}<img src={arrow} alt="Arrow" /></div>
                                    </div>
                                </div>
                            </button>
                        ))) : <p>{t('shop.loading')}</p>}
                    </div>
                    <div id='challenge'>
                        <h2 className={isModalOpen ? 'blur-effect' : ''}>{t('shop.characters.title')}</h2>
                        {characters ? (Object.values(shopPriceCharacters).map((item, index) => (
                            <div className={isModalOpen ? 'blur-effect' : ''}>
                                <button
                                    key={index+20}
                                    onClick={() => openDetailScreen(item)}
                                    className={`shop-btn ${characters.find(char => char.name === item.name)?.isBought ? 'bought' : ''} ${characters.filter(char => char.name === item.name)[0]?.isChosen ? 'chosen' : ''}`}>
                                    <div className="shop-btn-container">
                                        {item.emoji} {t(item.name)}
                                        <div>{item.price}<img src={arrow} alt="Arrow" /></div>
                                    </div>
                                </button>
                            </div>
                        ))) : <></>}
                    </div>
                </div>
            </div>

            {/* Modal for Character or Boost Details */}
            <Modal isOpen={isModalOpen} close={selectedCharacter ? closeDetailScreen : selectedBoost ? closeDetailBoostScreen : closeDetailTonScreen}>
                {selectedTonItem && (
                    <div className="character-container">
                        <div className="character-image-container">
                            <img src={tonShopPrice[selectedTonItem.name].image} alt={selectedTonItem.name} />
                        </div>
                        <div className="character-info">
                            <p>{t(tonShopPrice[selectedTonItem.name].info)}</p>
                        </div>
                        <div className="character-action">
                            {selectedTonItem.amount > 0
                                ? (<div className="multiple-buttons">
                                    <button className="shop-btn" onClick={() => buyTonItem(selectedTonItem)}>
                                        {t('shop.buy')}
                                    </button>
                                    {(<button className="shop-btn" onClick={() => activateTonItem(selectedTonItem)}>
                                        {t('shop.activate')}
                                    </button>)
                                    }
                                </div>)
                                : (<button className="shop-btn" onClick={() => buyTonItem(selectedTonItem)}>
                                    {t('shop.buy')}
                                </button>)}
                        </div>
                    </div>
                )}
                {selectedCharacter && (
                    <div className="character-container">
                        <div className="character-image-container">
                            <img src={shopPriceCharacters[selectedCharacter.name].image} alt={selectedCharacter.name} />
                        </div>
                        <div className="character-info">
                            <p>{t(shopPriceCharacters[selectedCharacter.name].info)}</p>
                        </div>
                        <div className="character-action">
                            <button className="shop-btn" onClick={selectedCharacter.isBought ? () => choseCharacter(selectedCharacter) : () => buyCharacter(selectedCharacter)}>
                                {selectedCharacter.isBought ? `${t('shop.choose')}` : `${t('shop.buy')}`}
                            </button>
                        </div>
                    </div>
                )}
                {selectedBoost && (
                    <div className="character-container">
                        <div className="character-image-container">
                            <img src={shopPrice[selectedBoost.name].image} alt={selectedBoost.name} />
                        </div>
                        <div className="character-info">
                            <p>{t(shopPrice[selectedBoost.name].info)}</p>
                        </div>
                        <div className="character-action">
                            <button className="shop-btn" onClick={() => buyBoost(selectedBoost)}>
                                        {t('shop.buy')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Shop;
