import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from "./context/UserContext"
import common_ru from "./translations/ru/common.json";
import common_en from "./translations/en/common.json";
import common_es from "./translations/es/common.json";
import common_tr from "./translations/tr/common.json";
import common_ar from "./translations/ar/common.json";
import common_fr from "./translations/fr/common.json";
import common_hi from "./translations/hi/common.json";
import common_id from "./translations/id/common.json";
import common_it from "./translations/it/common.json";
import common_kk from "./translations/kk/common.json";
import common_ms from "./translations/ms/common.json";
import common_pt from "./translations/pt/common.json";
import common_tl from "./translations/tl/common.json";
import common_uk from "./translations/uk/common.json";
import common_vi from "./translations/vi/common.json";
import common_de from "./translations/de/common.json";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { TonConnectUIProvider } from "@tonconnect/ui-react"


i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'en',                              // language to use
  fallbackLng: 'en',
  resources: {
    en: {
      common: common_en               // 'common' is our custom namespace
    },
    ru: {
      common: common_ru
    },
    es: {
      common: common_es
    },
    tr: {
      common: common_tr
    },
    ar: {
      common: common_ar
    },
    de: {
      common: common_de
    },
    fr: {
      common: common_fr
    },
    hi: {
      common: common_hi
    },
    id: {
      common: common_id
    },
    it: {
      common: common_it
    },
    kk: {
      common: common_kk
    },
    ms: {
      common: common_ms
    },
    pt: {
      common: common_pt
    },
    tl: {
      common: common_tl
    },
    uk: {
      common: common_uk
    },
    vi: {
      common: common_vi
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <I18nextProvider i18n={i18next}>
        <TonConnectUIProvider manifestUrl="https://3928-2a00-1028-8387-2156-6ddb-47e9-498b-79a4.ngrok-free.app/tonconnect-manifest.json"> 
          <App />
          </TonConnectUIProvider>
        </I18nextProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)
