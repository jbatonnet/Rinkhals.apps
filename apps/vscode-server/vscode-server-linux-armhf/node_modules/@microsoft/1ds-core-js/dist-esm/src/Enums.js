/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* Enums.ts
* @author Abhilash Panwar (abpanwar)
* @copyright Microsoft 2018
* File containing the enums as constants.
*/
import { __assignFn as __assign } from "@microsoft/applicationinsights-shims";
import { _InternalMessageId, createEnumStyle, objFreeze } from "@microsoft/applicationinsights-core-js";
/**
 * The ValueKind contains a set of values that specify value kind of the property.
 * Either PII (Personal Identifiable Information) or customer content.
 */
export var ValueKind = createEnumStyle({
    NotSet: 0 /* eValueKind.NotSet */,
    Pii_DistinguishedName: 1 /* eValueKind.Pii_DistinguishedName */,
    Pii_GenericData: 2 /* eValueKind.Pii_GenericData */,
    Pii_IPV4Address: 3 /* eValueKind.Pii_IPV4Address */,
    Pii_IPv6Address: 4 /* eValueKind.Pii_IPv6Address */,
    Pii_MailSubject: 5 /* eValueKind.Pii_MailSubject */,
    Pii_PhoneNumber: 6 /* eValueKind.Pii_PhoneNumber */,
    Pii_QueryString: 7 /* eValueKind.Pii_QueryString */,
    Pii_SipAddress: 8 /* eValueKind.Pii_SipAddress */,
    Pii_SmtpAddress: 9 /* eValueKind.Pii_SmtpAddress */,
    Pii_Identity: 10 /* eValueKind.Pii_Identity */,
    Pii_Uri: 11 /* eValueKind.Pii_Uri */,
    Pii_Fqdn: 12 /* eValueKind.Pii_Fqdn */,
    Pii_IPV4AddressLegacy: 13 /* eValueKind.Pii_IPV4AddressLegacy */,
    CustomerContent_GenericContent: 32 /* eValueKind.CustomerContent_GenericContent */
});
/**
 * The EventLatency contains a set of values that specify the latency with which an event is sent.
 */
export var EventLatency = createEnumStyle({
    /**
     * Normal latency.
     */
    Normal: 1 /* EventLatencyValue.Normal */,
    /**
     * Cost deferred latency. At the moment this latency is treated as Normal latency.
     */
    CostDeferred: 2 /* EventLatencyValue.CostDeferred */,
    /**
     * Real time latency.
     */
    RealTime: 3 /* EventLatencyValue.RealTime */,
    /**
     * Bypass normal batching/timing and send as soon as possible, this will still send asynchronously.
     * Added in v3.1.1
     */
    Immediate: 4 /* EventLatencyValue.Immediate */
});
/**
 * Enum for property types.
 */
export var EventPropertyType = createEnumStyle({
    Unspecified: 0 /* eEventPropertyType.Unspecified */,
    String: 1 /* eEventPropertyType.String */,
    Int32: 2 /* eEventPropertyType.Int32 */,
    UInt32: 3 /* eEventPropertyType.UInt32 */,
    Int64: 4 /* eEventPropertyType.Int64 */,
    UInt64: 5 /* eEventPropertyType.UInt64 */,
    Double: 6 /* eEventPropertyType.Double */,
    Bool: 7 /* eEventPropertyType.Bool */,
    Guid: 8 /* eEventPropertyType.Guid */,
    DateTime: 9 /* eEventPropertyType.DateTime */
});
/**
 * The EventPersistence contains a set of values that specify the event's persistence.
 */
export var EventPersistence = createEnumStyle({
    /**
     * Normal persistence.
     */
    Normal: 1 /* EventPersistenceValue.Normal */,
    /**
     * Critical persistence.
     */
    Critical: 2 /* EventPersistenceValue.Critical */
});
export var TraceLevel = createEnumStyle({
    NONE: 0 /* eTraceLevel.NONE */,
    ERROR: 1 /* eTraceLevel.ERROR */,
    WARNING: 2 /* eTraceLevel.WARNING */,
    INFORMATION: 3 /* eTraceLevel.INFORMATION */
});
export var _ExtendedInternalMessageId = objFreeze(__assign(__assign({}, _InternalMessageId), createEnumStyle({
    AuthHandShakeError: 501 /* _eExtendedInternalMessageId.AuthHandShakeError */,
    AuthRedirectFail: 502 /* _eExtendedInternalMessageId.AuthRedirectFail */,
    BrowserCannotReadLocalStorage: 503 /* _eExtendedInternalMessageId.BrowserCannotReadLocalStorage */,
    BrowserCannotWriteLocalStorage: 504 /* _eExtendedInternalMessageId.BrowserCannotWriteLocalStorage */,
    BrowserDoesNotSupportLocalStorage: 505 /* _eExtendedInternalMessageId.BrowserDoesNotSupportLocalStorage */,
    CannotParseBiBlobValue: 506 /* _eExtendedInternalMessageId.CannotParseBiBlobValue */,
    CannotParseDataAttribute: 507 /* _eExtendedInternalMessageId.CannotParseDataAttribute */,
    CVPluginNotAvailable: 508 /* _eExtendedInternalMessageId.CVPluginNotAvailable */,
    DroppedEvent: 509 /* _eExtendedInternalMessageId.DroppedEvent */,
    ErrorParsingAISessionCookie: 510 /* _eExtendedInternalMessageId.ErrorParsingAISessionCookie */,
    ErrorProvidedChannels: 511 /* _eExtendedInternalMessageId.ErrorProvidedChannels */,
    FailedToGetCookies: 512 /* _eExtendedInternalMessageId.FailedToGetCookies */,
    FailedToInitializeCorrelationVector: 513 /* _eExtendedInternalMessageId.FailedToInitializeCorrelationVector */,
    FailedToInitializeSDK: 514 /* _eExtendedInternalMessageId.FailedToInitializeSDK */,
    InvalidContentBlob: 515 /* _eExtendedInternalMessageId.InvalidContentBlob */,
    InvalidCorrelationValue: 516 /* _eExtendedInternalMessageId.InvalidCorrelationValue */,
    SessionRenewalDateIsZero: 517 /* _eExtendedInternalMessageId.SessionRenewalDateIsZero */,
    SendPostOnCompleteFailure: 518 /* _eExtendedInternalMessageId.SendPostOnCompleteFailure */,
    PostResponseHandler: 519 /* _eExtendedInternalMessageId.PostResponseHandler */,
    SDKNotInitialized: 520 /* _eExtendedInternalMessageId.SDKNotInitialized */
})));