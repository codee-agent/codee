import i18n from "i18next"
import { initReactI18next } from "react-i18next"
// import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from "./locales/en/translation.json"
import zhCNTranslation from "./locales/zh-CN/translation.json"

const resources = {
	en: {
		translation: enTranslation,
	},
	"zh-CN": {
		translation: zhCNTranslation,
	},
}

// 初始化 i18n
i18n.use(initReactI18next).init({
	resources,
	lng: "en", // 默认语言
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
})

export default i18n
