import {reactive} from 'vue'

// Global snackbar state, rendered once in App.vue
export const toast = reactive({
    visible: false,
    text: '',
    color: 'success',
})

export function notify(text, color = 'success') {
    Object.assign(toast, {visible: true, text, color})
}

export function notifySaveResult(ok, successText) {
    if (ok) {
        notify(successText, 'success')
    } else {
        notify('Error saving the settings. Check your connection.', 'error')
    }
}
