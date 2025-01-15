/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* ESPromiseScheduler.ts
* @author Nev Wylie (newylie)
* @copyright Microsoft 2019
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import ESPromise from "./ESPromise";
import { _warnToConsole, getGlobal } from "@microsoft/applicationinsights-core-js";
/** This is a default timeout that will cause outstanding running promises to be removed/rejected to avoid filling up memory with blocked events */
var LazyRejectPeriod = 600000; // 10 Minutes
// These are global variables that are shared across ALL instances of the scheduler
/**
 * @ignore
 */
var _schedulerId = 0;
/**
 * @ignore
 */
var _running = [];
/**
 * @ignore
 */
var _waiting = [];
/**
 * @ignore
 */
var _timedOut = [];
/**
 * @ignore
 */
function _getTime() {
    return new Date().getTime();
}
/**
 * Provides a simple mechanism queueing mechanism for scheduling events based on the ESPromise callbacks, this is used to ensure
 * order of async operations that are required to be executed in a specific order.
 */
var ESPromiseScheduler = /** @class */ (function () {
    function ESPromiseScheduler(name, diagLog) {
        var _promiseId = 0;
        var _scheduledName = (name || "<unnamed>") + "." + _schedulerId;
        _schedulerId++;
        dynamicProto(ESPromiseScheduler, this, function (_this) {
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
                // Create the next scheduled event details
                var newScheduledEvent = {
                    evt: null,
                    tm: _getTime(),
                    id: uniqueEventId,
                    isRunning: false,
                    isAborted: false
                };
                if (!_lastEvent) {
                    // We don't have any currently running event, so just start the next event
                    newScheduledEvent.evt = _startWaitingEvent(newScheduledEvent);
                }
                else {
                    // Start a new promise which will wait until all current active events are complete before starting
                    // the new event, it does not resolve this scheduled event until after the new event is resolve to
                    // ensure that all scheduled events are completed in the correct order
                    newScheduledEvent.evt = _waitForPreviousEvent(newScheduledEvent, _lastEvent);
                }
                // Set this new event as the last one, so that any future events will wait for this one
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
                            // If there was a timeout stop it
                            clearTimeout(removed.to);
                            removed.to = null;
                        }
                        // TODO (newylie): Convert this into reportable metrics
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
                    // Also if the last scheduled event was this event then clear it as we are now finished
                    if (_lastEvent && _lastEvent.id === eventId) {
                        _lastEvent = null;
                    }
                    _abortAndRemoveOldEvents(_running);
                    _abortAndRemoveOldEvents(_waiting);
                    _abortAndRemoveOldEvents(_timedOut);
                }
                // Return a callback function that will be called when the waiting promise is resolved or rejected to ensure
                // that any outer promise is also resolved or rejected
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
                            // If the result is a promise then this appears to be a chained result, so wait for this promise to complete
                            _debugLog("Event [" + eventId + "] returned a promise -- waiting");
                            _waitForFinalResult(eventId, value, schEventResolve, schEventReject);
                            return value;
                        }
                        else {
                            return _removeScheduledEvent(eventId, schEventResolve)(value);
                        }
                    }, _removeScheduledEvent(eventId, schEventReject));
                }
                // Add the passed event to the active event list with resolve and reject callbacks that will remove
                // it from the active event list
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
                                // Note: Only starting a timer if a timeout was specified
                                eventDetails.to = setTimeout(function () {
                                    _cleanup(eventId, false);
                                    // Cause the listeners to reject (Note: We can't actually reject the waiting event)
                                    schEventReject(new Error("Timed out after [" + timeout + "] ms"));
                                }, timeout);
                            }
                            _waitForFinalResult(eventId, startResult, function (theResult) {
                                _debugLog("Event [" + eventId + "] Resolving after " + (_getTime() - eventDetails.tm) + " ms");
                                schEventResolve(theResult);
                            }, schEventReject);
                        }
                        else {
                            // The startEvent didn't return a promise so just return a resolved promise
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
                // Start a new promise which will wait until all current active events are complete before starting
                // the new event, it does not resolve this scheduled event until after the new event is resolve to
                // ensure that all scheduled events are completed in the correct order
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
                        // Wait for the previous event to complete
                        waitForEvent.evt.then(function (value) {
                            _removeQueuedEvent(_waiting, uniqueId);
                            // Wait for the last event to complete before starting the new one, this ensures the execution
                            // order so that we don't try and remove events that havn't been committed yet
                            _startWaitingEvent(eventDetails).then(waitResolve, waitReject);
                        }, function (reason) {
                            _removeQueuedEvent(_waiting, uniqueId);
                            // Wait for the last event to complete before starting the new one, this ensures the execution
                            // order so that we don't try and remove events that havn't been committed yet
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
            // Only log if running within test harness
            var global = getGlobal();
            if (global && global["QUnit"]) {
                // tslint:disable-next-line:no-console
                console && console.log("ESPromiseScheduler[" + _scheduledName + "] " + message);
            }
        }
        function _warnLog(message) {
            _warnToConsole(diagLog, "ESPromiseScheduler[" + _scheduledName + "] " + message);
        }
    }
    ESPromiseScheduler.incomplete = function () {
        return _running;
    };
    ESPromiseScheduler.waitingToStart = function () {
        return _waiting;
    };
// Removed Stub for ESPromiseScheduler.prototype.scheduleEvent.
    return ESPromiseScheduler;
}());
export default ESPromiseScheduler;