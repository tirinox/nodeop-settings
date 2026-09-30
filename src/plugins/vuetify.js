import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import {lsGet} from '@/service/storage'

export const LS_THEME_KEY = 'themeIsDark'

// Explicit user choice wins; otherwise follow the OS preference
function initialTheme() {
    const isDark = lsGet(LS_THEME_KEY, null)
    if (isDark === null) {
        return 'system'
    }
    return isDark ? 'dark' : 'light'
}

export default createVuetify({
    theme: {
        defaultTheme: initialTheme(),
        themes: {
            light: {
                colors: {
                    primary: '#00a38d',
                    secondary: '#5c6bc0',
                },
            },
            dark: {
                colors: {
                    primary: '#23dcc8',
                    secondary: '#9fa8da',
                },
            },
        },
    },
    defaults: {
        VSwitch: {
            color: 'primary',
            inset: true,
            hideDetails: true,
        },
        VSlider: {
            color: 'primary',
            hideDetails: true,
        },
    },
})
