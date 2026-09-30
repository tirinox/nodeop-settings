export function simpleClone(data) {
    return JSON.parse(JSON.stringify(data))
}

export function secondsToConvenientString(t) {
    t = Math.round(Number(t) || 0)
    const seconds = t % 60
    const minutes = Math.floor(t / 60) % 60
    const hours = Math.floor(t / 3600) % 24
    const days = Math.floor(t / 86400)
    const parts = []
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`)
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
    }
    if (minutes > 0) {
        parts.push(`${minutes} min`)
    }
    if (seconds > 0) {
        parts.push(`${seconds} sec`)
    }
    return parts.join(' ') || '0 sec'
}

export function closestValue(goal, array) {
    if (!array || !array.length) {
        return goal
    }
    return array.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev))
}

// Maps an external value range onto a 0..10000 slider with a polynomial curve,
// so that small values get more slider resolution.
export class SliderConverter {
    static RANGE = 10000

    constructor(minValue = 0, maxValue = 100, polynomial = 3.0, rounding = false) {
        this.polynomial = polynomial
        this.minValue = minValue
        this.maxValue = maxValue
        this.rounding = Boolean(rounding)
    }

    stickTo(x, stickTo) {
        return Array.isArray(stickTo) ? closestValue(x, stickTo) : x
    }

    toInternal(x, stickTo) {
        x = this.stickTo(x, stickTo)
        const normalized = Math.min(1, Math.max(0, (Number(x) - this.minValue) / (this.maxValue - this.minValue)))
        const r = SliderConverter.RANGE * Math.pow(normalized, 1.0 / this.polynomial)
        return this.rounding ? Math.round(r) : r
    }

    toExternal(x, stickTo) {
        let r = (this.maxValue - this.minValue) * Math.pow(Number(x) / SliderConverter.RANGE, this.polynomial) + this.minValue
        r = this.rounding ? Math.round(r) : r
        return this.stickTo(r, stickTo)
    }
}

export function capitalizeFirstLetter(string) {
    string = String(string ?? '')
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (e) {
        console.warn('Clipboard is not available', e)
        return false
    }
}
