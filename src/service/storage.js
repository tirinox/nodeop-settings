// Tiny localStorage wrapper, format-compatible with the former `vue-ls` plugin
// (key prefix "vuejs__", value stored as JSON {value, expire}),
// so tokens and preferences saved by older builds keep working.

const NAMESPACE = 'vuejs__'

function backend() {
    try {
        return window.localStorage
    } catch {
        return null  // storage disabled (private mode, blocked site data)
    }
}

export function lsGet(name, defaultValue = null) {
    try {
        const raw = backend()?.getItem(NAMESPACE + name)
        if (raw === null || raw === undefined) {
            return defaultValue
        }
        const {value, expire} = JSON.parse(raw)
        if (expire !== null && expire !== undefined && expire < Date.now()) {
            lsRemove(name)
            return defaultValue
        }
        return value
    } catch {
        return defaultValue
    }
}

export function lsSet(name, value) {
    try {
        backend()?.setItem(NAMESPACE + name, JSON.stringify({value, expire: null}))
    } catch {
        // ignore quota / access errors
    }
}

export function lsRemove(name) {
    try {
        backend()?.removeItem(NAMESPACE + name)
    } catch {
        // ignore
    }
}
