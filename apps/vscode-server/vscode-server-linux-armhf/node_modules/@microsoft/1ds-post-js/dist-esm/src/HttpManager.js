/*
 * 1DS JS SDK POST plugin, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
var _a;
/**
* HttpManager.ts
* @author Abhilash Panwar (abpanwar); Hector Hernandez (hectorh); Nev Wylie (newylie)
* @copyright Microsoft 2018-2020
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import EVTClockSkewManager from "./ClockSkewManager";
import EVTKillSwitch from "./KillSwitch";
import { FullVersionString, _throwInternal, _warnToConsole, arrForEach, dateNow, doPerf, dumpObj, extend, getLocation, getNavigator, getTime, hasOwnProperty, isArray, isBeaconsSupported, isFetchSupported, isNullOrUndefined, isNumber, isReactNative, isString, isUndefined, isValueAssigned, isXhrSupported, objForEachKey, objKeys, openXhr, strTrim, strUndefined, useXDomainRequest } from "@microsoft/1ds-core-js";
import { DEFAULT_CACHE_CONTROL, DEFAULT_CONTENT_TYPE, STR_API_KEY, STR_AUTH_XTOKEN, STR_CACHE_CONTROL, STR_CLIENT_ID, STR_CLIENT_VERSION, STR_CONTENT_TYPE_HEADER, STR_DISABLED_PROPERTY_NAME, STR_DROPPED, STR_EMPTY, STR_KILL_DURATION_HEADER, STR_KILL_DURATION_SECONDS_HEADER, STR_KILL_TOKENS_HEADER, STR_MSA_DEVICE_TICKET, STR_MSFPC, STR_NO_RESPONSE_BODY, STR_OTHER, STR_POST_METHOD, STR_REQUEUE, STR_RESPONSE_FAIL, STR_SENDING, STR_TIME_DELTA_HEADER, STR_TIME_DELTA_TO_APPLY, STR_UPLOAD_TIME } from "./InternalConstants";
import { retryPolicyGetMillisToBackoffForRetry, retryPolicyShouldRetryForStatus } from "./RetryPolicy";
import { Serializer } from "./Serializer";
var strSendAttempt = "sendAttempt";
var _noResponseQs = "&" + STR_NO_RESPONSE_BODY + "=true";
/**
 * Identifies the default notification reason to the action names
 */
var _eventActionMap = (_a = {},
    _a[1 /* EventBatchNotificationReason.Paused */] = STR_REQUEUE,
    _a[100 /* EventBatchNotificationReason.RequeueEvents */] = STR_REQUEUE,
    _a[200 /* EventBatchNotificationReason.Complete */] = "sent",
    _a[8004 /* EventBatchNotificationReason.KillSwitch */] = STR_DROPPED,
    _a[8003 /* EventBatchNotificationReason.SizeLimitExceeded */] = STR_DROPPED,
    _a);
var _collectorQsHeaders = {};
var _collectorHeaderToQs = {};
function _addCollectorHeaderQsMapping(qsName, headerName, allowQs) {
    _collectorQsHeaders[qsName] = headerName;
    if (allowQs !== false) {
        _collectorHeaderToQs[headerName] = qsName;
    }
}
_addCollectorHeaderQsMapping(STR_MSA_DEVICE_TICKET, STR_MSA_DEVICE_TICKET, false);
_addCollectorHeaderQsMapping(STR_CLIENT_VERSION, STR_CLIENT_VERSION);
_addCollectorHeaderQsMapping(STR_CLIENT_ID, "Client-Id");
_addCollectorHeaderQsMapping(STR_API_KEY, STR_API_KEY);
_addCollectorHeaderQsMapping(STR_TIME_DELTA_TO_APPLY, STR_TIME_DELTA_TO_APPLY);
_addCollectorHeaderQsMapping(STR_UPLOAD_TIME, STR_UPLOAD_TIME);
_addCollectorHeaderQsMapping(STR_AUTH_XTOKEN, STR_AUTH_XTOKEN);
function _getResponseText(xhr) {
    try {
        return xhr.responseText;
    }
    catch (e) {
        // Best effort, as XHR may throw while XDR wont so just ignore
    }
    return STR_EMPTY;
}
function _hasHeader(headers, header) {
    var hasHeader = false;
    if (headers && header) {
        var keys = objKeys(headers);
        if (keys && keys.length > 0) {
            var lowerHeader = header.toLowerCase();
            for (var lp = 0; lp < keys.length; lp++) {
                var value = keys[lp];
                if (value && hasOwnProperty(header, value) &&
                    value.toLowerCase() === lowerHeader) {
                    hasHeader = true;
                    break;
                }
            }
        }
    }
    return hasHeader;
}
function _addRequestDetails(details, name, value, useHeaders) {
    if (name && value && value.length > 0) {
        if (useHeaders && _collectorQsHeaders[name]) {
            details.hdrs[_collectorQsHeaders[name]] = value;
            details.useHdrs = true;
        }
        else {
            details.url += "&" + name + "=" + value;
        }
    }
}
function _prependTransports(theTransports, newTransports) {
    if (newTransports) {
        if (isNumber(newTransports)) {
            theTransports = [newTransports].concat(theTransports);
        }
        else if (isArray(newTransports)) {
            theTransports = newTransports.concat(theTransports);
        }
    }
    return theTransports;
}
/**
 * Class managing the sending of requests.
 */
