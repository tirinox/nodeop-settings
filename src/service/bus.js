import Vue from "vue";

export const eventBus = new Vue()

export const EVENTS = {
    PRESENT_SAVE_RESULT: 'settings_save_result',
    ON_SETTINGS_LOADED: 'on_settings_loaded',
}