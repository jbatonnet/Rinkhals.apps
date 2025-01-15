/*
 * 1DS JS SDK POST plugin, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* Serializer.ts
* @author Abhilash Panwar (abpanwar); Hector Hernandez (hectorh); Nev Wylie (newylie)
* @copyright Microsoft 2018-2020
*/
// @skip-file-minify
import dynamicProto from "@microsoft/dynamicproto-js";
import { arrIndexOf, doPerf, getCommonSchemaMetaData, getTenantId, isArray, isValueAssigned, objForEachKey, sanitizeProperty, strStartsWith } from "@microsoft/1ds-core-js";
import { EventBatch } from "./EventBatch";
import { STR_EMPTY } from "./InternalConstants";
/**
 * Note: This is an optimization for V8-based browsers. When V8 concatenates a string,
 * the strings are only joined logically using a "cons string" or "constructed/concatenated
 * string". These containers keep references to one another and can result in very large
 * memory usage. For example, if a 2MB string is constructed by concatenating 4 bytes
 * together at a time, the memory usage will be ~44MB; so ~22x increase. The strings are
 * only joined together when an operation requiring their joining takes place, such as
 * substr(). This function is called when adding data to this buffer to ensure these
 * types of strings are periodically joined to reduce the memory footprint.
 * Setting to every 20 events as the JSON.stringify() may have joined many strings
 * and calling this too much causes a minor delay while processing.
 */