var HttpManager = /** @class */ (function () {
    /**
     * @constructor
     * @param requestQueue   - The queue that contains the requests to be sent.
     */
    function HttpManager(maxEventsPerBatch, maxConnections, maxRequestRetriesBeforeBackoff, actions, timeoutOverride) {
        this._responseHandlers = [];
        var _urlString = "?cors=true&" + STR_CONTENT_TYPE_HEADER.toLowerCase() + "=" + DEFAULT_CONTENT_TYPE;
        var _killSwitch = new EVTKillSwitch();
        var _paused = false;
        var _clockSkewManager = new EVTClockSkewManager();
        var _useBeacons = false;
        var _outstandingRequests = 0; // Holds the number of outstanding async requests that have not returned a response yet
        var _postManager;
        var _logger;
        var _sendInterfaces;
        var _core;
        var _customHttpInterface = true;
        var _queryStringParameters = [];
        var _headers = {};
        var _batchQueue = [];
        var _serializer = null;
        var _enableEventTimings = false;
        var _cookieMgr;
        var _isUnloading = false;
        var _useHeaders = false;
        var _xhrTimeout;
        var _disableXhrSync;
        var _disableFetchKeepAlive;
        var _canHaveReducedPayload;
        var _addNoResponse;
        dynamicProto(HttpManager, this, function (_self) {
            var _sendCredentials = true;
            _self.initialize = function (endpointUrl, core, postChannel, httpInterface, channelConfig) {
                var _a;
                if (!channelConfig) {
                    channelConfig = {};
                }
                _urlString = endpointUrl + _urlString;
                _useHeaders = !isUndefined(channelConfig.avoidOptions) ? !channelConfig.avoidOptions : true;
                _core = core;
                _cookieMgr = core.getCookieMgr();
                _enableEventTimings = !_core.config.disableEventTimings;
                var enableCompoundKey = !!_core.config.enableCompoundKey;
                _postManager = postChannel;
                _logger = _postManager.diagLog();
                var valueSanitizer = channelConfig.valueSanitizer;
                var stringifyObjects = channelConfig.stringifyObjects;
                if (!isUndefined(channelConfig.enableCompoundKey)) {
                    enableCompoundKey = !!channelConfig.enableCompoundKey;
                }
                _xhrTimeout = channelConfig.xhrTimeout;
                _disableXhrSync = !!channelConfig.disableXhrSync;
                _disableFetchKeepAlive = !!channelConfig.disableFetchKeepAlive;
                _addNoResponse = channelConfig.addNoResponse !== false;
                _useBeacons = !isReactNative(); // Only use beacons if not running in React Native
                _serializer = new Serializer(_core, valueSanitizer, stringifyObjects, enableCompoundKey);
                if (!isNullOrUndefined(channelConfig.useSendBeacon)) {
                    _useBeacons = !!channelConfig.useSendBeacon;
                }
                var syncHttpInterface = httpInterface;
                var beaconHttpInterface = channelConfig.alwaysUseXhrOverride ? httpInterface : null;
                var fetchSyncHttpInterface = channelConfig.alwaysUseXhrOverride ? httpInterface : null;
                var beaconUnloadTransports = [3 /* TransportType.Beacon */, 2 /* TransportType.Fetch */];
                if (!httpInterface) {
                    _customHttpInterface = false;
                    var location_1 = getLocation();
                    if (location_1 && location_1.protocol && location_1.protocol.toLowerCase() === "file:") {
                        // Special case where a local html file fails with a CORS error on Chromium browsers
                        _sendCredentials = false;
                    }
                    var theTransports = [];
                    if (isReactNative()) {
                        // Use Fetch or XDR/XHR
                        theTransports = [2 /* TransportType.Fetch */, 1 /* TransportType.Xhr */];
                        beaconUnloadTransports = [2 /* TransportType.Fetch */, 1 /* TransportType.Xhr */, 3 /* TransportType.Beacon */];
                    }
                    else {
                        // Use XDR/XHR, Fetch or beacons
                        theTransports = [1 /* TransportType.Xhr */, 2 /* TransportType.Fetch */, 3 /* TransportType.Beacon */];
                    }
                    // Prefix any user requested transport(s) values
                    theTransports = _prependTransports(theTransports, channelConfig.transports);
                    httpInterface = _getSenderInterface(theTransports, false);
                    if (!httpInterface) {
                        _warnToConsole(_logger, "No available transport to send events");
                    }
                    syncHttpInterface = _getSenderInterface(theTransports, true);
                }
                if (!beaconHttpInterface) {
                    // Allow overriding the usage of sendBeacon
                    beaconUnloadTransports = _prependTransports(beaconUnloadTransports, channelConfig.unloadTransports);
                    beaconHttpInterface = _getSenderInterface(beaconUnloadTransports, true);
                }
                _canHaveReducedPayload = !_customHttpInterface && ((_useBeacons && isBeaconsSupported()) || (!_disableFetchKeepAlive && isFetchSupported(true)));
                _sendInterfaces = (_a = {},
                    _a[0 /* EventSendType.Batched */] = httpInterface,
                    _a[1 /* EventSendType.Synchronous */] = syncHttpInterface || _getSenderInterface([1 /* TransportType.Xhr */, 2 /* TransportType.Fetch */, 3 /* TransportType.Beacon */], true),
                    _a[2 /* EventSendType.SendBeacon */] = beaconHttpInterface || syncHttpInterface || _getSenderInterface([1 /* TransportType.Xhr */], true),
                    _a[3 /* EventSendType.SyncFetch */] = fetchSyncHttpInterface || _getSenderInterface([2 /* TransportType.Fetch */, 3 /* TransportType.Beacon */], true) || syncHttpInterface || _getSenderInterface([1 /* TransportType.Xhr */], true),
                    _a);
            };
            // Special internal method to allow the DebugPlugin to hook embedded objects
            function _getSenderInterface(transports, syncSupport) {
                var transportType = 0 /* TransportType.NotSet */;
                var sendPostFunc = null;
                var lp = 0;
                while (sendPostFunc == null && lp < transports.length) {
                    transportType = transports[lp];
                    if (transportType === 1 /* TransportType.Xhr */) {
                        if (useXDomainRequest()) {
                            sendPostFunc = _xdrSendPost;
                        }
                        else if (isXhrSupported()) {
                            sendPostFunc = _xhrSendPost;
                        }
                    }
                    else if (transportType === 2 /* TransportType.Fetch */ && isFetchSupported(syncSupport) && (!syncSupport || (syncSupport && !_disableFetchKeepAlive))) {
                        sendPostFunc = _fetchSendPost;
                    }
                    else if (_useBeacons && transportType === 3 /* TransportType.Beacon */ && isBeaconsSupported()) {
                        sendPostFunc = _beaconSendPost;
                    }
                    lp++;
                }
                if (sendPostFunc) {
                    return {
                        _transport: transportType,
                        _isSync: syncSupport,
                        sendPOST: sendPostFunc
                    };
                }
                return null;
            }
            _self["_getDbgPlgTargets"] = function () {
                return [_sendInterfaces[0 /* EventSendType.Batched */], _killSwitch, _serializer, _sendInterfaces];
            };
            function _xdrSendPost(payload, oncomplete, sync) {
                // It doesn't support custom headers, so no action is taken with current requestHeaders
                var xdr = new XDomainRequest();
                xdr.open(STR_POST_METHOD, payload.urlString);
                if (payload.timeout) {
                    xdr.timeout = payload.timeout;
                }
                // can't get the status code in xdr.
                xdr.onload = function () {
                    // we will assume onload means the request succeeded.
                    var response = _getResponseText(xdr);
                    _doOnComplete(oncomplete, 200, {}, response);
                    _handleCollectorResponse(response);
                };
                // we will assume onerror means we need to drop the events.
                xdr.onerror = function () {
                    _doOnComplete(oncomplete, 400, {});
                };
                // we will assume ontimeout means we need to retry the events.
                xdr.ontimeout = function () {
                    _doOnComplete(oncomplete, 500, {});
                };
                // https://cypressnorth.com/web-programming-and-development/internet-explorer-aborting-ajax-requests-fixed/
                // tslint:disable-next-line:no-empty
                xdr.onprogress = function () { };
                if (sync) {
                    xdr.send(payload.data);
                }
                else {
                    timeoutOverride.set(function () {
                        xdr.send(payload.data);
                    }, 0);
                }
            }
            function _fetchSendPost(payload, oncomplete, sync) {
                var _a;
                var theUrl = payload.urlString;
                var ignoreResponse = false;
                var responseHandled = false;
                var requestInit = (_a = {
                        body: payload.data,
                        method: STR_POST_METHOD
                    },
                    _a[STR_DISABLED_PROPERTY_NAME] = true,
                    _a);
                if (sync) {
                    requestInit.keepalive = true;
                    if (payload._sendReason === 2 /* SendRequestReason.Unload */) {
                        // As a sync request (during unload), it is unlikely that we will get a chance to process the response so
                        // just like beacon send assume that the events have been accepted and processed
                        ignoreResponse = true;
                        if (_addNoResponse) {
                            theUrl += _noResponseQs;
                        }
                    }
                }
                if (_sendCredentials) {
                    // Don't send credentials when URL is file://
                    requestInit.credentials = "include";
                }
                // Only add headers if there are headers to add, due to issue with some polyfills
                if (payload.headers && objKeys(payload.headers).length > 0) {
                    requestInit.headers = payload.headers;
                }
                fetch(theUrl, requestInit).then(function (response) {
                    var headerMap = {};
                    var responseText = STR_EMPTY;
                    var headers = response.headers;
                    if (headers) {
                        headers["forEach"](function (value, name) {
                            headerMap[name] = value;
                        });
                    }
                    if (response.body) {
                        response.text().then(function (text) {
                            responseText = text;
                        });
                    }
                    if (!responseHandled) {
                        responseHandled = true;
                        _doOnComplete(oncomplete, response.status, headerMap, responseText);
                        _handleCollectorResponse(responseText);
                    }
                })["catch"](function (error) {
                    // In case there is an error in the request. Set the status to 0
                    // so that the events can be retried later.
                    if (!responseHandled) {
                        responseHandled = true;
                        _doOnComplete(oncomplete, 0, {});
                    }
                });
                if (ignoreResponse && !responseHandled) {
                    // Assume success during unload processing
                    responseHandled = true;
                    _doOnComplete(oncomplete, 200, {});
                }
                if (!responseHandled && payload.timeout > 0) {
                    // Simulate timeout
                    timeoutOverride.set(function () {
                        if (!responseHandled) {
                            // Assume a 500 response (which will cause a retry)
                            responseHandled = true;
                            _doOnComplete(oncomplete, 500, {});
                        }
                    }, payload.timeout);
                }
            }
            function _xhrSendPost(payload, oncomplete, sync) {
                var theUrl = payload.urlString;
                function _appendHeader(theHeaders, xhr, name) {
                    if (!theHeaders[name] && xhr && xhr.getResponseHeader) {
                        var value = xhr.getResponseHeader(name);
                        if (value) {
                            theHeaders[name] = strTrim(value);
                        }
                    }
                    return theHeaders;
                }
                function _getAllResponseHeaders(xhr) {
                    var theHeaders = {};
                    if (!xhr.getAllResponseHeaders) {
                        // Firefox 2-63 doesn't have getAllResponseHeaders function but it does have getResponseHeader
                        // Only call these if getAllResponseHeaders doesn't exist, otherwise we can get invalid response errors
                        // as collector is not currently returning the correct header to allow JS to access these headers
                        theHeaders = _appendHeader(theHeaders, xhr, STR_TIME_DELTA_HEADER);
                        theHeaders = _appendHeader(theHeaders, xhr, STR_KILL_DURATION_HEADER);
                        theHeaders = _appendHeader(theHeaders, xhr, STR_KILL_DURATION_SECONDS_HEADER);
                    }
                    else {
                        theHeaders = _convertAllHeadersToMap(xhr.getAllResponseHeaders());
                    }
                    return theHeaders;
                }
                function xhrComplete(xhr, responseTxt) {
                    _doOnComplete(oncomplete, xhr.status, _getAllResponseHeaders(xhr), responseTxt);
                }
                if (sync && payload.disableXhrSync) {
                    sync = false;
                }
                var xhrRequest = openXhr(STR_POST_METHOD, theUrl, _sendCredentials, true, sync, payload.timeout);
                // Set custom headers (e.g. gzip) here (after open())
                objForEachKey(payload.headers, function (name, value) {
                    xhrRequest.setRequestHeader(name, value);
                });
                xhrRequest.onload = function () {
                    var response = _getResponseText(xhrRequest);
                    xhrComplete(xhrRequest, response);
                    _handleCollectorResponse(response);
                };
                xhrRequest.onerror = function () {
                    xhrComplete(xhrRequest);
                };
                xhrRequest.ontimeout = function () {
                    xhrComplete(xhrRequest);
                };
                xhrRequest.send(payload.data);
            }
            function _doOnComplete(oncomplete, status, headers, response) {
                try {
                    oncomplete(status, headers, response);
                }
                catch (e) {
                    _throwInternal(_logger, 2 /* eLoggingSeverity.WARNING */, 518 /* _eExtendedInternalMessageId.SendPostOnCompleteFailure */, dumpObj(e));
                }
            }
            function _beaconSendPost(payload, oncomplete, sync) {
                // Custom headers not supported in sendBeacon payload.headers would be ignored
                var internalPayloadData = payload;
                var status = 200;
                var thePayload = internalPayloadData._thePayload;
                var theUrl = payload.urlString + (_addNoResponse ? _noResponseQs : STR_EMPTY);
                try {
                    var nav_1 = getNavigator();
                    if (!nav_1.sendBeacon(theUrl, payload.data)) {
                        if (thePayload) {
                            // Failed to send entire payload so try and split data and try to send as much events as possible
                            var droppedBatches_1 = [];
                            arrForEach(thePayload.batches, function (theBatch) {
                                if (droppedBatches_1 && theBatch && theBatch.count() > 0) {
                                    var theEvents = theBatch.events();
                                    for (var lp = 0; lp < theEvents.length; lp++) {
                                        if (!nav_1.sendBeacon(theUrl, _serializer.getEventBlob(theEvents[lp]))) {
                                            // Can't send anymore, so split the batch and drop the rest
                                            droppedBatches_1.push(theBatch.split(lp));
                                            break;
                                        }
                                    }
                                }
                                else {
                                    // Remove all of the events from the existing batch in the payload as the copy includes the original
                                    droppedBatches_1.push(theBatch.split(0));
                                }
                            });
                            _sendBatchesNotification(droppedBatches_1, 8003 /* EventBatchNotificationReason.SizeLimitExceeded */, thePayload.sendType, true);
                        }
                        else {
                            status = 0;
                        }
                    }
                }
                catch (ex) {
                    _warnToConsole(_logger, "Failed to send telemetry using sendBeacon API. Ex:" + dumpObj(ex));
                    status = 0;
                }
                finally {
                    _doOnComplete(oncomplete, status, {}, STR_EMPTY);
                }
            }
            function _isBeaconPayload(sendType) {
                // Sync Fetch has the same payload limitation as sendBeacon -- 64kb limit, so treat both as a beacon send
                return sendType === 2 /* EventSendType.SendBeacon */ || sendType === 3 /* EventSendType.SyncFetch */;
            }
            function _adjustSendType(sendType) {
                if (_isUnloading && _isBeaconPayload(sendType)) {
                    sendType = 2 /* EventSendType.SendBeacon */;
                }
                return sendType;
            }
            _self.addQueryStringParameter = function (name, value) {
                for (var i = 0; i < _queryStringParameters.length; i++) {
                    if (_queryStringParameters[i].name === name) {
                        _queryStringParameters[i].value = value;
                        return;
                    }
                }
                _queryStringParameters.push({ name: name, value: value });
            };
            _self.addHeader = function (name, value) {
                _headers[name] = value;
            };
            _self.canSendRequest = function () {
                return _hasIdleConnection() && _clockSkewManager.allowRequestSending();
            };
            _self.sendQueuedRequests = function (sendType, sendReason) {
                if (isUndefined(sendType)) {
                    sendType = 0 /* EventSendType.Batched */;
                }
                if (_isUnloading) {
                    sendType = _adjustSendType(sendType);
                    sendReason = 2 /* SendRequestReason.Unload */;
                }
                if (_canSendPayload(_batchQueue, sendType, 0)) {
                    _sendBatches(_clearQueue(), 0, false, sendType, sendReason || 0 /* SendRequestReason.Undefined */);
                }
            };
            _self.isCompletelyIdle = function () {
                return !_paused && _outstandingRequests === 0 && _batchQueue.length === 0;
            };
            _self.setUnloading = function (value) {
                _isUnloading = value;
            };
            _self.addBatch = function (theBatch) {
                if (theBatch && theBatch.count() > 0) {
                    // Try and kill the event faster
                    if (_killSwitch.isTenantKilled(theBatch.iKey())) {
                        return false;
                    }
                    _batchQueue.push(theBatch);
                }
                return true;
            };
            /**
             * Queue all the remaining requests to be sent. The requests will be
             * sent using HTML5 Beacons if they are available.
             */
            _self.teardown = function () {
                if (_batchQueue.length > 0) {
                    _sendBatches(_clearQueue(), 0, true, 2 /* EventSendType.SendBeacon */, 2 /* SendRequestReason.Unload */);
                }
            };
            /**
             * Pause the sending of requests. No new requests will be sent.
             */
            _self.pause = function () {
                _paused = true;
            };
            /**
             * Resume the sending of requests.
             */
            _self.resume = function () {
                _paused = false;
                _self.sendQueuedRequests(0 /* EventSendType.Batched */, 4 /* SendRequestReason.Resumed */);
            };
            /**
             * Sends a request synchronously to the Aria collector. This api is used to send
             * a request containing a single immediate event.
             *
             * @param batch - The request to be sent.
             * @param sendReason   - The token used to send the request.
             */
            _self.sendSynchronousBatch = function (batch, sendType, sendReason) {
                // This will not take into account the max connections restriction. Since this is sync, we can
                // only send one of this request at a time and thus should not worry about multiple connections
                // being used to send synchronous events.
                // Increment active connection since we are still going to use a connection to send the request.
                if (batch && batch.count() > 0) {
                    if (isNullOrUndefined(sendType)) {
                        sendType = 1 /* EventSendType.Synchronous */;
                    }
                    if (_isUnloading) {
                        sendType = _adjustSendType(sendType);
                        sendReason = 2 /* SendRequestReason.Unload */;
                    }
                    // For sync requests we will not wait for the clock skew.
                    _sendBatches([batch], 0, false, sendType, sendReason || 0 /* SendRequestReason.Undefined */);
                }
            };
            function _hasIdleConnection() {
                return !_paused && _outstandingRequests < maxConnections;
            }
            function _clearQueue() {
                var theQueue = _batchQueue;
                _batchQueue = [];
                return theQueue;
            }
            function _canSendPayload(theBatches, sendType, retryCnt) {
                var result = false;
                if (theBatches && theBatches.length > 0 && !_paused && _sendInterfaces[sendType] && _serializer) {
                    // Always attempt to send synchronous events don't wait for idle or clockSkew
                    // and don't block retry requests if clockSkew is not yet set
                    result = (sendType !== 0 /* EventSendType.Batched */) || (_hasIdleConnection() && (retryCnt > 0 || _clockSkewManager.allowRequestSending()));
                }
                return result;
            }
            function _createDebugBatches(theBatches) {
                var values = {};
                if (theBatches) {
                    arrForEach(theBatches, function (theBatch, idx) {
                        values[idx] = {
                            iKey: theBatch.iKey(),
                            evts: theBatch.events()
                        };
                    });
                }
                return values;
            }
            function _sendBatches(theBatches, retryCount, isTeardown, sendType, sendReason) {
                if (!theBatches || theBatches.length === 0) {
                    // Nothing to do
                    return;
                }
                if (_paused) {
                    _sendBatchesNotification(theBatches, 1 /* EventBatchNotificationReason.Paused */, sendType);
                    return;
                }
                // Make sure that if we are unloading the sendType is a supported version
                sendType = _adjustSendType(sendType);
                try {
                    var orgBatches_1 = theBatches;
                    var isSynchronous_1 = sendType !== 0 /* EventSendType.Batched */;
                    doPerf(_core, function () { return "HttpManager:_sendBatches"; }, function (perfEvt) {
                        if (perfEvt) {
                            // Perf Monitoring is enabled, so create a "Quick" copy of the original batches so we still report
                            // the original values as part of the perfEvent. This is because theBatches uses .shift() to remove each
                            // batch as they are processed - removing from the original array, so by the time the _createDebugBatches()
                            // function is called the passed in value has changed and therefore the reported value for the perfEvent is incorrect
                            theBatches = theBatches.slice(0);
                        }
                        var droppedBatches = [];
                        var thePayload = null;
                        var serializationStart = getTime();
                        var sendInterface = _sendInterfaces[sendType] || (isSynchronous_1 ? _sendInterfaces[1 /* EventSendType.Synchronous */] : _sendInterfaces[0 /* EventSendType.Batched */]);
                        var sendTransport = sendInterface && sendInterface._transport;
                        // Sync Fetch has the same payload limitation as sendBeacon -- 64kb limit
                        var isReducedPayload = _canHaveReducedPayload && (_isUnloading || _isBeaconPayload(sendType) || (sendTransport === 3 /* TransportType.Beacon */ || (sendInterface._isSync && sendTransport === 2 /* TransportType.Fetch */)));
                        while (_canSendPayload(theBatches, sendType, retryCount)) {
                            var theBatch = theBatches.shift();
                            if (theBatch && theBatch.count() > 0) {
                                if (!_killSwitch.isTenantKilled(theBatch.iKey())) {
                                    // Make sure we have a payload object
                                    thePayload = thePayload || _serializer.createPayload(retryCount, isTeardown, isSynchronous_1, isReducedPayload, sendReason, sendType);
                                    // Add the batch to the current payload
                                    if (!_serializer.appendPayload(thePayload, theBatch, maxEventsPerBatch)) {
                                        // Entire batch was not added so send the payload and retry adding this batch
                                        _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                                        serializationStart = getTime();
                                        theBatches = [theBatch].concat(theBatches);
                                        thePayload = null;
                                    }
                                    else if (thePayload.overflow !== null) {
                                        // Total Payload size was exceeded so send the payload and add the unsent as the next batch to send
                                        theBatches = [thePayload.overflow].concat(theBatches);
                                        thePayload.overflow = null;
                                        _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                                        serializationStart = getTime();
                                        thePayload = null;
                                    }
                                }
                                else {
                                    droppedBatches.push(theBatch);
                                }
                            }
                        }
                        // Make sure to flush any remaining payload
                        if (thePayload) {
                            _doPayloadSend(thePayload, serializationStart, getTime(), sendReason);
                        }
                        if (theBatches.length > 0) {
                            // Add any unsent batches back to the head of the queue
                            _batchQueue = theBatches.concat(_batchQueue);
                        }
                        // Now send notification about any dropped events
                        _sendBatchesNotification(droppedBatches, 8004 /* EventBatchNotificationReason.KillSwitch */, sendType);
                    }, function () { return ({ batches: _createDebugBatches(orgBatches_1), retryCount: retryCount, isTeardown: isTeardown, isSynchronous: isSynchronous_1, sendReason: sendReason, useSendBeacon: _isBeaconPayload(sendType), sendType: sendType }); }, !isSynchronous_1);
                }
                catch (ex) {
                    _throwInternal(_logger, 2 /* eLoggingSeverity.WARNING */, 48 /* _eInternalMessageId.CannotSerializeObject */, "Unexpected Exception sending batch: " + dumpObj(ex));
                }
            }
            function _buildRequestDetails(thePayload, useHeaders) {
                var requestDetails = {
                    url: _urlString,
                    hdrs: {},
                    useHdrs: false // Assume no headers
                };
                if (!useHeaders) {
                    // Attempt to map headers to a query string if possible
                    objForEachKey(_headers, function (name, value) {
                        if (_collectorHeaderToQs[name]) {
                            _addRequestDetails(requestDetails, _collectorHeaderToQs[name], value, false);
                        }
                        else {
                            // No mapping, so just include in the headers anyway (may not get sent if using sendBeacon())
                            requestDetails.hdrs[name] = value;
                            requestDetails.useHdrs = true;
                        }
                    });
                }
                else {
                    // Copy the pre-defined headers into the payload headers
                    requestDetails.hdrs = extend(requestDetails.hdrs, _headers);
                    requestDetails.useHdrs = (objKeys(requestDetails.hdrs).length > 0);
                }
                _addRequestDetails(requestDetails, STR_CLIENT_ID, "NO_AUTH", useHeaders);
                _addRequestDetails(requestDetails, STR_CLIENT_VERSION, FullVersionString, useHeaders);
                var apiQsKeys = STR_EMPTY;
                arrForEach(thePayload.apiKeys, function (apiKey) {
                    if (apiQsKeys.length > 0) {
                        apiQsKeys += ",";
                    }
                    apiQsKeys += apiKey;
                });
                _addRequestDetails(requestDetails, STR_API_KEY, apiQsKeys, useHeaders);
                _addRequestDetails(requestDetails, STR_UPLOAD_TIME, dateNow().toString(), useHeaders);
                var msfpc = _getMsfpc(thePayload);
                if (isValueAssigned(msfpc)) {
                    requestDetails.url += "&ext.intweb.msfpc=" + msfpc;
                }
                if (_clockSkewManager.shouldAddClockSkewHeaders()) {
                    _addRequestDetails(requestDetails, STR_TIME_DELTA_TO_APPLY, _clockSkewManager.getClockSkewHeaderValue(), useHeaders);
                }
                if (_core.getWParam) {
                    var wParam = _core.getWParam();
                    if (wParam >= 0) {
                        requestDetails.url += "&w=" + wParam;
                    }
                }
                for (var i = 0; i < _queryStringParameters.length; i++) {
                    requestDetails.url += "&" + _queryStringParameters[i].name + "=" + _queryStringParameters[i].value;
                }
                return requestDetails;
            }
            function _setTimingValue(timings, name, value) {
                timings[name] = timings[name] || {};
                timings[name][_postManager.identifier] = value;
            }
            function _doPayloadSend(thePayload, serializationStart, serializationCompleted, sendReason) {
                if (thePayload && thePayload.payloadBlob && thePayload.payloadBlob.length > 0) {
                    var useSendHook_1 = !!_self.sendHook;
                    var sendInterface_1 = _sendInterfaces[thePayload.sendType];
                    // Send all data using a beacon style transport if closing mode is on or channel was teared down
                    if (!_isBeaconPayload(thePayload.sendType) && thePayload.isBeacon && thePayload.sendReason === 2 /* SendRequestReason.Unload */) {
                        sendInterface_1 = _sendInterfaces[2 /* EventSendType.SendBeacon */] || _sendInterfaces[3 /* EventSendType.SyncFetch */] || sendInterface_1;
                    }
                    var useHeaders_1 = _useHeaders;
                    // Disable header usage if we know we are using sendBeacon as additional headers are not supported
                    if (thePayload.isBeacon || sendInterface_1._transport === 3 /* TransportType.Beacon */) {
                        useHeaders_1 = false;
                    }
                    var requestDetails_1 = _buildRequestDetails(thePayload, useHeaders_1);
                    useHeaders_1 = useHeaders_1 || requestDetails_1.useHdrs;
                    var sendEventStart_1 = getTime();
                    doPerf(_core, function () { return "HttpManager:_doPayloadSend"; }, function () {
                        // Increment the send attempt count and add timings after packaging (So it's not serialized in the 1st attempt)
                        for (var batchLp = 0; batchLp < thePayload.batches.length; batchLp++) {
                            var theBatch = thePayload.batches[batchLp];
                            var theEvents = theBatch.events();
                            for (var evtLp = 0; evtLp < theEvents.length; evtLp++) {
                                var telemetryItem = theEvents[evtLp];
                                if (_enableEventTimings) {
                                    var timings = telemetryItem.timings = telemetryItem.timings || {};
                                    _setTimingValue(timings, "sendEventStart", sendEventStart_1);
                                    _setTimingValue(timings, "serializationStart", serializationStart);
                                    _setTimingValue(timings, "serializationCompleted", serializationCompleted);
                                }
                                telemetryItem[strSendAttempt] > 0 ? telemetryItem[strSendAttempt]++ : telemetryItem[strSendAttempt] = 1;
                            }
                        }
                        // Note: always sending this notification in a synchronous manner.
                        _sendBatchesNotification(thePayload.batches, (1000 /* EventBatchNotificationReason.SendingUndefined */ + (sendReason || 0 /* SendRequestReason.Undefined */)), thePayload.sendType, true);
                        // Disabling the use of const because of Issue: 
                        // - Task 9227844: [1DS] Some environments and packagers automatically "freeze" objects which are defined as const which causes any mutations to throw
                        // eslint-disable-next-line prefer-const
                        var orgPayloadData = {
                            data: thePayload.payloadBlob,
                            urlString: requestDetails_1.url,
                            headers: requestDetails_1.hdrs,
                            _thePayload: thePayload,
                            _sendReason: sendReason,
                            timeout: _xhrTimeout,
                            disableXhrSync: _disableXhrSync,
                            disableFetchKeepAlive: _disableFetchKeepAlive
                        };
                        // Only automatically add the following headers if already sending headers and we are not attempting to avoid an options call
                        if (useHeaders_1) {
                            if (!_hasHeader(orgPayloadData.headers, STR_CACHE_CONTROL)) {
                                orgPayloadData.headers[STR_CACHE_CONTROL] = DEFAULT_CACHE_CONTROL;
                            }
                            if (!_hasHeader(orgPayloadData.headers, STR_CONTENT_TYPE_HEADER)) {
                                orgPayloadData.headers[STR_CONTENT_TYPE_HEADER] = DEFAULT_CONTENT_TYPE;
                            }
                        }
                        var sender = null;
                        if (sendInterface_1) {
                            // Send sync requests if the request is immediate or we are tearing down telemetry.
                            sender = function (payload) {
                                // Notify the clock skew manager that we are sending the first request (Potentially blocking all further requests)
                                _clockSkewManager.firstRequestSent();
                                var onComplete = function (status, headers) {
                                    _retryRequestIfNeeded(status, headers, thePayload, sendReason);
                                };
                                var isSync = thePayload.isTeardown || thePayload.isSync;
                                try {
                                    sendInterface_1.sendPOST(payload, onComplete, isSync);
                                    if (_self.sendListener) {
                                        // Send the original payload to the listener
                                        _self.sendListener(orgPayloadData, payload, isSync, thePayload.isBeacon);
                                    }
                                }
                                catch (ex) {
                                    _warnToConsole(_logger, "Unexpected exception sending payload. Ex:" + dumpObj(ex));
                                    _doOnComplete(onComplete, 0, {});
                                }
                            };
                        }
                        doPerf(_core, function () { return "HttpManager:_doPayloadSend.sender"; }, function () {
                            if (sender) {
                                if (thePayload.sendType === 0 /* EventSendType.Batched */) {
                                    _outstandingRequests++;
                                }
                                // Only call the hook if it's defined and we are not using sendBeacon as additional headers are not supported
                                if (useSendHook_1 && !thePayload.isBeacon && sendInterface_1._transport !== 3 /* TransportType.Beacon */) {
                                    // Create a new IPayloadData that is sent into the hook method, so that the hook method
                                    // can't change the object references to the orgPayloadData (it can still change the content -- mainly the headers)
                                    // Disabling the use of const because of Issue: 
                                    // - Task 9227844: [1DS] Some environments and packagers automatically "freeze" objects which are defined as const which causes any mutations to throw
                                    // eslint-disable-next-line prefer-const
                                    var hookData_1 = {
                                        data: orgPayloadData.data,
                                        urlString: orgPayloadData.urlString,
                                        headers: extend({}, orgPayloadData.headers),
                                        timeout: orgPayloadData.timeout,
                                        disableXhrSync: orgPayloadData.disableXhrSync,
                                        disableFetchKeepAlive: orgPayloadData.disableFetchKeepAlive
                                    };
                                    var senderCalled_1 = false;
                                    doPerf(_core, function () { return "HttpManager:_doPayloadSend.sendHook"; }, function () {
                                        try {
                                            _self.sendHook(hookData_1, function (payload) {
                                                senderCalled_1 = true;
                                                // Add back the internal properties
                                                if (!_customHttpInterface && !payload._thePayload) {
                                                    payload._thePayload = payload._thePayload || orgPayloadData._thePayload;
                                                    payload._sendReason = payload._sendReason || orgPayloadData._sendReason;
                                                }
                                                sender(payload);
                                            }, thePayload.isSync || thePayload.isTeardown);
                                        }
                                        catch (ex) {
                                            if (!senderCalled_1) {
                                                // The hook never called the sender -- assume that it never will
                                                sender(orgPayloadData);
                                            }
                                        }
                                    });
                                }
                                else {
                                    sender(orgPayloadData);
                                }
                            }
                        });
                    }, function () { return ({ thePayload: thePayload, serializationStart: serializationStart, serializationCompleted: serializationCompleted, sendReason: sendReason }); }, thePayload.isSync);
                }
                if (thePayload.sizeExceed && thePayload.sizeExceed.length > 0) {
                    // Ensure that we send any discard events for oversize events even when there was no payload to send
                    _sendBatchesNotification(thePayload.sizeExceed, 8003 /* EventBatchNotificationReason.SizeLimitExceeded */, thePayload.sendType);
                }
                if (thePayload.failedEvts && thePayload.failedEvts.length > 0) {
                    // Ensure that we send any discard events for events that could not be serialized even when there was no payload to send
                    _sendBatchesNotification(thePayload.failedEvts, 8002 /* EventBatchNotificationReason.InvalidEvent */, thePayload.sendType);
                }
            }
            function _addEventCompletedTimings(theEvents, sendEventCompleted) {
                if (_enableEventTimings) {
                    arrForEach(theEvents, function (theEvent) {
                        var timings = theEvent.timings = theEvent.timings || {};
                        _setTimingValue(timings, "sendEventCompleted", sendEventCompleted);
                    });
                }
            }
            function _retryRequestIfNeeded(status, headers, thePayload, sendReason) {
                var reason = 9000 /* EventBatchNotificationReason.ResponseFailure */;
                var droppedBatches = null;
                var isRetrying = false;
                var backOffTrans = false;
                try {
                    var shouldRetry = true;
                    if (typeof status !== strUndefined) {
                        if (headers) {
                            _clockSkewManager.setClockSkew(headers[STR_TIME_DELTA_HEADER]);
                            var killDuration = headers[STR_KILL_DURATION_HEADER] || headers["kill-duration-seconds"];
                            arrForEach(_killSwitch.setKillSwitchTenants(headers[STR_KILL_TOKENS_HEADER], killDuration), function (killToken) {
                                arrForEach(thePayload.batches, function (theBatch) {
                                    if (theBatch.iKey() === killToken) {
                                        // Make sure we have initialized the array
                                        droppedBatches = droppedBatches || [];
                                        // Create a copy of the batch with all of the events (and more importantly the action functions)
                                        var removedEvents = theBatch.split(0);
                                        // And then remove the events for the payload batch and reduce the actual number of processed
                                        thePayload.numEvents -= removedEvents.count();
                                        droppedBatches.push(removedEvents);
                                    }
                                });
                            });
                        }
                        // Disabling triple-equals rule to avoid httpOverrides from failing because they are returning a string value
                        // tslint:disable-next-line:triple-equals
                        if (status == 200 || status == 204) {
                            // Response was successfully sent
                            reason = 200 /* EventBatchNotificationReason.Complete */;
                            return;
                        }
                        if (!retryPolicyShouldRetryForStatus(status) || thePayload.numEvents <= 0) {
                            // Only retry for specific response codes and if there is still events after kill switch processing
                            shouldRetry = false;
                        }
                        // Derive the notification response from the HttpStatus Code
                        reason = 9000 /* EventBatchNotificationReason.ResponseFailure */ + (status % 1000);
                    }
                    if (shouldRetry) {
                        // The events should be retried -- so change notification to requeue them
                        reason = 100 /* EventBatchNotificationReason.RequeueEvents */;
                        var retryCount_1 = thePayload.retryCnt;
                        if (thePayload.sendType === 0 /* EventSendType.Batched */) {
                            // attempt to resend the entire batch
                            if (retryCount_1 < maxRequestRetriesBeforeBackoff) {
                                isRetrying = true;
                                _doAction(function () {
                                    // try to resend the same batches
                                    if (thePayload.sendType === 0 /* EventSendType.Batched */) {
                                        // Reduce the outstanding request count (if this was an async request) as we didn't reduce the count
                                        // previously and we are about to reschedule our retry attempt and we want an attempt to send
                                        // to occur, it's also required to ensure that a follow up handleRequestFinished() call occurs
                                        _outstandingRequests--;
                                    }
                                    _sendBatches(thePayload.batches, retryCount_1 + 1, thePayload.isTeardown, _isUnloading ? 2 /* EventSendType.SendBeacon */ : thePayload.sendType, 5 /* SendRequestReason.Retry */);
                                }, _isUnloading, retryPolicyGetMillisToBackoffForRetry(retryCount_1));
                            }
                            else {
                                backOffTrans = true;
                                if (_isUnloading) {
                                    // we are unloading so don't try and requeue the events otherwise let the events get requeued and resent during the backoff sending
                                    // This will also cause the events to be purged based on the priority (if necessary)
                                    reason = 8001 /* EventBatchNotificationReason.NonRetryableStatus */;
                                }
                            }
                        }
                    }
                }
                finally {
                    if (!isRetrying) {
                        // Make sure the clockSkewManager doesn't blocking further sending of requests once we have a proper response
                        // This won't override any previously sent clock Skew value
                        _clockSkewManager.setClockSkew();
                        _handleRequestFinished(thePayload, reason, sendReason, backOffTrans);
                    }
                    _sendBatchesNotification(droppedBatches, 8004 /* EventBatchNotificationReason.KillSwitch */, thePayload.sendType);
                }
            }
            function _handleRequestFinished(thePayload, batchReason, sendReason, backOffTrans) {
                try {
                    if (backOffTrans) {
                        // Slow down the transmission requests
                        _postManager._backOffTransmission();
                    }
                    if (batchReason === 200 /* EventBatchNotificationReason.Complete */) {
                        if (!backOffTrans && !thePayload.isSync) {
                            // We have a successful async response, so the lets open the floodgates
                            // The reason for checking isSync is to avoid unblocking if beacon send occurred as it
                            // doesn't wait for a response.
                            _postManager._clearBackOff();
                        }
                        _addCompleteTimings(thePayload.batches);
                    }
                    // Send the notifications synchronously
                    _sendBatchesNotification(thePayload.batches, batchReason, thePayload.sendType, true);
                }
                finally {
                    if (thePayload.sendType === 0 /* EventSendType.Batched */) {
                        // we always need to decrement this value otherwise the httpmanager locks up and won't send any more events
                        _outstandingRequests--;
                        // Don't try to send additional queued events if this is a retry operation as the retried
                        // response will eventually call _handleRequestFinished for the retried event
                        if (sendReason !== 5 /* SendRequestReason.Retry */) {
                            // Try and send any other queued batched events
                            _self.sendQueuedRequests(thePayload.sendType, sendReason);
                        }
                    }
                }
            }
            function _addCompleteTimings(theBatches) {
                if (_enableEventTimings) {
                    var sendEventCompleted_1 = getTime();
                    arrForEach(theBatches, function (theBatch) {
                        if (theBatch && theBatch.count() > 0) {
                            _addEventCompletedTimings(theBatch.events(), sendEventCompleted_1);
                        }
                    });
                }
            }
            function _doAction(cb, isSync, interval) {
                if (isSync) {
                    cb();
                }
                else {
                    timeoutOverride.set(cb, interval);
                }
            }
            /**
            * Converts the XHR getAllResponseHeaders to a map containing the header key and value.
            */
            // tslint:disable-next-line: align
            function _convertAllHeadersToMap(headersString) {
                var headers = {};
                if (isString(headersString)) {
                    var headersArray = strTrim(headersString).split(/[\r\n]+/);
                    arrForEach(headersArray, function (headerEntry) {
                        if (headerEntry) {
                            var idx = headerEntry.indexOf(": ");
                            if (idx !== -1) {
                                // The new spec has the headers returning all as lowercase -- but not all browsers do this yet
                                var header = strTrim(headerEntry.substring(0, idx)).toLowerCase();
                                var value = strTrim(headerEntry.substring(idx + 1));
                                headers[header] = value;
                            }
                            else {
                                headers[strTrim(headerEntry)] = 1;
                            }
                        }
                    });
                }
                return headers;
            }
            function _getMsfpc(thePayload) {
                for (var lp = 0; lp < thePayload.batches.length; lp++) {
                    var msfpc = thePayload.batches[lp].Msfpc();
                    if (msfpc) {
                        return encodeURIComponent(msfpc);
                    }
                }
                return STR_EMPTY;
            }
            function _handleCollectorResponse(responseText) {
                var responseHandlers = _self._responseHandlers;
                try {
                    for (var i = 0; i < responseHandlers.length; i++) {
                        try {
                            responseHandlers[i](responseText);
                        }
                        catch (e) {
                            _throwInternal(_logger, 1 /* eLoggingSeverity.CRITICAL */, 519 /* _eExtendedInternalMessageId.PostResponseHandler */, "Response handler failed: " + e);
                        }
                    }
                    if (responseText) {
                        var response = JSON.parse(responseText);
                        if (isValueAssigned(response.webResult) && isValueAssigned(response.webResult[STR_MSFPC])) {
                            // Set cookie
                            _cookieMgr.set("MSFPC", response.webResult[STR_MSFPC], 365 * 86400);
                        }
                    }
                }
                catch (ex) {
                    // Doing nothing
                }
            }
            function _sendBatchesNotification(theBatches, batchReason, sendType, sendSync) {
                if (theBatches && theBatches.length > 0 && actions) {
                    var theAction_1 = actions[_getNotificationAction(batchReason)];
                    if (theAction_1) {
                        var isSyncRequest_1 = sendType !== 0 /* EventSendType.Batched */;
                        doPerf(_core, function () { return "HttpManager:_sendBatchesNotification"; }, function () {
                            _doAction(function () {
                                try {
                                    theAction_1.call(actions, theBatches, batchReason, isSyncRequest_1, sendType);
                                }
                                catch (e) {
                                    _throwInternal(_logger, 1 /* eLoggingSeverity.CRITICAL */, 74 /* _eInternalMessageId.NotificationException */, "send request notification failed: " + e);
                                }
                            }, sendSync || isSyncRequest_1, 0);
                        }, function () { return ({ batches: _createDebugBatches(theBatches), reason: batchReason, isSync: isSyncRequest_1, sendSync: sendSync, sendType: sendType }); }, !isSyncRequest_1);
                    }
                }
            }
            function _getNotificationAction(reason) {
                var action = _eventActionMap[reason];
                if (!isValueAssigned(action)) {
                    action = STR_OTHER;
                    if (reason >= 9000 /* EventBatchNotificationReason.ResponseFailure */ && reason <= 9999 /* EventBatchNotificationReason.ResponseFailureMax */) {
                        action = STR_RESPONSE_FAIL;
                    }
                    else if (reason >= 8000 /* EventBatchNotificationReason.EventsDropped */ && reason <= 8999 /* EventBatchNotificationReason.EventsDroppedMax */) {
                        action = STR_DROPPED;
                    }
                    else if (reason >= 1000 /* EventBatchNotificationReason.SendingUndefined */ && reason <= 1999 /* EventBatchNotificationReason.SendingEventMax */) {
                        action = STR_SENDING;
                    }
                }
                return action;
            }
        });
    }
// Removed Stub for HttpManager.prototype.initialize.
// Removed Stub for HttpManager.prototype.addQueryStringParameter.
// Removed Stub for HttpManager.prototype.addHeader.
// Removed Stub for HttpManager.prototype.addBatch.
// Removed Stub for HttpManager.prototype.canSendRequest.
// Removed Stub for HttpManager.prototype.sendQueuedRequests.
// Removed Stub for HttpManager.prototype.isCompletelyIdle.
// Removed Stub for HttpManager.prototype.setUnloading.
// Removed Stub for HttpManager.prototype.teardown.
// Removed Stub for HttpManager.prototype.pause.
// Removed Stub for HttpManager.prototype.resume.
// Removed Stub for HttpManager.prototype.sendSynchronousBatch.
    // This is a workaround for an IE8 bug when using dynamicProto() with classes that don't have any
    // non-dynamic functions or static properties/functions when using uglify-js to minify the resulting code.
    // this will be removed when ES3 support is dropped.
    HttpManager.__ieDyn=1;

    return HttpManager;
}());
export { HttpManager };