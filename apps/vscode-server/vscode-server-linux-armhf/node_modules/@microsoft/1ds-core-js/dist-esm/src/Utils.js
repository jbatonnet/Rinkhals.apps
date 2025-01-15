/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
var _a;
/**
* Utils.ts
* @author  Abhilash Panwar (abpanwar) Hector Hernandez (hectorh)
* @copyright Microsoft 2018
* File containing utility functions.
*/
import { addEventHandler, addPageUnloadEventListener, areCookiesSupported, arrForEach, arrIndexOf, arrMap, arrReduce, dateNow, generateW3CId, getDocument, getGlobalInst, getNavigator, getWindow, hasOwnProperty, isArray, isBeaconsSupported, isBoolean, isDate, isError, isFunction, isIE, isNullOrUndefined, isNumber, isObject, isReactNative, isString, isTypeof, isUndefined, mwcRandom32, mwcRandomSeed, newGuid, newId, objDefineAccessors, objForEachKey, objKeys, perfNow, random32, randomValue, safeGetCookieMgr, strEndsWith, strObject, strTrim, strUndefined, toISOString, uaDisallowsSameSiteNone, useXDomainRequest } from "@microsoft/applicationinsights-core-js";
import { ObjHasOwnProperty, objCreateFn, strShimObject, strShimPrototype } from "@microsoft/applicationinsights-shims";
import { STR_EMPTY } from "./InternalConstants";
export var Version = '3.2.13';
export var FullVersionString = "1DS-Web-JS-" + Version;
// Defining here so we don't need to take (import) the ApplicationInsights Common module
var strDisabledPropertyName = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
var strWithCredentials = "withCredentials";
var strTimeout = "timeout";
// If value is array just get the type for the first element
var _fieldTypeEventPropMap = (_a = {},
    _a[0 /* FieldValueSanitizerType.NotSet */] = 0 /* eEventPropertyType.Unspecified */,
    _a[2 /* FieldValueSanitizerType.Number */] = 6 /* eEventPropertyType.Double */,
    _a[1 /* FieldValueSanitizerType.String */] = 1 /* eEventPropertyType.String */,
    _a[3 /* FieldValueSanitizerType.Boolean */] = 7 /* eEventPropertyType.Bool */,
    _a[4096 /* FieldValueSanitizerType.Array */ | 2 /* FieldValueSanitizerType.Number */] = 6 /* eEventPropertyType.Double */,
    _a[4096 /* FieldValueSanitizerType.Array */ | 1 /* FieldValueSanitizerType.String */] = 1 /* eEventPropertyType.String */,
    _a[4096 /* FieldValueSanitizerType.Array */ | 3 /* FieldValueSanitizerType.Boolean */] = 7 /* eEventPropertyType.Bool */,
    _a);
/**
 * @ignore
 */
// let _uaDisallowsSameSiteNone = null;
var uInt8ArraySupported = null;
// var _areCookiesAvailable: boolean | undefined;
/**
 * Checks if document object is available
 */
export var isDocumentObjectAvailable = Boolean(getDocument());
/**
 * Checks if window object is available
 */
export var isWindowObjectAvailable = Boolean(getWindow());
/**
 * Checks if value is assigned to the given param.
 * @param value - The token from which the tenant id is to be extracted.
 * @returns True/false denoting if value is assigned to the param.
 */
export function isValueAssigned(value) {
    /// <summary> takes a value and checks for undefined, null and empty string </summary>
    /// <param type="any"> value to be tested </param>
    /// <returns> true if value is null undefined or emptyString </returns>
    return !(value === STR_EMPTY || isNullOrUndefined(value));
}
/**
 * Gets the tenant id from the tenant token.
 * @param apiKey - The token from which the tenant id is to be extracted.
 * @returns The tenant id.
 */
export function getTenantId(apiKey) {
    if (apiKey) {
        var indexTenantId = apiKey.indexOf("-");
        if (indexTenantId > -1) {
            return apiKey.substring(0, indexTenantId);
        }
    }
    return STR_EMPTY;
}
/**
 * Checks if Uint8Array are available in the current environment. Safari and Firefox along with
 * ReactNative are known to not support Uint8Array properly.
 * @returns True if available, false otherwise.
 */
