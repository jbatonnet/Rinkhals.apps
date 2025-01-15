/*
 * 1DS JS SDK POST plugin, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */

// Licensed under the MIT License.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Note: DON'T Export these const from the package as we are still targeting ES3 this will export a mutable variables that someone could change!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Generally you should only put values that are used more than 2 times and then only if not already exposed as a constant (such as SdkCoreNames)
// as when using "short" named values from here they will be will be minified smaller than the SdkCoreNames[eSdkCoreNames.xxxx] value.
export var STR_EMPTY = "";
export var STR_POST_METHOD = "POST";
export var STR_DISABLED_PROPERTY_NAME = "Microsoft_ApplicationInsights_BypassAjaxInstrumentation";
export var STR_DROPPED = "drop";
export var STR_SENDING = "send";
export var STR_REQUEUE = "requeue";
export var STR_RESPONSE_FAIL = "rspFail";
export var STR_OTHER = "oth";
export var DEFAULT_CACHE_CONTROL = "no-cache, no-store";
export var DEFAULT_CONTENT_TYPE = "application/x-json-stream";
export var STR_CACHE_CONTROL = "cache-control";
export var STR_CONTENT_TYPE_HEADER = "content-type";
export var STR_KILL_TOKENS_HEADER = "kill-tokens";
export var STR_KILL_DURATION_HEADER = "kill-duration";
export var STR_KILL_DURATION_SECONDS_HEADER = "kill-duration-seconds";
export var STR_TIME_DELTA_HEADER = "time-delta-millis";
export var STR_CLIENT_VERSION = "client-version";
export var STR_CLIENT_ID = "client-id";
export var STR_TIME_DELTA_TO_APPLY = "time-delta-to-apply-millis";
export var STR_UPLOAD_TIME = "upload-time";
export var STR_API_KEY = "apikey";
export var STR_MSA_DEVICE_TICKET = "AuthMsaDeviceTicket";
export var STR_AUTH_XTOKEN = "AuthXToken";
export var STR_SDK_VERSION = "sdk-version";
export var STR_NO_RESPONSE_BODY = "NoResponseBody";
export var STR_MSFPC = "msfpc";
export var STR_TRACE = "trace";
export var STR_USER = "user";