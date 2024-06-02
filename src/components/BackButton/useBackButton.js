// useBackButton.js
import { useNavigate, useLocation } from 'react-router-dom'

const useBackButton = (excludePath = '/') => {
    const navigate = useNavigate()
    const location = useLocation()
    const isExcludedPage = location.pathname === excludePath

    const navigateBack = () => {
        if (!isExcludedPage) {
            navigate(-1)
        }
    }

    return { isExcludedPage, navigateBack }
}

export default useBackButton