export function isUint8ArrayAvailable() {
    if (uInt8ArraySupported === null) {
        uInt8ArraySupported = !isUndefined(Uint8Array) && !isSafariOrFirefox() && !isReactNative();
    }
    return uInt8ArraySupported;
}
/**
 * Checks if the value is a valid EventLatency.
 * @param value - The value that needs to be checked.
 * @returns True if the value is in AWTEventLatency, false otherwise.
 */
export function isLatency(value) {
    if (value && isNumber(value) && value >= 1 /* EventLatencyValue.Normal */ && value <= 4 /* EventLatencyValue.Immediate */) {
        return true;
    }
    return false;
}
/**
 * Sanitizes the Property. It checks the that the property name and value are valid. It also
 * checks/populates the correct type and pii of the property value.
 * @param name - property name                          - The property name.
 * @param property - The property value or an IEventProperty containing value,
 * type ,pii and customer content.
 * @returns IEventProperty containing valid name, value, pii and type or null if invalid.
 */
export function sanitizeProperty(name, property, stringifyObjects) {
    // Check that property is valid
    if ((!property && !isValueAssigned(property)) || typeof name !== "string") {
        return null;
    }
    // Perf optimization -- only need to get the type once not multiple times
    var propType = typeof property;
    // If the property isn't IEventProperty (and is either string, number, boolean or array), convert it into one.
    if (propType === "string" || propType === "number" || propType === "boolean" || isArray(property)) {
        property = { value: property };
    }
    else if (propType === "object" && !ObjHasOwnProperty.call(property, "value")) {
        property = { value: stringifyObjects ? JSON.stringify(property) : property };
    }
    else if (isNullOrUndefined(property.value)
        || property.value === STR_EMPTY || (!isString(property.value)
        && !isNumber(property.value) && !isBoolean(property.value)
        && !isArray(property.value))) {
        // Since property is IEventProperty, we need to validate its value
        return null;
    }
    // We need to check that if the property value is an array, it is valid
    if (isArray(property.value) &&
        !isArrayValid(property.value)) {
        return null;
    }
    // If either pii or cc is set convert value to string (since only string pii/cc is allowed).
    // If the value is a complex type like an array that can't be converted to string we will drop
    // the property.
    if (!isNullOrUndefined(property.kind)) {
        if (isArray(property.value) || !isValueKind(property.kind)) {
            return null;
        }
        property.value = property.value.toString();
    }
    return property;
}
export function getCommonSchemaMetaData(value, kind, type) {
    var encodedTypeValue = -1;
    if (!isUndefined(value)) {
        if (kind > 0) {
            if (kind === 32) {
                // encode customer content. Value can only be string. bit 13-16 are for cc
                encodedTypeValue = (1 << 13);
            }
            else if (kind <= 13) {
                // encode PII. Value can only be string. bits 5-12 are for Pii
                encodedTypeValue = (kind << 5);
            }
        }
        // isDataType checks that the "type" is a number so we don't need to check for undefined
        if (isDataType(type)) {
            // Data Type is provided and valid, so use that
            if (encodedTypeValue === -1) {
                // Don't return -1
                encodedTypeValue = 0;
            }
            encodedTypeValue |= type;
        }
        else {
            var propType = _fieldTypeEventPropMap[getFieldValueType(value)] || -1;
            if (encodedTypeValue !== -1 && propType !== -1) {
                // pii exists so we must return correct type
                encodedTypeValue |= propType;
            }
            else if (propType === 6 /* eEventPropertyType.Double */) {
                encodedTypeValue = propType;
            }
        }
    }
    return encodedTypeValue;
}
/**
 * @deprecated - Use the core.getCookieMgr().disable()
 * Force the SDK not to store and read any data from cookies.
 * Overriding the applicationinsights-core version for tree-shaking
 */
export function disableCookies() {
    safeGetCookieMgr(null).setEnabled(false);
}
/**
 * @deprecated - Use the oneDs.getCookieMgr().set()
 * Sets the value of a cookie.
 * @param name - Cookie name.
 * @param value - Cookie value.
 * @param days - Expiration days.
 */
