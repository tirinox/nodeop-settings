// Alert settings schema shared by the Alerts page and the API layer.
// Keys are the backend's setting names; values are the defaults shown in the UI.

export const MINUTE = 60
export const HOUR = 3600
export const DAY = 24 * HOUR

// Values the slash-points period slider snaps to (seconds)
export const STD_INTERVALS = [
    2 * MINUTE,
    5 * MINUTE,
    15 * MINUTE,
    30 * MINUTE,
    HOUR,
    2 * HOUR,
    6 * HOUR,
    12 * HOUR,
    DAY,
    3 * DAY,
]

export const ALERT_DEFAULTS = {
    'nop:pause_all:on': false,
    'nop:slash:on': true,
    'nop:slash:threshold': 100,
    'nop:slash:period': 2 * HOUR,
    'nop:new_v:on': true,
    'nop:version:on': true,
    'nop:offline:on': true,
    'nop:offline:interval': 2 * HOUR,
    'nop:churning:on': true,
    'nop:bond:on': true,
    'nop:height:on': true,
    'nop:height:interval': HOUR,
    'nop:ip:on': true,
    'gen:alerts': false,
}

// Reads a setting, coercing it to the type of its default value.
export function readSetting(settings, key) {
    const def = ALERT_DEFAULTS[key]
    const value = settings?.[key]
    if (value === undefined) {
        return def
    }
    return typeof def === 'boolean' ? Boolean(value) : Number(value)
}

export function withDefaults(settings) {
    return {...ALERT_DEFAULTS, ...settings}
}
