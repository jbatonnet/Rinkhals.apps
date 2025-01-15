/*
 * 1DS JS SDK Core, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
* ESPromise.ts
* @author  Nev Wylie (newylie))
* @copyright Microsoft 2019
* Simplified wrapper to provide ES6 style Promise callback handling for older browsers
*/
import dynamicProto from "@microsoft/dynamicproto-js";
import { isFunction } from "@microsoft/applicationinsights-core-js";
/**
 * @ignore -- Don't include in the generated documentation
 * Using a local variable to assist with minfication
 */
var _isFunction = isFunction;
/**
 * @ignore -- Don't include in the generated documentation
 * This function will be used as onFulfilled handler for any Promise found in the iterable passed to Promise.all.
 * The goal here is to capture in a closure the index of the current item from the iterable. If we did not create
 * this closure, the captured index variable would be the same one that the for loop updates and thus would always
 * be pointing to the last index in the iterable by the time that the onFulfilled handler is called.
 * However, note that for the resolvedCallback callback we want the opposite. For this one we do want to capture
 * the same variable that the for loop updates so that we have the full count of pending promises by the time
 * the onFulfilled handlers start getting called.
 * @param values The resolving promise values
 * @param index The index of this callback function
 * @param resolvedCallback THe callback function used to check if the "all" promise is complete
 */
function _createPromiseAllOnResolvedFunction(values, index, resolvedCallback) {
    return function (value) {
        values[index] = value;
        resolvedCallback();
    };
}
/**
 * Simplified wrapper to provide ES6 style Promise callback handling for older browsers
 */