var _MAX_STRING_JOINS = 20;
var RequestSizeLimitBytes = 3984588; // approx 3.8 Mb
var BeaconRequestSizeLimitBytes = 65000; // approx 64kb (the current Edge, Firefox and Chrome max limit)
var MaxRecordSize = 2000000; // approx 2 Mb
var MaxBeaconRecordSize = Math.min(MaxRecordSize, BeaconRequestSizeLimitBytes);
var metadata = "metadata";
var f = "f";
var rCheckDot = /\./;
/**
* Class to handle serialization of event and request.
* Currently uses Bond for serialization. Please note that this may be subject to change.
*/
var Serializer = /** @class */ (function () {
    function Serializer(perfManager, valueSanitizer, stringifyObjects, enableCompoundKey) {
        var strData = "data";
        var strBaseData = "baseData";
        var strExt = "ext";
        var _checkForCompoundkey = !!enableCompoundKey;
        var _processSubMetaData = true;
        var _theSanitizer = valueSanitizer;
        var _isReservedCache = {};
        dynamicProto(Serializer, this, function (_self) {
            _self.createPayload = function (retryCnt, isTeardown, isSync, isReducedPayload, sendReason, sendType) {
                return {
                    apiKeys: [],
                    payloadBlob: STR_EMPTY,
                    overflow: null,
                    sizeExceed: [],
                    failedEvts: [],
                    batches: [],
                    numEvents: 0,
                    retryCnt: retryCnt,
                    isTeardown: isTeardown,
                    isSync: isSync,
                    isBeacon: isReducedPayload,
                    sendType: sendType,
                    sendReason: sendReason
                };
            };
            _self.appendPayload = function (payload, theBatch, maxEventsPerBatch) {
                var canAddEvents = payload && theBatch && !payload.overflow;
                if (canAddEvents) {
                    doPerf(perfManager, function () { return "Serializer:appendPayload"; }, function () {
                        var theEvents = theBatch.events();
                        var payloadBlob = payload.payloadBlob;
                        var payloadEvents = payload.numEvents;
                        var eventsAdded = false;
                        var sizeExceeded = [];
                        var failedEvts = [];
                        var isBeaconPayload = payload.isBeacon;
                        var requestMaxSize = isBeaconPayload ? BeaconRequestSizeLimitBytes : RequestSizeLimitBytes;
                        var recordMaxSize = isBeaconPayload ? MaxBeaconRecordSize : MaxRecordSize;
                        var lp = 0;
                        var joinCount = 0;
                        while (lp < theEvents.length) {
                            var theEvent = theEvents[lp];
                            if (theEvent) {
                                if (payloadEvents >= maxEventsPerBatch) {
                                    // Maximum events per payload reached, so don't add any more
                                    payload.overflow = theBatch.split(lp);
                                    break;
                                }
                                var eventBlob = _self.getEventBlob(theEvent);
                                if (eventBlob && eventBlob.length <= recordMaxSize) {
                                    // This event will fit into the payload
                                    var blobLength = eventBlob.length;
                                    var currentSize = payloadBlob.length;
                                    if (currentSize + blobLength > requestMaxSize) {
                                        // Request or batch size exceeded, so don't add any more to the payload
                                        payload.overflow = theBatch.split(lp);
                                        break;
                                    }
                                    if (payloadBlob) {
                                        payloadBlob += "\n";
                                    }
                                    payloadBlob += eventBlob;
                                    joinCount++;
                                    // v8 memory optimization only
                                    if (joinCount > _MAX_STRING_JOINS) {
                                        // this substr() should cause the constructed string to join
                                        payloadBlob.substr(0, 1);
                                        joinCount = 0;
                                    }
                                    eventsAdded = true;
                                    payloadEvents++;
                                }
                                else {
                                    if (eventBlob) {
                                        // Single event size exceeded so remove from the batch
                                        sizeExceeded.push(theEvent);
                                    }
                                    else {
                                        failedEvts.push(theEvent);
                                    }
                                    // We also need to remove this event from the existing array, otherwise a notification will be sent
                                    // indicating that it was successfully sent
                                    theEvents.splice(lp, 1);
                                    lp--;
                                }
                            }
                            lp++;
                        }
                        if (sizeExceeded && sizeExceeded.length > 0) {
                            payload.sizeExceed.push(EventBatch.create(theBatch.iKey(), sizeExceeded));
                            // Remove the exceeded events from the batch
                        }
                        if (failedEvts && failedEvts.length > 0) {
                            payload.failedEvts.push(EventBatch.create(theBatch.iKey(), failedEvts));
                            // Remove the failed events from the batch
                        }
                        if (eventsAdded) {
                            payload.batches.push(theBatch);
                            payload.payloadBlob = payloadBlob;
                            payload.numEvents = payloadEvents;
                            var apiKey = theBatch.iKey();
                            if (arrIndexOf(payload.apiKeys, apiKey) === -1) {
                                payload.apiKeys.push(apiKey);
                            }
                        }
                    }, function () { return ({ payload: payload, theBatch: { iKey: theBatch.iKey(), evts: theBatch.events() }, max: maxEventsPerBatch }); });
                }
                return canAddEvents;
            };
            _self.getEventBlob = function (eventData) {
                try {
                    return doPerf(perfManager, function () { return "Serializer.getEventBlob"; }, function () {
                        var serializedEvent = {};
                        // Adding as dynamic keys for v8 performance
                        serializedEvent.name = eventData.name;
                        serializedEvent.time = eventData.time;
                        serializedEvent.ver = eventData.ver;
                        serializedEvent.iKey = "o:" + getTenantId(eventData.iKey);
                        // Assigning local var so usage in part b/c don't throw if there is no ext
                        var serializedExt = {};
                        // Part A
                        var eventExt = eventData[strExt];
                        if (eventExt) {
                            // Only assign ext if the event had one (There are tests covering this use case)
                            serializedEvent[strExt] = serializedExt;
                            objForEachKey(eventExt, function (key, value) {
                                var data = serializedExt[key] = {};
                                // Don't include a metadata callback as we don't currently set metadata Part A fields
                                _processPathKeys(value, data, "ext." + key, true, null, null, true);
                            });
                        }
                        var serializedData = serializedEvent[strData] = {};
                        serializedData.baseType = eventData.baseType;
                        var serializedBaseData = serializedData[strBaseData] = {};
                        // Part B
                        _processPathKeys(eventData.baseData, serializedBaseData, strBaseData, false, [strBaseData], function (pathKeys, name, value) {
                            _addJSONPropertyMetaData(serializedExt, pathKeys, name, value);
                        }, _processSubMetaData);
                        // Part C
                        _processPathKeys(eventData.data, serializedData, strData, false, [], function (pathKeys, name, value) {
                            _addJSONPropertyMetaData(serializedExt, pathKeys, name, value);
                        }, _processSubMetaData);
                        return JSON.stringify(serializedEvent);
                    }, function () { return ({ item: eventData }); });
                }
                catch (e) {
                    return null;
                }
            };
            function _isReservedField(path, name) {
                var result = _isReservedCache[path];
                if (result === undefined) {
                    if (path.length >= 7) {
                        // Do not allow the changing of fields located in the ext.metadata or ext.web extension
                        result = strStartsWith(path, "ext.metadata") || strStartsWith(path, "ext.web");
                    }
                    _isReservedCache[path] = result;
                }
                return result;
            }
            function _processPathKeys(srcObj, target, thePath, checkReserved, metadataPathKeys, metadataCallback, processSubKeys) {
                objForEachKey(srcObj, function (key, srcValue) {
                    var prop = null;
                    if (srcValue || isValueAssigned(srcValue)) {
                        var path = thePath;
                        var name_1 = key;
                        var theMetaPathKeys = metadataPathKeys;
                        var destObj = target;
                        // Handle keys with embedded '.', like "TestObject.testProperty"
                        if (_checkForCompoundkey && !checkReserved && rCheckDot.test(key)) {
                            var subKeys = key.split(".");
                            var keyLen = subKeys.length;
                            if (keyLen > 1) {
                                if (theMetaPathKeys) {
                                    // Create a copy of the meta path keys so we can add the extra ones
                                    theMetaPathKeys = theMetaPathKeys.slice();
                                }
                                for (var lp = 0; lp < keyLen - 1; lp++) {
                                    var subKey = subKeys[lp];
                                    // Add/reuse the sub key object
                                    destObj = destObj[subKey] = destObj[subKey] || {};
                                    path += "." + subKey;
                                    if (theMetaPathKeys) {
                                        theMetaPathKeys.push(subKey);
                                    }
                                }
                                name_1 = subKeys[keyLen - 1];
                            }
                        }
                        var isReserved = checkReserved && _isReservedField(path, name_1);
                        if (!isReserved && _theSanitizer && _theSanitizer.handleField(path, name_1)) {
                            prop = _theSanitizer.value(path, name_1, srcValue, stringifyObjects);
                        }
                        else {
                            prop = sanitizeProperty(name_1, srcValue, stringifyObjects);
                        }
                        if (prop) {
                            // Set the value
                            var newValue = prop.value;
                            destObj[name_1] = newValue;
                            if (metadataCallback) {
                                metadataCallback(theMetaPathKeys, name_1, prop);
                            }
                            if (processSubKeys && typeof newValue === "object" && !isArray(newValue)) {
                                var newPath = theMetaPathKeys;
                                if (newPath) {
                                    newPath = newPath.slice();
                                    newPath.push(name_1);
                                }
                                // Make sure we process sub objects as well (for value sanitization and metadata)
                                _processPathKeys(srcValue, newValue, path + "." + name_1, checkReserved, newPath, metadataCallback, processSubKeys);
                            }
                        }
                    }
                });
            }
        });
    }
// Removed Stub for Serializer.prototype.createPayload.
// Removed Stub for Serializer.prototype.appendPayload.
// Removed Stub for Serializer.prototype.getEventBlob.
// Removed Stub for Serializer.prototype.handleField.
// Removed Stub for Serializer.prototype.getSanitizer.
    // This is a workaround for an IE8 bug when using dynamicProto() with classes that don't have any
    // non-dynamic functions or static properties/functions when using uglify-js to minify the resulting code.
    // this will be removed when ES3 support is dropped.
    Serializer.__ieDyn=1;

    return Serializer;
}());
export { Serializer };
/**
 * @ignore
 */
