/*!
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@microsoft/applicationinsights-shims'), require('@microsoft/applicationinsights-core-js'), require('@microsoft/dynamicproto-js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@microsoft/applicationinsights-shims', '@microsoft/applicationinsights-core-js', '@microsoft/dynamicproto-js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.oneDS = global.oneDS || {}, global.applicationinsightsShims, global.applicationinsightsCoreJs, global.dynamicProto));
})(this, (function (exports, applicationinsightsShims, applicationinsightsCoreJs, dynamicProto) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

    var dynamicProto__default = /*#__PURE__*/_interopDefaultLegacy(dynamicProto);

    var ValueKind = applicationinsightsCoreJs.createEnumStyle({
        NotSet: 0 ,
        Pii_DistinguishedName: 1 ,
        Pii_GenericData: 2 ,
        Pii_IPV4Address: 3 ,
        Pii_IPv6Address: 4 ,
        Pii_MailSubject: 5 ,
        Pii_PhoneNumber: 6 ,
        Pii_QueryString: 7 ,
        Pii_SipAddress: 8 ,
        Pii_SmtpAddress: 9 ,
        Pii_Identity: 10 ,
        Pii_Uri: 11 ,
        Pii_Fqdn: 12 ,
        Pii_IPV4AddressLegacy: 13 ,
        CustomerContent_GenericContent: 32
    });
    var EventLatency = applicationinsightsCoreJs.createEnumStyle({
        Normal: 1 ,
        CostDeferred: 2 ,
        RealTime: 3 ,
        Immediate: 4
    });
    var EventPropertyType = applicationinsightsCoreJs.createEnumStyle({
        Unspecified: 0 ,
        String: 1 ,
        Int32: 2 ,
        UInt32: 3 ,
        Int64: 4 ,
        UInt64: 5 ,
        Double: 6 ,
        Bool: 7 ,
        Guid: 8 ,
        DateTime: 9
    });
    var EventPersistence = applicationinsightsCoreJs.createEnumStyle({
        Normal: 1 ,
        Critical: 2
    });
    var TraceLevel = applicationinsightsCoreJs.createEnumStyle({
        NONE: 0 ,
        ERROR: 1 ,
        WARNING: 2 ,
        INFORMATION: 3
    });
    var _ExtendedInternalMessageId = applicationinsightsCoreJs.objFreeze(applicationinsightsShims.__assignFn(applicationinsightsShims.__assignFn({}, applicationinsightsCoreJs._InternalMessageId), applicationinsightsCoreJs.createEnumStyle({
        AuthHandShakeError: 501 ,
        AuthRedirectFail: 502 ,
        BrowserCannotReadLocalStorage: 503 ,
        BrowserCannotWriteLocalStorage: 504 ,
        BrowserDoesNotSupportLocalStorage: 505 ,
        CannotParseBiBlobValue: 506 ,
        CannotParseDataAttribute: 507 ,
        CVPluginNotAvailable: 508 ,
        DroppedEvent: 509 ,
        ErrorParsingAISessionCookie: 510 ,
        ErrorProvidedChannels: 511 ,
        FailedToGetCookies: 512 ,
        FailedToInitializeCorrelationVector: 513 ,
        FailedToInitializeSDK: 514 ,
        InvalidContentBlob: 515 ,
        InvalidCorrelationValue: 516 ,
        SessionRenewalDateIsZero: 517 ,
        SendPostOnCompleteFailure: 518 ,
        PostResponseHandler: 519 ,
        SDKNotInitialized: 520
    })));

    var STR_EMPTY = "";
    var STR_DEFAULT_ENDPOINT_URL = "https://browser.events.data.microsoft.com/OneCollector/1.0/";
    var STR_VERSION = "version";
    var STR_PROPERTIES = "properties";

    var _a;
    var Version = '3.2.13';
    var FullVersionString = "1DS-Web-JS-" + Version;
    var strDisabledPropertyName = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
    var strWithCredentials = "withCredentials";
    var strTimeout = "timeout";
    var _fieldTypeEventPropMap = (_a = {},
        _a[0 ] = 0 ,
        _a[2 ] = 6 ,
        _a[1 ] = 1 ,
        _a[3 ] = 7 ,
        _a[4096  | 2 ] = 6 ,
        _a[4096  | 1 ] = 1 ,
        _a[4096  | 3 ] = 7 ,
        _a);
    var uInt8ArraySupported = null;
    var isDocumentObjectAvailable = Boolean(applicationinsightsCoreJs.getDocument());
    var isWindowObjectAvailable = Boolean(applicationinsightsCoreJs.getWindow());
    function isValueAssigned(value) {
        return !(value === STR_EMPTY || applicationinsightsCoreJs.isNullOrUndefined(value));
    }
    function getTenantId(apiKey) {
        if (apiKey) {
            var indexTenantId = apiKey.indexOf("-");
            if (indexTenantId > -1) {
                return apiKey.substring(0, indexTenantId);
            }
        }
        return STR_EMPTY;
    }
    function isUint8ArrayAvailable() {
        if (uInt8ArraySupported === null) {
            uInt8ArraySupported = !applicationinsightsCoreJs.isUndefined(Uint8Array) && !isSafariOrFirefox() && !applicationinsightsCoreJs.isReactNative();
        }
        return uInt8ArraySupported;
    }
    function isLatency(value) {
        if (value && applicationinsightsCoreJs.isNumber(value) && value >= 1  && value <= 4 ) {
            return true;
        }
        return false;
    }
    function sanitizeProperty(name, property, stringifyObjects) {
        if ((!property && !isValueAssigned(property)) || typeof name !== "string") {
            return null;
        }
        var propType = typeof property;
        if (propType === "string" || propType === "number" || propType === "boolean" || applicationinsightsCoreJs.isArray(property)) {
            property = { value: property };
        }
        else if (propType === "object" && !applicationinsightsShims.ObjHasOwnProperty.call(property, "value")) {
            property = { value: stringifyObjects ? JSON.stringify(property) : property };
        }
        else if (applicationinsightsCoreJs.isNullOrUndefined(property.value)
            || property.value === STR_EMPTY || (!applicationinsightsCoreJs.isString(property.value)
            && !applicationinsightsCoreJs.isNumber(property.value) && !applicationinsightsCoreJs.isBoolean(property.value)
            && !applicationinsightsCoreJs.isArray(property.value))) {
            return null;
        }
        if (applicationinsightsCoreJs.isArray(property.value) &&
            !isArrayValid(property.value)) {
            return null;
        }
        if (!applicationinsightsCoreJs.isNullOrUndefined(property.kind)) {
            if (applicationinsightsCoreJs.isArray(property.value) || !isValueKind(property.kind)) {
                return null;
            }
            property.value = property.value.toString();
        }
        return property;
    }
    function getCommonSchemaMetaData(value, kind, type) {
        var encodedTypeValue = -1;
        if (!applicationinsightsCoreJs.isUndefined(value)) {
            if (kind > 0) {
                if (kind === 32) {
                    encodedTypeValue = (1 << 13);
                }
                else if (kind <= 13) {
                    encodedTypeValue = (kind << 5);
                }
            }
            if (isDataType(type)) {
                if (encodedTypeValue === -1) {
                    encodedTypeValue = 0;
                }
                encodedTypeValue |= type;
            }
            else {
                var propType = _fieldTypeEventPropMap[getFieldValueType(value)] || -1;
                if (encodedTypeValue !== -1 && propType !== -1) {
                    encodedTypeValue |= propType;
                }
                else if (propType === 6 ) {
                    encodedTypeValue = propType;
                }
            }
        }
        return encodedTypeValue;
    }
    function disableCookies() {
        applicationinsightsCoreJs.safeGetCookieMgr(null).setEnabled(false);
    }
    function setCookie(name, value, days) {
        if (applicationinsightsCoreJs.areCookiesSupported(null)) {
            applicationinsightsCoreJs.safeGetCookieMgr(null).set(name, value, days * 86400, null, "/");
        }
    }
    function deleteCookie(name) {
        if (applicationinsightsCoreJs.areCookiesSupported(null)) {
            applicationinsightsCoreJs.safeGetCookieMgr(null).del(name);
        }
    }
    function getCookie(name) {
        if (applicationinsightsCoreJs.areCookiesSupported(null)) {
            return getCookieValue(applicationinsightsCoreJs.safeGetCookieMgr(null), name);
        }
        return STR_EMPTY;
    }
    function getCookieValue(cookieMgr, name, decode) {
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
    function createGuid(style) {
        if (style === void 0) { style = "D" ; }
        var theGuid = applicationinsightsCoreJs.newGuid();
        if (style === "B" ) {
            theGuid = "{" + theGuid + "}";
        }
        else if (style === "P" ) {
            theGuid = "(" + theGuid + ")";
        }
        else if (style === "N" ) {
            theGuid = theGuid.replace(/-/g, STR_EMPTY);
        }
        return theGuid;
    }
    function extend(obj, obj2, obj3, obj4, obj5) {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
        var objProto = Object[applicationinsightsShims.strShimPrototype];
        var theArgs = arguments;
        if (objProto.toString.call(theArgs[0]) === "[object Boolean]") {
            deep = theArgs[0];
            i++;
        }
        for (; i < length; i++) {
            var obj = theArgs[i];
            applicationinsightsCoreJs.objForEachKey(obj, function (prop, value) {
                if (deep && value && applicationinsightsCoreJs.isObject(value)) {
                    if (applicationinsightsCoreJs.isArray(value)) {
                        extended[prop] = extended[prop] || [];
                        applicationinsightsCoreJs.arrForEach(value, function (arrayValue, arrayIndex) {
                            if (arrayValue && applicationinsightsCoreJs.isObject(arrayValue)) {
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
    var getTime = applicationinsightsCoreJs.perfNow;
    function isValueKind(value) {
        if (value === 0  || ((value > 0  && value <= 13 ) || value === 32 )) {
            return true;
        }
        return false;
    }
    function isDataType(value) {
        if (value >= 0 && value <= 9) {
            return true;
        }
        return false;
    }
    function isSafariOrFirefox() {
        var nav = applicationinsightsCoreJs.getNavigator();
        if (!applicationinsightsCoreJs.isUndefined(nav) && nav.userAgent) {
            var ua = nav.userAgent.toLowerCase();
            if ((ua.indexOf("safari") >= 0 || ua.indexOf("firefox") >= 0) && ua.indexOf("chrome") < 0) {
                return true;
            }
        }
        return false;
    }
    function isArrayValid(value) {
        return value.length > 0;
    }
    function setProcessTelemetryTimings(event, identifier) {
        var evt = event;
        evt.timings = evt.timings || {};
        evt.timings.processTelemetryStart = evt.timings.processTelemetryStart || {};
        evt.timings.processTelemetryStart[identifier] = getTime();
    }
    function getFieldValueType(value) {
        var theType = 0 ;
        if (value !== null && value !== undefined) {
            var objType = typeof value;
            if (objType === "string") {
                theType = 1 ;
            }
            else if (objType === "number") {
                theType = 2 ;
            }
            else if (objType === "boolean") {
                theType = 3 ;
            }
            else if (objType === applicationinsightsShims.strShimObject) {
                theType = 4 ;
                if (applicationinsightsCoreJs.isArray(value)) {
                    theType = 4096 ;
                    if (value.length > 0) {
                        theType |= getFieldValueType(value[0]);
                    }
                }
                else if (applicationinsightsShims.ObjHasOwnProperty.call(value, "value")) {
                    theType = 8192  | getFieldValueType(value.value);
                }
            }
        }
        return theType;
    }
    var Utils = {
        Version: Version,
        FullVersionString: FullVersionString,
        strUndefined: applicationinsightsCoreJs.strUndefined,
        strObject: applicationinsightsCoreJs.strObject,
        Undefined: applicationinsightsCoreJs.strUndefined,
        arrForEach: applicationinsightsCoreJs.arrForEach,
        arrIndexOf: applicationinsightsCoreJs.arrIndexOf,
        arrMap: applicationinsightsCoreJs.arrMap,
        arrReduce: applicationinsightsCoreJs.arrReduce,
        objKeys: applicationinsightsCoreJs.objKeys,
        toISOString: applicationinsightsCoreJs.toISOString,
        isReactNative: applicationinsightsCoreJs.isReactNative,
        isString: applicationinsightsCoreJs.isString,
        isNumber: applicationinsightsCoreJs.isNumber,
        isBoolean: applicationinsightsCoreJs.isBoolean,
        isFunction: applicationinsightsCoreJs.isFunction,
        isArray: applicationinsightsCoreJs.isArray,
        isObject: applicationinsightsCoreJs.isObject,
        strTrim: applicationinsightsCoreJs.strTrim,
        isDocumentObjectAvailable: isDocumentObjectAvailable,
        isWindowObjectAvailable: isWindowObjectAvailable,
        isValueAssigned: isValueAssigned,
        getTenantId: getTenantId,
        isBeaconsSupported: applicationinsightsCoreJs.isBeaconsSupported,
        isUint8ArrayAvailable: isUint8ArrayAvailable,
        isLatency: isLatency,
        sanitizeProperty: sanitizeProperty,
        getISOString: applicationinsightsCoreJs.toISOString,
        useXDomainRequest: applicationinsightsCoreJs.useXDomainRequest,
        getCommonSchemaMetaData: getCommonSchemaMetaData,
        cookieAvailable: applicationinsightsCoreJs.areCookiesSupported,
        disallowsSameSiteNone: applicationinsightsCoreJs.uaDisallowsSameSiteNone,
        setCookie: setCookie,
        deleteCookie: deleteCookie,
        getCookie: getCookie,
        createGuid: createGuid,
        extend: extend,
        getTime: getTime,
        isValueKind: isValueKind,
        isArrayValid: isArrayValid,
        objDefineAccessors: applicationinsightsCoreJs.objDefineAccessors,
        addPageUnloadEventListener: applicationinsightsCoreJs.addPageUnloadEventListener,
        setProcessTelemetryTimings: setProcessTelemetryTimings,
        addEventHandler: applicationinsightsCoreJs.addEventHandler,
        getFieldValueType: getFieldValueType,
        strEndsWith: applicationinsightsCoreJs.strEndsWith,
        objForEachKey: applicationinsightsCoreJs.objForEachKey
    };
    var CoreUtils = {
        _canUseCookies: undefined,
        isTypeof: applicationinsightsCoreJs.isTypeof,
        isUndefined: applicationinsightsCoreJs.isUndefined,
        isNullOrUndefined: applicationinsightsCoreJs.isNullOrUndefined,
        hasOwnProperty: applicationinsightsCoreJs.hasOwnProperty,
        isFunction: applicationinsightsCoreJs.isFunction,
        isObject: applicationinsightsCoreJs.isObject,
        isDate: applicationinsightsCoreJs.isDate,
        isArray: applicationinsightsCoreJs.isArray,
        isError: applicationinsightsCoreJs.isError,
        isString: applicationinsightsCoreJs.isString,
        isNumber: applicationinsightsCoreJs.isNumber,
        isBoolean: applicationinsightsCoreJs.isBoolean,
        toISOString: applicationinsightsCoreJs.toISOString,
        arrForEach: applicationinsightsCoreJs.arrForEach,
        arrIndexOf: applicationinsightsCoreJs.arrIndexOf,
        arrMap: applicationinsightsCoreJs.arrMap,
        arrReduce: applicationinsightsCoreJs.arrReduce,
        strTrim: applicationinsightsCoreJs.strTrim,
        objCreate: applicationinsightsShims.objCreateFn,
        objKeys: applicationinsightsCoreJs.objKeys,
        objDefineAccessors: applicationinsightsCoreJs.objDefineAccessors,
        addEventHandler: applicationinsightsCoreJs.addEventHandler,
        dateNow: applicationinsightsCoreJs.dateNow,
        isIE: applicationinsightsCoreJs.isIE,
        disableCookies: disableCookies,
        newGuid: applicationinsightsCoreJs.newGuid,
        perfNow: applicationinsightsCoreJs.perfNow,
        newId: applicationinsightsCoreJs.newId,
        randomValue: applicationinsightsCoreJs.randomValue,
        random32: applicationinsightsCoreJs.random32,
        mwcRandomSeed: applicationinsightsCoreJs.mwcRandomSeed,
        mwcRandom32: applicationinsightsCoreJs.mwcRandom32,
        generateW3CId: applicationinsightsCoreJs.generateW3CId
    };
    function isChromium() {
        return !!applicationinsightsCoreJs.getGlobalInst("chrome");
    }
    function openXhr(method, urlString, withCredentials, disabled, isSync, timeout) {
        if (disabled === void 0) { disabled = false; }
        if (isSync === void 0) { isSync = false; }
        function _wrapSetXhrProp(xhr, prop, value) {
            try {
                xhr[prop] = value;
            }
            catch (e) {
            }
        }
        var xhr = new XMLHttpRequest();
        if (disabled) {
            _wrapSetXhrProp(xhr, strDisabledPropertyName, disabled);
        }
        if (withCredentials) {
            _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
        }
        xhr.open(method, urlString, !isSync);
        if (withCredentials) {
            _wrapSetXhrProp(xhr, strWithCredentials, withCredentials);
        }
        if (!isSync && timeout) {
            _wrapSetXhrProp(xhr, strTimeout, timeout);
        }
        return xhr;
    }

    var AppInsightsCore = /** @class */ (function (_super) {
        applicationinsightsShims.__extendsFn(AppInsightsCore, _super);
        function AppInsightsCore() {
            var _this = _super.call(this) || this;
            _this.pluginVersionStringArr = [];
            dynamicProto__default(AppInsightsCore, _this, function (_self, _base) {
                if (!_self.logger || !_self.logger.queue) {
                    _self.logger = new applicationinsightsCoreJs.DiagnosticLogger({ loggingLevelConsole: 1  });
                }
                _self.initialize = function (config, extensions, logger, notificationManager) {
                    applicationinsightsCoreJs.doPerf(_self, function () { return "AppInsightsCore.initialize"; }, function () {
                        var _pluginVersionStringArr = _self.pluginVersionStringArr;
                        if (config) {
                            if (!config.endpointUrl) {
                                config.endpointUrl = STR_DEFAULT_ENDPOINT_URL;
                            }
                            var propertyStorageOverride = config.propertyStorageOverride;
                            if (propertyStorageOverride && (!propertyStorageOverride.getProperty || !propertyStorageOverride.setProperty)) {
                                applicationinsightsCoreJs.throwError("Invalid property storage override passed.");
                            }
                            if (config.channels) {
                                applicationinsightsCoreJs.arrForEach(config.channels, function (channels) {
                                    if (channels) {
                                        applicationinsightsCoreJs.arrForEach(channels, function (channel) {
                                            if (channel.identifier && channel.version) {
                                                var ver = channel.identifier + "=" + channel.version;
                                                _pluginVersionStringArr.push(ver);
                                            }
                                        });
                                    }
                                });
                            }
                        }
                        _self.getWParam = function () {
                            return (typeof document !== "undefined" || !!config.enableWParam) ? 0 : -1;
                        };
                        if (extensions) {
                            applicationinsightsCoreJs.arrForEach(extensions, function (ext) {
                                if (ext && ext.identifier && ext.version) {
                                    var ver = ext.identifier + "=" + ext.version;
                                    _pluginVersionStringArr.push(ver);
                                }
                            });
                        }
                        _self.pluginVersionString = _pluginVersionStringArr.join(";");
                        _self.pluginVersionStringArr = _pluginVersionStringArr;
                        try {
                            _base.initialize(config, extensions, logger, notificationManager);
                            _self.pollInternalLogs("InternalLog");
                        }
                        catch (e) {
                            var logger_1 = _self.logger;
                            var message = applicationinsightsCoreJs.dumpObj(e);
                            if (message.indexOf("channels") !== -1) {
                                message += "\n - Channels must be provided through config.channels only!";
                            }
                            applicationinsightsCoreJs._throwInternal(logger_1, 1 , 514 , "SDK Initialization Failed - no telemetry will be sent: " + message);
                        }
                    }, function () { return ({ config: config, extensions: extensions, logger: logger, notificationManager: notificationManager }); });
                };
                _self.track = function (item) {
                    applicationinsightsCoreJs.doPerf(_self, function () { return "AppInsightsCore.track"; }, function () {
                        var telemetryItem = item;
                        if (telemetryItem) {
                            telemetryItem.timings = telemetryItem.timings || {};
                            telemetryItem.timings.trackStart = getTime();
                            if (!isLatency(telemetryItem.latency)) {
                                telemetryItem.latency = 1 ;
                            }
                            var itemExt = telemetryItem.ext = telemetryItem.ext || {};
                            itemExt.sdk = itemExt.sdk || {};
                            itemExt.sdk.ver = FullVersionString;
                            var baseData = telemetryItem.baseData = telemetryItem.baseData || {};
                            baseData[STR_PROPERTIES] = baseData[STR_PROPERTIES] || {};
                            var itemProperties = baseData[STR_PROPERTIES];
                            itemProperties[STR_VERSION] = itemProperties[STR_VERSION] || _self.pluginVersionString || STR_EMPTY;
                        }
                        _base.track(telemetryItem);
                    }, function () { return ({ item: item }); }, !(item.sync));
                };
            });
            return _this;
        }
        AppInsightsCore.__ieDyn=1;
        return AppInsightsCore;
    }(applicationinsightsCoreJs.AppInsightsCore));

    var BaseCore = /** @class */ (function (_super) {
        applicationinsightsShims.__extendsFn(BaseCore, _super);
        function BaseCore() {
            var _this = _super.call(this) || this;
            dynamicProto__default(BaseCore, _this, function (_self, _base) {
                _self.initialize = function (config, extensions, logger, notificationManager) {
                    if (config && !config.endpointUrl) {
                        config.endpointUrl = STR_DEFAULT_ENDPOINT_URL;
                    }
                    _self.getWParam = function () {
                        return (isDocumentObjectAvailable || !!config.enableWParam) ? 0 : -1;
                    };
                    try {
                        _base.initialize(config, extensions, logger, notificationManager);
                    }
                    catch (e) {
                        applicationinsightsCoreJs._throwInternal(_self.logger, 1 , 514 , "Initialization Failed: " + applicationinsightsCoreJs.dumpObj(e) + "\n - Note: Channels must be provided through config.channels only");
                    }
                };
                _self.track = function (item) {
                    var telemetryItem = item;
                    if (telemetryItem) {
                        var ext = telemetryItem.ext = telemetryItem.ext || {};
                        ext.sdk = ext.sdk || {};
                        ext.sdk.ver = FullVersionString;
                    }
                    _base.track(telemetryItem);
                };
            });
            return _this;
        }
        BaseCore.__ieDyn=1;
        return BaseCore;
    }(applicationinsightsCoreJs.BaseCore));

    var _isFunction = applicationinsightsCoreJs.isFunction;
    function _createPromiseAllOnResolvedFunction(values, index, resolvedCallback) {
        return function (value) {
            values[index] = value;
            resolvedCallback();
        };
    }
    var ESPromise = /** @class */ (function () {
        function ESPromise(resolverFunc) {
            var _state = 0 ;
            var _settledValue = null;
            var _queue = [];
            dynamicProto__default(ESPromise, this, function (_this) {
                _this.then = function (onResolved, onRejected) {
                    return new ESPromise(function (resolve, reject) {
                        _enqueue(onResolved, onRejected, resolve, reject);
                    });
                };
                _this["catch"] = function (onRejected) {
                    return _this.then(null, onRejected);
                };
            });
            function _enqueue(onResolved, onRejected, resolve, reject) {
                _queue.push(function () {
                    var value;
                    try {
                        if (_state === 1 ) {
                            value = _isFunction(onResolved) ? onResolved(_settledValue) : _settledValue;
                        }
                        else {
                            value = _isFunction(onRejected) ? onRejected(_settledValue) : _settledValue;
                        }
                        if (value instanceof ESPromise) {
                            value.then(resolve, reject);
                        }
                        else if (_state === 2  && !_isFunction(onRejected)) {
                            reject(value);
                        }
                        else {
                            resolve(value);
                        }
                    }
                    catch (error) {
                        reject(error);
                        return;
                    }
                });
                if (_state !== 0 ) {
                    _processQueue();
                }
            }
            function _processQueue() {
                if (_queue.length > 0) {
                    var pending_1 = _queue.slice();
                    _queue = [];
                    setTimeout(function () {
                        for (var i = 0, len = pending_1.length; i < len; ++i) {
                            try {
                                pending_1[i]();
                            }
                            catch (e) {
                            }
                        }
                    }, 0);
                }
            }
            function _resolve(value) {
                if (_state === 0 ) {
                    _settledValue = value;
                    _state = 1 ;
                    _processQueue();
                }
            }
            function _reject(reason) {
                if (_state === 0 ) {
                    _settledValue = reason;
                    _state = 2 ;
                    _processQueue();
                }
            }
            (function _initialize() {
                if (!_isFunction(resolverFunc)) {
                    throw new TypeError("ESPromise: resolvedFunc argument is not a Function");
                }
                try {
                    resolverFunc(_resolve, _reject);
                }
                catch (error) {
                    _reject(error);
                }
            })();
        }
        ESPromise.resolve = function (value) {
            if (value instanceof ESPromise) {
                return value;
            }
            else if (value && _isFunction(value.then)) {
                return new ESPromise(function (resolve, reject) {
                    try {
                        value.then(resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }
            return new ESPromise(function (resolve) {
                resolve(value);
            });
        };
        ESPromise.reject = function (reason) {
            return new ESPromise(function (resolve, reject) {
                reject(reason);
            });
        };
        ESPromise.all = function (iterable) {
            if (!iterable || !iterable.length) {
                return;
            }
            return new ESPromise(function (resolve, reject) {
                try {
                    var values_1 = [];
                    var pending_2 = 0;
                    for (var lp = 0; lp < iterable.length; lp++) {
                        var item = iterable[lp];
                        if (item && _isFunction(item.then)) {
                            pending_2++;
                            item.then(_createPromiseAllOnResolvedFunction(values_1, lp, function () {
                                if (--pending_2 === 0) {
                                    resolve(values_1);
                                }
                            }), reject);
                        }
                        else {
                            values_1[lp] = item;
                        }
                    }
                    if (pending_2 === 0) {
                        setTimeout(function () {
                            resolve(values_1);
                        }, 0);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        };
        ESPromise.race = function (iterable) {
            return new ESPromise(function (resolve, reject) {
                if (!iterable || !iterable.length) {
                    return;
                }
                try {
                    var _loop_1 = function (lp) {
                        var item = iterable[lp];
                        if (item && _isFunction(item.then)) {
                            item.then(resolve, reject);
                        }
                        else {
                            setTimeout(function () {
                                resolve(item);
                            }, 0);
                        }
                    };
                    for (var lp = 0; lp < iterable.length; lp++) {
                        _loop_1(lp);
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        };
        return ESPromise;
    }());

    var LazyRejectPeriod = 600000;
    var _schedulerId = 0;
    var _running = [];
    var _waiting = [];
    var _timedOut = [];
    function _getTime() {
        return new Date().getTime();
    }
    var ESPromiseScheduler = /** @class */ (function () {
        function ESPromiseScheduler(name, diagLog) {
            var _promiseId = 0;
            var _scheduledName = (name || "<unnamed>") + "." + _schedulerId;
            _schedulerId++;
            dynamicProto__default(ESPromiseScheduler, this, function (_this) {
                var _lastEvent = null;
                var _eventCount = 0;
                _this.scheduleEvent = function (startEventAction, eventName, timeout) {
                    var uniqueId = _scheduledName + "." + _eventCount;
                    _eventCount++;
                    if (eventName) {
                        uniqueId += "-(" + eventName + ")";
                    }
                    var uniqueEventId = uniqueId + "{" + _promiseId + "}";
                    _promiseId++;
                    var newScheduledEvent = {
                        evt: null,
                        tm: _getTime(),
                        id: uniqueEventId,
                        isRunning: false,
                        isAborted: false
                    };
                    if (!_lastEvent) {
                        newScheduledEvent.evt = _startWaitingEvent(newScheduledEvent);
                    }
                    else {
                        newScheduledEvent.evt = _waitForPreviousEvent(newScheduledEvent, _lastEvent);
                    }
                    _lastEvent = newScheduledEvent;
                    _lastEvent.evt._schId = uniqueEventId;
                    return newScheduledEvent.evt;
                    function _abortAndRemoveOldEvents(eventQueue) {
                        var now = _getTime();
                        var expired = now - LazyRejectPeriod;
                        var len = eventQueue.length;
                        var lp = 0;
                        while (lp < len) {
                            var evt = eventQueue[lp];
                            if (evt && evt.tm < expired) {
                                var message = null;
                                if (evt.abort) {
                                    message = "Aborting [" + evt.id + "] due to Excessive runtime (" + (now - evt.tm) + " ms)";
                                    evt.abort(message);
                                }
                                else {
                                    message = "Removing [" + evt.id + "] due to Excessive runtime (" + (now - evt.tm) + " ms)";
                                }
                                _warnLog(message);
                                eventQueue.splice(lp, 1);
                                len--;
                            }
                            else {
                                lp++;
                            }
                        }
                    }
                    function _cleanup(eventId, completed) {
                        var toQueue = false;
                        var removed = _removeQueuedEvent(_running, eventId);
                        if (!removed) {
                            removed = _removeQueuedEvent(_timedOut, eventId);
                            toQueue = true;
                        }
                        if (removed) {
                            if (removed.to) {
                                clearTimeout(removed.to);
                                removed.to = null;
                            }
                            var tm = _getTime() - removed.tm;
                            if (completed) {
                                if (!toQueue) {
                                    _debugLog("Promise [" + eventId + "] Complete -- " + tm + " ms");
                                }
                                else {
                                    _warnLog("Timed out event [" + eventId + "] finally complete -- " + tm + " ms");
                                }
                            }
                            else {
                                _timedOut.push(removed);
                                _warnLog("Event [" + eventId + "] Timed out and removed -- " + tm + " ms");
                            }
                        }
                        else {
                            _debugLog("Failed to remove [" + eventId + "] from running queue");
                        }
                        if (_lastEvent && _lastEvent.id === eventId) {
                            _lastEvent = null;
                        }
                        _abortAndRemoveOldEvents(_running);
                        _abortAndRemoveOldEvents(_waiting);
                        _abortAndRemoveOldEvents(_timedOut);
                    }
                    function _removeScheduledEvent(eventId, callback) {
                        return function (value) {
                            _cleanup(eventId, true);
                            callback && callback(value);
                            return value;
                        };
                    }
                    function _waitForFinalResult(eventId, startResult, schEventResolve, schEventReject) {
                        startResult.then(function (value) {
                            if (value instanceof ESPromise) {
                                _debugLog("Event [" + eventId + "] returned a promise -- waiting");
                                _waitForFinalResult(eventId, value, schEventResolve, schEventReject);
                                return value;
                            }
                            else {
                                return _removeScheduledEvent(eventId, schEventResolve)(value);
                            }
                        }, _removeScheduledEvent(eventId, schEventReject));
                    }
                    function _createScheduledEvent(eventDetails, startEvent) {
                        var eventId = eventDetails.id;
                        return new ESPromise(function (schEventResolve, schEventReject) {
                            _debugLog("Event [" + eventId + "] Starting -- waited for " + (eventDetails.wTm || "--") + " ms");
                            eventDetails.isRunning = true;
                            eventDetails.abort = function (message) {
                                eventDetails.abort = null;
                                eventDetails.isAborted = true;
                                _cleanup(eventId, false);
                                schEventReject(new Error(message));
                            };
                            var startResult = startEvent(eventId);
                            if (startResult instanceof ESPromise) {
                                if (timeout) {
                                    eventDetails.to = setTimeout(function () {
                                        _cleanup(eventId, false);
                                        schEventReject(new Error("Timed out after [" + timeout + "] ms"));
                                    }, timeout);
                                }
                                _waitForFinalResult(eventId, startResult, function (theResult) {
                                    _debugLog("Event [" + eventId + "] Resolving after " + (_getTime() - eventDetails.tm) + " ms");
                                    schEventResolve(theResult);
                                }, schEventReject);
                            }
                            else {
                                _debugLog("Promise [" + eventId + "] Auto completed as the start action did not return a promise");
                                schEventResolve();
                            }
                        });
                    }
                    function _startWaitingEvent(eventDetails) {
                        var now = _getTime();
                        eventDetails.wTm = now - eventDetails.tm;
                        eventDetails.tm = now;
                        if (eventDetails.isAborted) {
                            return ESPromise.reject(new Error("[" + uniqueId + "] was aborted"));
                        }
                        _running.push(eventDetails);
                        return _createScheduledEvent(eventDetails, startEventAction);
                    }
                    function _waitForPreviousEvent(eventDetails, waitForEvent) {
                        var waitEvent = new ESPromise(function (waitResolve, waitReject) {
                            var runTime = _getTime() - waitForEvent.tm;
                            var prevId = waitForEvent.id;
                            _debugLog("[" + uniqueId + "] is waiting for [" + prevId + ":" + runTime + " ms] to complete before starting -- [" + _waiting.length + "] waiting and [" + _running.length + "] running");
                            eventDetails.abort = function (message) {
                                eventDetails.abort = null;
                                _removeQueuedEvent(_waiting, uniqueId);
                                eventDetails.isAborted = true;
                                waitReject(new Error(message));
                            };
                            waitForEvent.evt.then(function (value) {
                                _removeQueuedEvent(_waiting, uniqueId);
                                _startWaitingEvent(eventDetails).then(waitResolve, waitReject);
                            }, function (reason) {
                                _removeQueuedEvent(_waiting, uniqueId);
                                _startWaitingEvent(eventDetails).then(waitResolve, waitReject);
                            });
                        });
                        _waiting.push(eventDetails);
                        return waitEvent;
                    }
                };
                function _removeQueuedEvent(queue, eventId) {
                    for (var lp = 0; lp < queue.length; lp++) {
                        if (queue[lp].id === eventId) {
                            return queue.splice(lp, 1)[0];
                        }
                    }
                    return null;
                }
            });
            function _debugLog(message) {
                var global = applicationinsightsCoreJs.getGlobal();
                if (global && global["QUnit"]) {
                    console && console.log("ESPromiseScheduler[" + _scheduledName + "] " + message);
                }
            }
            function _warnLog(message) {
                applicationinsightsCoreJs._warnToConsole(diagLog, "ESPromiseScheduler[" + _scheduledName + "] " + message);
            }
        }
        ESPromiseScheduler.incomplete = function () {
            return _running;
        };
        ESPromiseScheduler.waitingToStart = function () {
            return _waiting;
        };
        return ESPromiseScheduler;
    }());

    var ValueSanitizer = /** @class */ (function () {
        function ValueSanitizer(fieldSanitizerProvider) {
            var _self = this;
            var _sanitizerMap = {};
            var _sanitizers = [];
            var _fieldSanitizers = [];
            if (fieldSanitizerProvider) {
                _fieldSanitizers.push(fieldSanitizerProvider);
            }
            function _getFieldSanitizer(path, name) {
                var result;
                var fieldLookup = _sanitizerMap[path];
                if (fieldLookup) {
                    result = fieldLookup[name];
                }
                if (!result && result !== null) {
                    if (applicationinsightsCoreJs.isString(path) && applicationinsightsCoreJs.isString(name)) {
                        if (_fieldSanitizers.length > 0) {
                            for (var lp = 0; lp < _fieldSanitizers.length; lp++) {
                                if (_fieldSanitizers[lp].handleField(path, name)) {
                                    result = {
                                        canHandle: true,
                                        fieldHandler: _fieldSanitizers[lp]
                                    };
                                    break;
                                }
                            }
                        }
                        else if (_sanitizers.length === 0) {
                            result = {
                                canHandle: true
                            };
                        }
                    }
                    if (!result && result !== null) {
                        result = null;
                        for (var lp = 0; lp < _sanitizers.length; lp++) {
                            if (_sanitizers[lp].handleField(path, name)) {
                                result = {
                                    canHandle: true,
                                    handler: _sanitizers[lp],
                                    fieldHandler: null
                                };
                                break;
                            }
                        }
                    }
                    if (!fieldLookup) {
                        fieldLookup = _sanitizerMap[path] = {};
                    }
                    fieldLookup[name] = result;
                }
                return result;
            }
            _self.addSanitizer = function (newSanitizer) {
                if (newSanitizer) {
                    _sanitizers.push(newSanitizer);
                    _sanitizerMap = {};
                }
            };
            _self.addFieldSanitizer = function (fieldSanitizer) {
                if (fieldSanitizer) {
                    _fieldSanitizers.push(fieldSanitizer);
                    _sanitizerMap = {};
                }
            };
            _self.handleField = function (path, name) {
                var mapValue = _getFieldSanitizer(path, name);
                return mapValue ? mapValue.canHandle : false;
            };
            _self.value = function (path, name, value, stringifyObjects) {
                var mapValue = _getFieldSanitizer(path, name);
                if (mapValue && mapValue.canHandle) {
                    if (!mapValue || !mapValue.canHandle) {
                        return null;
                    }
                    if (mapValue.handler) {
                        return mapValue.handler.value(path, name, value, stringifyObjects);
                    }
                    if (!applicationinsightsCoreJs.isString(name) || applicationinsightsCoreJs.isNullOrUndefined(value) || value === STR_EMPTY) {
                        return null;
                    }
                    var property = null;
                    var fieldType = getFieldValueType(value);
                    if ((fieldType & 8192 ) === 8192 ) {
                        var subType = fieldType & ~8192 ;
                        property = value;
                        if (!isValueAssigned(property.value) ||
                            (subType !== 1  &&
                                subType !== 2  &&
                                subType !== 3  &&
                                (subType & 4096 ) !== 4096 )) {
                            return null;
                        }
                    }
                    else if (fieldType === 1  ||
                        fieldType === 2  ||
                        fieldType === 3  ||
                        (fieldType & 4096 ) === 4096 ) {
                        property = _convertToProperty(path, name, value);
                    }
                    else if (fieldType === 4 ) {
                        property = _convertToProperty(path, name, !!stringifyObjects ? JSON.stringify(value) : value);
                    }
                    if (property) {
                        return _handleProperty(mapValue, path, name, fieldType, property, stringifyObjects);
                    }
                }
                return null;
            };
            _self.property = function (path, name, property, stringifyObjects) {
                var mapValue = _getFieldSanitizer(path, name);
                if (!mapValue || !mapValue.canHandle) {
                    return null;
                }
                if (!applicationinsightsCoreJs.isString(name) || applicationinsightsCoreJs.isNullOrUndefined(property) || !isValueAssigned(property.value)) {
                    return null;
                }
                var fieldType = getFieldValueType(property.value);
                if (fieldType === 0 ) {
                    return null;
                }
                return _handleProperty(mapValue, path, name, fieldType, property, stringifyObjects);
            };
            function _handleProperty(mapValue, path, name, fieldType, property, stringifyObjects) {
                if (mapValue.handler) {
                    return mapValue.handler.property(path, name, property, stringifyObjects);
                }
                if (!applicationinsightsCoreJs.isNullOrUndefined(property.kind)) {
                    if ((fieldType & 4096 ) === 4096  || !isValueKind(property.kind)) {
                        return null;
                    }
                    property.value = property.value.toString();
                }
                return _callFieldSanitizer(mapValue.fieldHandler, path, name, fieldType, property);
            }
            function _convertToProperty(path, name, value) {
                if (isValueAssigned(value)) {
                    return { value: value };
                }
                return null;
            }
            function _callFieldSanitizer(fieldProvider, path, name, theType, property) {
                if (property && fieldProvider) {
                    var sanitizer = fieldProvider.getSanitizer(path, name, theType, property.kind, property.propertyType);
                    if (sanitizer) {
                        if (theType === 4 ) {
                            var newValue_1 = {};
                            var propValue = property.value;
                            applicationinsightsCoreJs.objForEachKey(propValue, function (propKey, theValue) {
                                var newPath = path + "." + name;
                                if (isValueAssigned(theValue)) {
                                    var newProp = _convertToProperty(newPath, propKey, theValue);
                                    newProp = _callFieldSanitizer(fieldProvider, newPath, propKey, getFieldValueType(theValue), newProp);
                                    if (newProp) {
                                        newValue_1[propKey] = newProp.value;
                                    }
                                }
                            });
                            property.value = newValue_1;
                        }
                        else {
                            var details = {
                                path: path,
                                name: name,
                                type: theType,
                                prop: property,
                                sanitizer: _self
                            };
                            property = sanitizer.call(_self, details);
                        }
                    }
                }
                return property;
            }
        }
        ValueSanitizer.getFieldType = getFieldValueType;
        return ValueSanitizer;
    }());

    exports.BaseTelemetryPlugin = applicationinsightsCoreJs.BaseTelemetryPlugin;
    exports.DiagnosticLogger = applicationinsightsCoreJs.DiagnosticLogger;
    exports.EventHelper = applicationinsightsCoreJs.EventHelper;
    exports.EventsDiscardedReason = applicationinsightsCoreJs.EventsDiscardedReason;
    exports.InternalAppInsightsCore = applicationinsightsCoreJs.AppInsightsCore;
    exports.InternalBaseCore = applicationinsightsCoreJs.BaseCore;
    exports.LoggingSeverity = applicationinsightsCoreJs.LoggingSeverity;
    exports.MinChannelPriorty = applicationinsightsCoreJs.MinChannelPriorty;
    exports.NotificationManager = applicationinsightsCoreJs.NotificationManager;
    exports.PerfEvent = applicationinsightsCoreJs.PerfEvent;
    exports.PerfManager = applicationinsightsCoreJs.PerfManager;
    exports.ProcessTelemetryContext = applicationinsightsCoreJs.ProcessTelemetryContext;
    exports.Undefined = applicationinsightsCoreJs.strUndefined;
    exports._InternalLogMessage = applicationinsightsCoreJs._InternalLogMessage;
    exports._InternalMessageId = applicationinsightsCoreJs._InternalMessageId;
    exports.__getRegisteredEvents = applicationinsightsCoreJs.__getRegisteredEvents;
    exports._logInternalMessage = applicationinsightsCoreJs._logInternalMessage;
    exports._throwInternal = applicationinsightsCoreJs._throwInternal;
    exports._warnToConsole = applicationinsightsCoreJs._warnToConsole;
    exports.addEventHandler = applicationinsightsCoreJs.addEventHandler;
    exports.addEventListeners = applicationinsightsCoreJs.addEventListeners;
    exports.addPageHideEventListener = applicationinsightsCoreJs.addPageHideEventListener;
    exports.addPageShowEventListener = applicationinsightsCoreJs.addPageShowEventListener;
    exports.addPageUnloadEventListener = applicationinsightsCoreJs.addPageUnloadEventListener;
    exports.areCookiesSupported = applicationinsightsCoreJs.areCookiesSupported;
    exports.arrForEach = applicationinsightsCoreJs.arrForEach;
    exports.arrIndexOf = applicationinsightsCoreJs.arrIndexOf;
    exports.arrMap = applicationinsightsCoreJs.arrMap;
    exports.arrReduce = applicationinsightsCoreJs.arrReduce;
    exports.attachEvent = applicationinsightsCoreJs.attachEvent;
    exports.cookieAvailable = applicationinsightsCoreJs.areCookiesSupported;
    exports.createCookieMgr = applicationinsightsCoreJs.createCookieMgr;
    exports.createEnumStyle = applicationinsightsCoreJs.createEnumStyle;
    exports.createProcessTelemetryContext = applicationinsightsCoreJs.createProcessTelemetryContext;
    exports.createTraceParent = applicationinsightsCoreJs.createTraceParent;
    exports.createUniqueNamespace = applicationinsightsCoreJs.createUniqueNamespace;
    exports.createUnloadHandlerContainer = applicationinsightsCoreJs.createUnloadHandlerContainer;
    exports.dateNow = applicationinsightsCoreJs.dateNow;
    exports.detachEvent = applicationinsightsCoreJs.detachEvent;
    exports.disallowsSameSiteNone = applicationinsightsCoreJs.uaDisallowsSameSiteNone;
    exports.doPerf = applicationinsightsCoreJs.doPerf;
    exports.dumpObj = applicationinsightsCoreJs.dumpObj;
    exports.eventOff = applicationinsightsCoreJs.eventOff;
    exports.eventOn = applicationinsightsCoreJs.eventOn;
    exports.findW3cTraceParent = applicationinsightsCoreJs.findW3cTraceParent;
    exports.formatTraceParent = applicationinsightsCoreJs.formatTraceParent;
    exports.generateW3CId = applicationinsightsCoreJs.generateW3CId;
    exports.getConsole = applicationinsightsCoreJs.getConsole;
    exports.getCrypto = applicationinsightsCoreJs.getCrypto;
    exports.getDocument = applicationinsightsCoreJs.getDocument;
    exports.getExceptionName = applicationinsightsCoreJs.getExceptionName;
    exports.getGlobal = applicationinsightsCoreJs.getGlobal;
    exports.getGlobalInst = applicationinsightsCoreJs.getGlobalInst;
    exports.getHistory = applicationinsightsCoreJs.getHistory;
    exports.getIEVersion = applicationinsightsCoreJs.getIEVersion;
    exports.getISOString = applicationinsightsCoreJs.toISOString;
    exports.getJSON = applicationinsightsCoreJs.getJSON;
    exports.getLocation = applicationinsightsCoreJs.getLocation;
    exports.getMsCrypto = applicationinsightsCoreJs.getMsCrypto;
    exports.getNavigator = applicationinsightsCoreJs.getNavigator;
    exports.getPerformance = applicationinsightsCoreJs.getPerformance;
    exports.getSetValue = applicationinsightsCoreJs.getSetValue;
    exports.getWindow = applicationinsightsCoreJs.getWindow;
    exports.hasDocument = applicationinsightsCoreJs.hasDocument;
    exports.hasHistory = applicationinsightsCoreJs.hasHistory;
    exports.hasJSON = applicationinsightsCoreJs.hasJSON;
    exports.hasNavigator = applicationinsightsCoreJs.hasNavigator;
    exports.hasOwnProperty = applicationinsightsCoreJs.hasOwnProperty;
    exports.hasWindow = applicationinsightsCoreJs.hasWindow;
    exports.isArray = applicationinsightsCoreJs.isArray;
    exports.isBeaconsSupported = applicationinsightsCoreJs.isBeaconsSupported;
    exports.isBoolean = applicationinsightsCoreJs.isBoolean;
    exports.isDate = applicationinsightsCoreJs.isDate;
    exports.isError = applicationinsightsCoreJs.isError;
    exports.isFetchSupported = applicationinsightsCoreJs.isFetchSupported;
    exports.isFunction = applicationinsightsCoreJs.isFunction;
    exports.isIE = applicationinsightsCoreJs.isIE;
    exports.isNotTruthy = applicationinsightsCoreJs.isNotTruthy;
    exports.isNullOrUndefined = applicationinsightsCoreJs.isNullOrUndefined;
    exports.isNumber = applicationinsightsCoreJs.isNumber;
    exports.isObject = applicationinsightsCoreJs.isObject;
    exports.isReactNative = applicationinsightsCoreJs.isReactNative;
    exports.isSampledFlag = applicationinsightsCoreJs.isSampledFlag;
    exports.isString = applicationinsightsCoreJs.isString;
    exports.isTruthy = applicationinsightsCoreJs.isTruthy;
    exports.isTypeof = applicationinsightsCoreJs.isTypeof;
    exports.isUndefined = applicationinsightsCoreJs.isUndefined;
    exports.isValidSpanId = applicationinsightsCoreJs.isValidSpanId;
    exports.isValidTraceId = applicationinsightsCoreJs.isValidTraceId;
    exports.isValidTraceParent = applicationinsightsCoreJs.isValidTraceParent;
    exports.isXhrSupported = applicationinsightsCoreJs.isXhrSupported;
    exports.mergeEvtNamespace = applicationinsightsCoreJs.mergeEvtNamespace;
    exports.newGuid = applicationinsightsCoreJs.newGuid;
    exports.newId = applicationinsightsCoreJs.newId;
    exports.normalizeJsName = applicationinsightsCoreJs.normalizeJsName;
    exports.objCreate = applicationinsightsCoreJs.objCreate;
    exports.objDefineAccessors = applicationinsightsCoreJs.objDefineAccessors;
    exports.objForEachKey = applicationinsightsCoreJs.objForEachKey;
    exports.objFreeze = applicationinsightsCoreJs.objFreeze;
    exports.objKeys = applicationinsightsCoreJs.objKeys;
    exports.objSeal = applicationinsightsCoreJs.objSeal;
    exports.optimizeObject = applicationinsightsCoreJs.optimizeObject;
    exports.parseTraceParent = applicationinsightsCoreJs.parseTraceParent;
    exports.perfNow = applicationinsightsCoreJs.perfNow;
    exports.proxyAssign = applicationinsightsCoreJs.proxyAssign;
    exports.proxyFunctionAs = applicationinsightsCoreJs.proxyFunctionAs;
    exports.proxyFunctions = applicationinsightsCoreJs.proxyFunctions;
    exports.random32 = applicationinsightsCoreJs.random32;
    exports.randomValue = applicationinsightsCoreJs.randomValue;
    exports.removeEventHandler = applicationinsightsCoreJs.removeEventHandler;
    exports.removeEventListeners = applicationinsightsCoreJs.removeEventListeners;
    exports.removePageHideEventListener = applicationinsightsCoreJs.removePageHideEventListener;
    exports.removePageShowEventListener = applicationinsightsCoreJs.removePageShowEventListener;
    exports.removePageUnloadEventListener = applicationinsightsCoreJs.removePageUnloadEventListener;
    exports.safeGetCookieMgr = applicationinsightsCoreJs.safeGetCookieMgr;
    exports.safeGetLogger = applicationinsightsCoreJs.safeGetLogger;
    exports.setEnableEnvMocks = applicationinsightsCoreJs.setEnableEnvMocks;
    exports.setValue = applicationinsightsCoreJs.setValue;
    exports.strContains = applicationinsightsCoreJs.strContains;
    exports.strEndsWith = applicationinsightsCoreJs.strEndsWith;
    exports.strFunction = applicationinsightsCoreJs.strFunction;
    exports.strObject = applicationinsightsCoreJs.strObject;
    exports.strPrototype = applicationinsightsCoreJs.strPrototype;
    exports.strStartsWith = applicationinsightsCoreJs.strStartsWith;
    exports.strTrim = applicationinsightsCoreJs.strTrim;
    exports.strUndefined = applicationinsightsCoreJs.strUndefined;
    exports.throwError = applicationinsightsCoreJs.throwError;
    exports.toISOString = applicationinsightsCoreJs.toISOString;
    exports.useXDomainRequest = applicationinsightsCoreJs.useXDomainRequest;
    exports.AppInsightsCore = AppInsightsCore;
    exports.BaseCore = BaseCore;
    exports.CoreUtils = CoreUtils;
    exports.ESPromise = ESPromise;
    exports.ESPromiseScheduler = ESPromiseScheduler;
    exports.EventLatency = EventLatency;
    exports.EventPersistence = EventPersistence;
    exports.EventPropertyType = EventPropertyType;
    exports.FullVersionString = FullVersionString;
    exports.TraceLevel = TraceLevel;
    exports.Utils = Utils;
    exports.ValueKind = ValueKind;
    exports.ValueSanitizer = ValueSanitizer;
    exports.Version = Version;
    exports._ExtendedInternalMessageId = _ExtendedInternalMessageId;
    exports.createGuid = createGuid;
    exports.deleteCookie = deleteCookie;
    exports.disableCookies = disableCookies;
    exports.extend = extend;
    exports.getCommonSchemaMetaData = getCommonSchemaMetaData;
    exports.getCookie = getCookie;
    exports.getCookieValue = getCookieValue;
    exports.getFieldValueType = getFieldValueType;
    exports.getTenantId = getTenantId;
    exports.getTime = getTime;
    exports.isArrayValid = isArrayValid;
    exports.isChromium = isChromium;
    exports.isDocumentObjectAvailable = isDocumentObjectAvailable;
    exports.isLatency = isLatency;
    exports.isUint8ArrayAvailable = isUint8ArrayAvailable;
    exports.isValueAssigned = isValueAssigned;
    exports.isValueKind = isValueKind;
    exports.isWindowObjectAvailable = isWindowObjectAvailable;
    exports.openXhr = openXhr;
    exports.sanitizeProperty = sanitizeProperty;
    exports.setCookie = setCookie;
    exports.setProcessTelemetryTimings = setProcessTelemetryTimings;

    (function(obj, prop, descriptor) { /* ai_es3_polyfil defineProperty */ var func = Object["defineProperty"]; if (func) { try { return func(obj, prop, descriptor); } catch(e) { /* IE8 defines defineProperty, but will throw */ } } if (descriptor && typeof descriptor.value !== undefined) { obj[prop] = descriptor.value; } return obj; })(exports, '__esModule', { value: true });

}));
