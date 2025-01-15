/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { isNullOrUndefined, isString, objForEachKey } from "@microsoft/applicationinsights-core-js";
import { STR_EMPTY } from "./InternalConstants";
import { getFieldValueType, isValueAssigned, isValueKind } from "./Utils";
var ValueSanitizer = /** @class */ (function () {
    function ValueSanitizer(fieldSanitizerProvider) {
        var _self = this;
        // To aid with performance this is a lookup map to check if the field value sanitizer supports this field
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
                // Null is a valid result indicating that the value sanitizer does not support this field
                if (isString(path) && isString(name)) {
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
                        // Special use-case where there is no sanitizer to pass on to, so just resolving the field
                        // and returning the resulting value (same as sanitizeProperty())
                        result = {
                            canHandle: true
                        };
                    }
                }
                // We still don't have a handler so lets lookup the providers
                if (!result && result !== null) {
                    // Setting the result to null -- which means we and any contained sanitizers can't handle this field
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
                // Invalidate any previously mapped fields
                _sanitizerMap = {};
            }
        };
        _self.addFieldSanitizer = function (fieldSanitizer) {
            if (fieldSanitizer) {
                _fieldSanitizers.push(fieldSanitizer);
                // Invalidate any previously mapped fields
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
                    // This value sanitizer can't handle this field so pass it only the next one
                    return mapValue.handler.value(path, name, value, stringifyObjects);
                }
                // Check that property is valid
                if (!isString(name) || isNullOrUndefined(value) || value === STR_EMPTY) {
                    return null;
                }
                var property = null;
                var fieldType = getFieldValueType(value);
                if ((fieldType & 8192 /* FieldValueSanitizerType.EventProperty */) === 8192 /* FieldValueSanitizerType.EventProperty */) {
                    var subType = fieldType & ~8192 /* FieldValueSanitizerType.EventProperty */;
                    property = value;
                    if (!isValueAssigned(property.value) ||
                        (subType !== 1 /* FieldValueSanitizerType.String */ &&
                            subType !== 2 /* FieldValueSanitizerType.Number */ &&
                            subType !== 3 /* FieldValueSanitizerType.Boolean */ &&
                            (subType & 4096 /* FieldValueSanitizerType.Array */) !== 4096 /* FieldValueSanitizerType.Array */)) {
                        // Not a supported IEventProperty type to be able to sanitize
                        return null;
                    }
                }
                else if (fieldType === 1 /* FieldValueSanitizerType.String */ ||
                    fieldType === 2 /* FieldValueSanitizerType.Number */ ||
                    fieldType === 3 /* FieldValueSanitizerType.Boolean */ ||
                    (fieldType & 4096 /* FieldValueSanitizerType.Array */) === 4096 /* FieldValueSanitizerType.Array */) {
                    // If the property isn't IEventProperty (and is either string, number, boolean or array), convert it into one.
                    property = _convertToProperty(path, name, value);
                }
                else if (fieldType === 4 /* FieldValueSanitizerType.Object */) {
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
            // Check that property is valid
            if (!isString(name) || isNullOrUndefined(property) || !isValueAssigned(property.value)) {
                return null;
            }
            var fieldType = getFieldValueType(property.value);
            if (fieldType === 0 /* FieldValueSanitizerType.NotSet */) {
                // Not a supported field that we can sanitize or serialize
                return null;
            }
            return _handleProperty(mapValue, path, name, fieldType, property, stringifyObjects);
        };
        function _handleProperty(mapValue, path, name, fieldType, property, stringifyObjects) {
            if (mapValue.handler) {
                // This value sanitizer can't handle this field so pass it only the next one
                return mapValue.handler.property(path, name, property, stringifyObjects);
            }
            // If either pii or cc is set convert value to string (since only string pii/cc is allowed).
            // If the value is a complex type like an array that can't be converted to string we will drop
            // the property.
            if (!isNullOrUndefined(property.kind)) {
                if ((fieldType & 4096 /* FieldValueSanitizerType.Array */) === 4096 /* FieldValueSanitizerType.Array */ || !isValueKind(property.kind)) {
                    return null;
                }
                // Convert the value to a string and assign back to the original value
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
                    // This is where we the field will call the handler to "scrub" the value. This the primary hook for the ClientHashing Plugin to
                    // be able to apply the hashFunc() / Sha256 conversion of the properties value
                    if (theType === 4 /* FieldValueSanitizerType.Object */) {
                        // Special case of an embedded object (ext.metadata, data.properties)
                        var newValue_1 = {};
                        var propValue = property.value;
                        objForEachKey(propValue, function (propKey, theValue) {
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
export { ValueSanitizer };