export function setCookie(name, value, days) {
    if (areCookiesSupported(null)) {
        safeGetCookieMgr(null).set(name, value, days * 86400, null, "/");
    }
}
/**
 * @deprecated - Use the oneDs.getCookieMgr().del()
 * Deletes a cookie, by setting its expiration to -1.
 * @param name - Cookie name to delete.
 */
export function deleteCookie(name) {
    if (areCookiesSupported(null)) {
        safeGetCookieMgr(null).del(name);
    }
}
/**
 * @deprecated - Use the oneDs.getCookieMgr().get()
 * Gets the cookie value for the specified cookie.
 * if value is k1=v1&k2==v2 then will return 'v1' for key 'k1'
 * @param cookieName - Cookie name.
 */
export function getCookie(name) {
    if (areCookiesSupported(null)) {
        return getCookieValue(safeGetCookieMgr(null), name);
    }
    return STR_EMPTY;
}
/**
 * Helper to get and decode the cookie value using decodeURIComponent, this is for historical
 * backward compatibility where the document.cookie value was decoded before parsing.
 * @param cookieMgr - The cookie manager to use
 * @param name - The name of the cookie to get
 * @param decode - A flag to indicate whether the cookie value should be decoded
 * @returns The decoded cookie value (if available) otherwise an empty string.
 */
export function getCookieValue(cookieMgr, name, decode) {
    if (decode === void 0) { decode = true; }
    var cookieValue;
    if (cookieMgr) {
        cookieValue = cookieMgr.get(name);
        if (decode && cookieValue && decodeURIComponent) {
            cookieValue = decodeURIComponent(cookieValue);
        }
    }
    return cookieValue || STR_EMPTY;
}
/**
 * Create a new guid.
 * @param style - The style of guid to generated, defaults to Digits
 * Digits (Default) : 32 digits separated by hyphens: 00000000-0000-0000-0000-000000000000
 * Braces - 32 digits separated by hyphens, enclosed in braces: {00000000-0000-0000-0000-000000000000}
 * Parentheses - 32 digits separated by hyphens, enclosed in parentheses: (00000000-0000-0000-0000-000000000000)
 * Numeric - 32 digits: 00000000000000000000000000000000
 * @returns The formatted guid.
 */
export function createGuid(style) {
    if (style === void 0) { style = "D" /* GuidStyle.Digits */; }
    var theGuid = newGuid();
    if (style === "B" /* GuidStyle.Braces */) {
        theGuid = "{" + theGuid + "}";
    }
    else if (style === "P" /* GuidStyle.Parentheses */) {
        theGuid = "(" + theGuid + ")";
    }
    else if (style === "N" /* GuidStyle.Numeric */) {
        theGuid = theGuid.replace(/-/g, STR_EMPTY);
    }
    return theGuid;
}
/**
 * Pass in the objects to merge as arguments.
 * @param obj1 - object to merge.  Set this argument to 'true' for a deep extend.
 * @param obj2 - object to merge.
 * @param obj3 - object to merge.
 * @param obj4 - object to merge.
 * @param obj5 - object to merge.
 * @returns The extended object.
 */
