export function simpleClone(data) {
    return JSON.parse(JSON.stringify(data))
}

export function secondsToConvenientString(t) {
    t = Math.round(t)
    const seconds = t % 60
    const minutes = Math.floor(t / 60) % 60
    const hours = Math.floor(t / 3600) % 24
    const days = Math.floor(t / 86400)
    let out = ''
    if (days > 0) {
        out += `${days} day`
    }
    if (hours > 0) {
        out += ` ${hours} hours`
    }
    if (minutes > 0) {
        out += ` ${minutes} min`
    }
    if (seconds > 0) {
        out += ` ${seconds} sec`
    }
    return out
}

export class SliderConverter {
    constructor(minValue, maxValue, polynomial, rounding) {
        this.polynomial = polynomial || 3.0
        this.minValue = minValue || 0
        this.maxValue = maxValue || 100
        this.rounding = Boolean(rounding)
    }

    toInternal(x) {
        const r = 10000.0 * Math.pow(
            ((Number(x) - this.minValue) / (this.maxValue - this.minValue)),
            1.0 / this.polynomial
        )
        return this.rounding ? Math.round(r) : r
    }

    toExternal(x) {
        const r = (this.maxValue - this.minValue) * Math.pow(Number(x) / 10000.0, this.polynomial) + this.minValue
        return this.rounding ? Math.round(r) : r
    }
}

export function defaultBool(x, _default) {
    return x === undefined ? _default : Boolean(x)
}

export function defaultNumber(x, _default) {
    return x === undefined ? _default : Number(x)
}
