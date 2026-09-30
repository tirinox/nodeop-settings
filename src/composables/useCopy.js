import {onBeforeUnmount, ref} from 'vue'
import {copyToClipboard} from '@/service/utils'

// Copies text and exposes a `copied` flag that resets after `resetMs`
export function useCopy(resetMs = 2000) {
    const copied = ref(false)
    let timer = null

    async function copy(text) {
        if (await copyToClipboard(text)) {
            copied.value = true
            clearTimeout(timer)
            timer = setTimeout(() => {
                copied.value = false
            }, resetMs)
        }
    }

    onBeforeUnmount(() => clearTimeout(timer))

    return {copied, copy}
}
