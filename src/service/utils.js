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

export function closestValue(goal, array) {
    if (!array) {
        return goal
    }
    return array.reduce(function (prev, curr) {
        return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });
}

export class SliderConverter {
    constructor(minValue, maxValue, polynomial, rounding) {
        this.polynomial = polynomial || 3.0
        this.minValue = minValue || 0
        this.maxValue = maxValue || 100
        this.rounding = Boolean(rounding)
    }

    stickTo(x, stickTo) {
        if (stickTo && Array.isArray(stickTo)) {
            return closestValue(x, stickTo)
        }
        return x
    }

    toInternal(x, stickTo) {
        x = this.stickTo(x, stickTo)
        let r = 10000.0 * Math.pow(
            ((Number(x) - this.minValue) / (this.maxValue - this.minValue)),
            1.0 / this.polynomial
        )
        r = this.rounding ? Math.round(r) : r
        return r
    }

    toExternal(x, stickTo) {
        let r = (this.maxValue - this.minValue) * Math.pow(Number(x) / 10000.0, this.polynomial) + this.minValue
        r = this.rounding ? Math.round(r) : r
        r = this.stickTo(r, stickTo)
        return r
    }
}

export function defaultBool(x, _default) {
    return x === undefined ? _default : Boolean(x)
}

export function defaultNumber(x, _default) {
    return x === undefined ? _default : Number(x)
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}