function _addJSONPropertyMetaData(json, propKeys, name, propertyValue) {
    if (propertyValue && json) {
        var encodedTypeValue = getCommonSchemaMetaData(propertyValue.value, propertyValue.kind, propertyValue.propertyType);
        if (encodedTypeValue > -1) {
            // Add the root metadata
            var metaData = json[metadata];
            if (!metaData) {
                // Sets the root 'f'
                metaData = json[metadata] = { f: {} };
            }
            var metaTarget = metaData[f];
            if (!metaTarget) {
                // This can occur if someone has manually added an ext.metadata object
                // Such as ext.metadata.privLevel and ext.metadata.privTags
                metaTarget = metaData[f] = {};
            }
            // Traverse the metadata path and build each object (contains an 'f' key) -- if required
            if (propKeys) {
                for (var lp = 0; lp < propKeys.length; lp++) {
                    var key = propKeys[lp];
                    if (!metaTarget[key]) {
                        metaTarget[key] = { f: {} };
                    }
                    var newTarget = metaTarget[key][f];
                    if (!newTarget) {
                        // Not expected, but can occur if the metadata context was pre-created as part of the event
                        newTarget = metaTarget[key][f] = {};
                    }
                    metaTarget = newTarget;
                }
            }
            metaTarget = metaTarget[name] = {};
            if (isArray(propertyValue.value)) {
                metaTarget["a"] = {
                    t: encodedTypeValue
                };
            }
            else {
                metaTarget["t"] = encodedTypeValue;
            }
        }
    }
}