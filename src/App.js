import './App.css'
import { useCallback, useEffect } from "react"
import { useTelegram } from "./hooks/useTelegram"
import { Route, Routes, useNavigate, useLocation } from "react-router-dom"
import Main from "./components/Main/Main"
import UserPage from "./components/UserPage/UserPage"
import TotalCoins from "./components/TotalCoins/TotalCoins"
import Stats from "./components/Stats/Stats"
import Shop from "./components/Shop/Shop"
import ThreeJsGame from "./components/ThreeJSGame/ThreeJSGame"


function App() {
    const { webApp } = useTelegram()
    const navigate = useNavigate()
    const location = useLocation()


    const onBackClick = useCallback(() => {
        navigate(-1)
    }, [navigate])

    // const onMainClick = useCallback(() => {
    //     webApp.showAlert("Main button click")
    // }, [webApp])

    useEffect(() => {
        webApp.ready()
        webApp.expand()
        webApp.BackButton.onClick(onBackClick)
        webApp.MainButton.disable()
        if (location.pathname !== '/') {
            webApp.BackButton.show()
        } else {
            webApp.BackButton.hide()
        }
        return () => {
            webApp.BackButton.offClick(onBackClick)
        }
    })

    return (
        <>
            <Routes>
                <Route path='/' index element={<Main />} />
                <Route path='/game' element={<ThreeJsGame />} />
                <Route path='/user' element={<UserPage />} />
                <Route path='/total-coins' element={<TotalCoins />} />
                <Route path='/stats' element={<Stats />} />
                <Route path='/shop' element={<Shop />} />
            </Routes>
        </>
    )
}

export default App