var ESPromise = /** @class */ (function () {
    /**
     * The Promise object represents the eventual completion (or failure) of an asynchronous operation, and its resulting value.
     * @param resolverFunc A function that is passed with the arguments resolve and reject. The executor function is executed
     * immediately by the Promise implementation, passing resolve and reject functions (the executor is called before the Promise
     * constructor even returns the created object). The resolve and reject functions, when called, resolve or reject the promise,
     * respectively. The executor normally initiates some asynchronous work, and then, once that completes, either calls the resolve
     * function to resolve the promise or else rejects it if an error occurred. If an error is thrown in the executor function, the
     * promise is rejected. The return value of the executor is ignored.
     */
    function ESPromise(resolverFunc) {
        var _state = 0 /* PromiseState.Pending */;
        var _settledValue = null;
        var _queue = [];
        dynamicProto(ESPromise, this, function (_this) {
            _this.then = function (onResolved, onRejected) {
                return new ESPromise(function (resolve, reject) {
                    // Queue the new promise returned to be resolved or rejected
                    // when this promise settles.
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
                    // First call the onFulfilled or onRejected handler, on the settled value
                    // of this promise. If the corresponding handler does not exist, simply
                    // pass through the settled value.
                    if (_state === 1 /* PromiseState.Resolved */) {
                        value = _isFunction(onResolved) ? onResolved(_settledValue) : _settledValue;
                    }
                    else {
                        value = _isFunction(onRejected) ? onRejected(_settledValue) : _settledValue;
                    }
                    if (value instanceof ESPromise) {
                        // The called handlers returned a new promise, so the chained promise
                        // will follow the state of this promise.
                        value.then(resolve, reject);
                    }
                    else if (_state === 2 /* PromiseState.Rejected */ && !_isFunction(onRejected)) {
                        // If there wasn't an onRejected handler and this promise is rejected, then
                        // the chained promise also rejects with the same reason.
                        reject(value);
                    }
                    else {
                        // If this promise is fulfilled, then the chained promise is also fulfilled
                        // with either the settled value of this promise (if no onFulfilled handler
                        // was available) or the return value of the handler. If this promise is
                        // rejected and there was an onRejected handler, then the chained promise is
                        // fulfilled with the return value of the handler.
                        resolve(value);
                    }
                }
                catch (error) {
                    // The chained promise will reject if there is any exception thrown while
                    // calling the onFulfilled or onRejected handlers.
                    reject(error);
                    return;
                }
            });
            // If this promise is already settled, then immediately process the callback we
            // just added to the queue.
            if (_state !== 0 /* PromiseState.Pending */) {
                _processQueue();
            }
        }
        function _processQueue() {
            if (_queue.length > 0) {
                // The onFulfilled and onRejected handlers must be called asynchronously. Thus,
                // we make a copy of the queue and work on it once the current call stack unwinds.
                var pending_1 = _queue.slice();
                _queue = [];
                setTimeout(function () {
                    for (var i = 0, len = pending_1.length; i < len; ++i) {
                        try {
                            pending_1[i]();
                        }
                        catch (e) {
                            // Don't let 1 failing handler break all others
                            // TODO (newylie): Add some form of error reporting (i.e. Call any registered JS error handler so the error is reported)
                        }
                    }
                }, 0);
            }
        }
        function _resolve(value) {
            if (_state === 0 /* PromiseState.Pending */) {
                _settledValue = value;
                _state = 1 /* PromiseState.Resolved */;
                _processQueue();
            }
        }
        function _reject(reason) {
            if (_state === 0 /* PromiseState.Pending */) {
                _settledValue = reason;
                _state = 2 /* PromiseState.Rejected */;
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
                // This promise will immediately reject if any exception is thrown
                // from within the executor function.
                _reject(error);
            }
        })();
    }
    /**
     * The Promise.resolve() method returns a Promise object that is resolved with a given value. If the value is a promise, that promise is returned;
     * if the value is a thenable (i.e. has a "then" method), the returned promise will "follow" that thenable, adopting its eventual state; otherwise
     * the returned promise will be fulfilled with the value. This function flattens nested layers of promise-like objects (e.g. a promise that resolves
     * to a promise that resolves to something) into a single layer.
     * @param value Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
     */
    ESPromise.resolve = function (value) {
        if (value instanceof ESPromise) {
            // Value is a Promise so just return it
            return value;
        }
        else if (value && _isFunction(value.then)) {
            // Value looks like a promise or thenable (has a then function)
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
    /**
     * The Promise.reject() method returns a Promise object that is rejected with a given reason.
     * @param reason The reason why this Promise rejected.
     */
    ESPromise.reject = function (reason) {
        return new ESPromise(function (resolve, reject) {
            reject(reason);
        });
    };
    /**
     * The Promise.all() method returns a single Promise that resolves when all of the promises passed as an iterable
     * have resolved or when the iterable contains no promises. It rejects with the reason of the first promise that
     * rejects. There is no implied ordering in the execution of the array of Promises given. On some computers, they
     * may be executed in parallel, or in some sense concurrently, while on others they may be executed serially. For
     * this reason, there must be no dependency in any Promise on the order of execution of the Promises.
     * This method can be useful for aggregating the results of multiple promises.
     * FulfillmentSection - The returned promise is fulfilled with an array containing all the values of the iterable
     * passed as argument (also non-promise values).
     * If an empty iterable is passed, then this method returns (synchronously) an already resolved promise.
     * If all of the passed-in promises fulfill, or are not promises, the promise returned by Promise.all is fulfilled
     * asynchronously.
     * RejectionSection - If any of the passed-in promises reject, Promise.all asynchronously rejects with the value of
     * the promise that rejected, whether or not the other promises have resolved.
     * @param iterable
     */
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
                    // Quick and direct check for a Promise (will also catch a thenable)
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
                    // All promises were either resolved or where not a promise
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
    /**
     * The race function returns a Promise that is settled the same way (and takes the same value) as the first promise
     * that settles amongst the promises of the iterable passed as an argument.
     * If the iterable passed is empty, the promise returned will be forever pending.
     * If the iterable contains one or more non-promise value and/or an already settled promise, then Promise.race will
     * resolve to the first of these values found in the iterable.
     * @param iterable
     */
    ESPromise.race = function (iterable) {
        return new ESPromise(function (resolve, reject) {
            if (!iterable || !iterable.length) {
                return;
            }
            try {
                var _loop_1 = function (lp) {
                    var item = iterable[lp];
                    // Quick and direct check for a Promise (will also catch a thenable)
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
// Removed Stub for ESPromise.prototype.then.
// Removed Stub for ESPromise.prototype["catch"].
    return ESPromise;
}());
export default ESPromise;