export function extend(obj, obj2, obj3, obj4, obj5) {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;
    var length = arguments.length;
    var objProto = Object[strShimPrototype];
    var theArgs = arguments;
    // Check if a deep merge
    if (objProto.toString.call(theArgs[0]) === "[object Boolean]") {
        deep = theArgs[0];
        i++;
    }
    // Loop through each object and conduct a merge
    for (; i < length; i++) {
        var obj = theArgs[i];
        objForEachKey(obj, function (prop, value) {
            // If deep merge and property is an object, merge properties
            if (deep && value && isObject(value)) {
                if (isArray(value)) {
                    extended[prop] = extended[prop] || [];
                    arrForEach(value, function (arrayValue, arrayIndex) {
                        if (arrayValue && isObject(arrayValue)) {
                            extended[prop][arrayIndex] = extend(true, extended[prop][arrayIndex], arrayValue);
                        }
                        else {
                            extended[prop][arrayIndex] = arrayValue;
                        }
                    });
                }
                else {
                    extended[prop] = extend(true, extended[prop], value);
                }
            }
            else {
                extended[prop] = value;
            }
        });
    }
    return extended;
}
export var getTime = perfNow;
export function isValueKind(value) {
    // Always assume that it's a number (no type checking) for performance as this is used during the JSON serialization
    if (value === 0 /* eValueKind.NotSet */ || ((value > 0 /* eValueKind.NotSet */ && value <= 13 /* eValueKind.Pii_IPV4AddressLegacy */) || value === 32 /* eValueKind.CustomerContent_GenericContent */)) {
        return true;
    }
    return false;
}
function isDataType(value) {
    // Remark: 0 returns false, but it doesn't affect encoding anyways
    // Always assume that it's a number (no type checking) for performance as this is used during the JSON serialization
    if (value >= 0 && value <= 9) {
        return true;
    }
    return false;
}
function isSafariOrFirefox() {
    var nav = getNavigator();
    // If non-browser navigator will be undefined
    if (!isUndefined(nav) && nav.userAgent) {
        var ua = nav.userAgent.toLowerCase();
        if ((ua.indexOf("safari") >= 0 || ua.indexOf("firefox") >= 0) && ua.indexOf("chrome") < 0) {
            return true;
        }
    }
    return false;
}
export function isArrayValid(value) {
    return value.length > 0;
}
export function setProcessTelemetryTimings(event, identifier) {
    var evt = event;
    evt.timings = evt.timings || {};
    evt.timings.processTelemetryStart = evt.timings.processTelemetryStart || {};
    evt.timings.processTelemetryStart[identifier] = getTime();
}
/**
 * Returns a bitwise value for the FieldValueSanitizerType enum representing the decoded type of the passed value
 * @param value The value to determine the type
 */
export function getFieldValueType(value) {
    var theType = 0 /* FieldValueSanitizerType.NotSet */;
    if (value !== null && value !== undefined) {
        var objType = typeof value;
        if (objType === "string") {
            theType = 1 /* FieldValueSanitizerType.String */;
        }
        else if (objType === "number") {
            theType = 2 /* FieldValueSanitizerType.Number */;
        }
        else if (objType === "boolean") {
            theType = 3 /* FieldValueSanitizerType.Boolean */;
        }
        else if (objType === strShimObject) {
            theType = 4 /* FieldValueSanitizerType.Object */;
            if (isArray(value)) {
                theType = 4096 /* FieldValueSanitizerType.Array */;
                if (value.length > 0) {
                    // Empty arrays are not supported and are considered to be the same as null
                    theType |= getFieldValueType(value[0]);
                }
            }
            else if (ObjHasOwnProperty.call(value, "value")) {
                // Looks like an IEventProperty
                theType = 8192 /* FieldValueSanitizerType.EventProperty */ | getFieldValueType(value.value);
            }
        }
    }
    return theType;
}
export var Utils = {
    Version: Version,
    FullVersionString: FullVersionString,
    strUndefined: strUndefined,
    strObject: strObject,
    Undefined: strUndefined,
    arrForEach: arrForEach,
    arrIndexOf: arrIndexOf,
    arrMap: arrMap,
    arrReduce: arrReduce,
    objKeys: objKeys,
    toISOString: toISOString,
    isReactNative: isReactNative,
    isString: isString,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isArray: isArray,
    isObject: isObject,
    strTrim: strTrim,
    isDocumentObjectAvailable: isDocumentObjectAvailable,
    isWindowObjectAvailable: isWindowObjectAvailable,
    isValueAssigned: isValueAssigned,
    getTenantId: getTenantId,
    isBeaconsSupported: isBeaconsSupported,
    isUint8ArrayAvailable: isUint8ArrayAvailable,
    isLatency: isLatency,
    sanitizeProperty: sanitizeProperty,
    getISOString: toISOString,
    useXDomainRequest: useXDomainRequest,
    getCommonSchemaMetaData: getCommonSchemaMetaData,
    cookieAvailable: areCookiesSupported,
    disallowsSameSiteNone: uaDisallowsSameSiteNone,
    setCookie: setCookie,
    deleteCookie: deleteCookie,
    getCookie: getCookie,
    createGuid: createGuid,
    extend: extend,
    getTime: getTime,
    isValueKind: isValueKind,
    isArrayValid: isArrayValid,
    objDefineAccessors: objDefineAccessors,
    addPageUnloadEventListener: addPageUnloadEventListener,
    setProcessTelemetryTimings: setProcessTelemetryTimings,
    addEventHandler: addEventHandler,
    getFieldValueType: getFieldValueType,
    strEndsWith: strEndsWith,
    objForEachKey: objForEachKey
};
/**
 * Provides a collection of utility functions, included for backward compatibility with previous releases.
 * @deprecated Marking this instance as deprecated in favor of direct usage of the helper functions
 * as direct usage provides better tree-shaking and minification by avoiding the inclusion of the unused items
 * in your resulting code.
 * Overriding the applicationinsights-core version for tree-shaking
 */
