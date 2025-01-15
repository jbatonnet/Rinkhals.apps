/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { __extendsFn as __extends } from "@microsoft/applicationinsights-shims";
/**
* BaseCore.ts
* Base Core is a subset of 1DS Web SDK Core. The purpose of Base Core is to generate a smaller bundle size while providing essential features of Core. Features that are not included in Base Core are:
* 1. Internal logging
* 2. Sending notifications on telemetry sent/discarded
* @author Abhilash Panwar (abpanwar) Hector Hernandez (hectorh)
* @copyright Microsoft 2018
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import { BaseCore as InternalCore, _throwInternal, dumpObj } from "@microsoft/applicationinsights-core-js";
import { STR_DEFAULT_ENDPOINT_URL } from "./InternalConstants";
import { FullVersionString, isDocumentObjectAvailable } from "./Utils";
var BaseCore = /** @class */ (function (_super) {
    __extends(BaseCore, _super);
    function BaseCore() {
        var _this = _super.call(this) || this;
        dynamicProto(BaseCore, _this, function (_self, _base) {
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
                    _throwInternal(_self.logger, 1 /* eLoggingSeverity.CRITICAL */, 514 /* _eExtendedInternalMessageId.FailedToInitializeSDK */, "Initialization Failed: " + dumpObj(e) + "\n - Note: Channels must be provided through config.channels only");
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
// Removed Stub for BaseCore.prototype.initialize.
// Removed Stub for BaseCore.prototype.track.
    // This is a workaround for an IE8 bug when using dynamicProto() with classes that don't have any
    // non-dynamic functions or static properties/functions when using uglify-js to minify the resulting code.
    // this will be removed when ES3 support is dropped.
    BaseCore.__ieDyn=1;

    return BaseCore;
}(InternalCore));
export default BaseCore;