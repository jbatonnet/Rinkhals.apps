/*
 * 1DS JS SDK POST plugin, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* TimeoutOverrideWrapper.ts
* @author  Nev Wylie (newylie)
* @copyright Microsoft 2022
* Simple internal timeout wrapper
*/
export function defaultSetTimeout(callback, ms) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return setTimeout(callback, ms, args);
}
export function defaultClearTimeout(timeoutId) {
    clearTimeout(timeoutId);
}
export function createTimeoutWrapper(argSetTimeout, argClearTimeout) {
    return {
        set: argSetTimeout || defaultSetTimeout,
        clear: argClearTimeout || defaultClearTimeout
    };
}