export var CoreUtils = {
    _canUseCookies: undefined,
    isTypeof: isTypeof,
    isUndefined: isUndefined,
    isNullOrUndefined: isNullOrUndefined,
    hasOwnProperty: hasOwnProperty,
    isFunction: isFunction,
    isObject: isObject,
    isDate: isDate,
    isArray: isArray,
    isError: isError,
    isString: isString,
    isNumber: isNumber,
    isBoolean: isBoolean,
    toISOString: toISOString,
    arrForEach: arrForEach,
    arrIndexOf: arrIndexOf,
    arrMap: arrMap,
    arrReduce: arrReduce,
    strTrim: strTrim,
    objCreate: objCreateFn,
    objKeys: objKeys,
    objDefineAccessors: objDefineAccessors,
    addEventHandler: addEventHandler,
    dateNow: dateNow,
    isIE: isIE,
    disableCookies: disableCookies,
    newGuid: newGuid,
    perfNow: perfNow,
    newId: newId,
    randomValue: randomValue,
    random32: random32,
    mwcRandomSeed: mwcRandomSeed,
    mwcRandom32: mwcRandom32,
    generateW3CId: generateW3CId
};
/**
 * Helper to identify whether we are running in a chromium based browser environment
 */
export function isChromium() {
    return !!getGlobalInst("chrome");
}
/**
 * Create and open an XMLHttpRequest object
 * @param method - The request method
 * @param urlString - The url
 * @param withCredentials - Option flag indicating that credentials should be sent
 * @param disabled - Optional flag indicating that the XHR object should be marked as disabled and not tracked (default is false)
 * @param isSync - Optional flag indicating if the instance should be a synchronous request (defaults to false)
 * @param timeout - Optional value identifying the timeout value that should be assigned to the XHR request
 * @returns A new opened XHR request
 */
export function openXhr(method, urlString, withCredentials, disabled, isSync, timeout) {
    if (disabled === void 0) { disabled = false; }
    if (isSync === void 0) { isSync = false; }
    function _wrapSetXhrProp(xhr, prop, value) {
        try {
            xhr[prop] = value;
        }
        catch (e) {
            // - Wrapping as depending on the environment setting the property may fail (non-terminally)
        }
    }
    var xhr = new XMLHttpRequest();
    if (disabled) {
        // Tag the instance so it's not tracked (trackDependency)
        // If the environment has locked down the XMLHttpRequest (preventExtensions and/or freeze), this would
        // cause the request to fail and we no telemetry would be sent
        _wrapSetXhrProp(xhr, strDisabledPropertyName, disabled);
    }
    if (withCredentials) {
        // Some libraries require that the withCredentials flag is set "before" open and
        // - Wrapping as IE 10 has started throwing when setting before open
        _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
    }
    xhr.open(method, urlString, !isSync);
    if (withCredentials) {
        // withCredentials should be set AFTER open (https://xhr.spec.whatwg.org/#the-withcredentials-attribute)
        // And older firefox instances from 11+ will throw for sync events (current versions don't) which happens during unload processing
        _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
    }
    // Only set the timeout for asynchronous requests as
    // "Timeout shouldn't be used for synchronous XMLHttpRequests requests used in a document environment or it will throw an InvalidAccessError exception.""
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout
    if (!isSync && timeout) {
        _wrapSetXhrProp(xhr, strTimeout, timeout);
    }
    return xhr;
}