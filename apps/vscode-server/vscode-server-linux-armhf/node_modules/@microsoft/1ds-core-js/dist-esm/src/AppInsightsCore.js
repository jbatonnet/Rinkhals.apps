/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
/**
* AppInsightsCore.ts
* @author Abhilash Panwar (abpanwar) Hector Hernandez (hectorh)
* @copyright Microsoft 2018
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import { AppInsightsCore as InternalCore, DiagnosticLogger, _throwInternal, arrForEach, doPerf, dumpObj, throwError } from "@microsoft/applicationinsights-core-js";
import { STR_DEFAULT_ENDPOINT_URL, STR_EMPTY, STR_PROPERTIES, STR_VERSION } from "./InternalConstants";
import { FullVersionString, getTime, isLatency } from "./Utils";
var AppInsightsCore = /** @class */ (function (_super) {
    __extends(AppInsightsCore, _super);
    function AppInsightsCore() {
        var _this = _super.call(this) || this;
        _this.pluginVersionStringArr = [];
        dynamicProto(AppInsightsCore, _this, function (_self, _base) {
            if (!_self.logger || !_self.logger.queue) {
                // The AI Base can inject a No-Op logger so if not defined or the No-Op, change to use a default logger so initialization errors
                // are not dropped on the floor if one is not already defined
                _self.logger = new DiagnosticLogger({ loggingLevelConsole: 1 /* eLoggingSeverity.CRITICAL */ });
            }
            _self.initialize = function (config, extensions, logger, notificationManager) {
                doPerf(_self, function () { return "AppInsightsCore.initialize"; }, function () {
                    var _pluginVersionStringArr = _self.pluginVersionStringArr;
                    // Add default collector url
                    if (config) {
                        if (!config.endpointUrl) {
                            config.endpointUrl = STR_DEFAULT_ENDPOINT_URL;
                        }
                        var propertyStorageOverride = config.propertyStorageOverride;
                        // Validate property storage override
                        if (propertyStorageOverride && (!propertyStorageOverride.getProperty || !propertyStorageOverride.setProperty)) {
                            throwError("Invalid property storage override passed.");
                        }
                        if (config.channels) {
                            arrForEach(config.channels, function (channels) {
                                if (channels) {
                                    arrForEach(channels, function (channel) {
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
                        arrForEach(extensions, function (ext) {
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
                        var message = dumpObj(e);
                        if (message.indexOf("channels") !== -1) {
                            // Add some additional context to the underlying reported error
                            message += "\n - Channels must be provided through config.channels only!";
                        }
                        _throwInternal(logger_1, 1 /* eLoggingSeverity.CRITICAL */, 514 /* _eExtendedInternalMessageId.FailedToInitializeSDK */, "SDK Initialization Failed - no telemetry will be sent: " + message);
                    }
                }, function () { return ({ config: config, extensions: extensions, logger: logger, notificationManager: notificationManager }); });
            };
            _self.track = function (item) {
                doPerf(_self, function () { return "AppInsightsCore.track"; }, function () {
                    var telemetryItem = item;
                    if (telemetryItem) {
                        telemetryItem.timings = telemetryItem.timings || {};
                        telemetryItem.timings.trackStart = getTime();
                        if (!isLatency(telemetryItem.latency)) {
                            telemetryItem.latency = 1 /* EventLatencyValue.Normal */;
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
// Removed Stub for AppInsightsCore.prototype.initialize.
// Removed Stub for AppInsightsCore.prototype.track.
    // This is a workaround for an IE8 bug when using dynamicProto() with classes that don't have any
    // non-dynamic functions or static properties/functions when using uglify-js to minify the resulting code.
    // this will be removed when ES3 support is dropped.
    AppInsightsCore.__ieDyn=1;

    return AppInsightsCore;
}(InternalCore));
export default AppInsightsCore;