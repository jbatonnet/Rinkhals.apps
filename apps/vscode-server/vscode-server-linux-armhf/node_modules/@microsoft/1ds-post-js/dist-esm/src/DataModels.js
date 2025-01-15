/*
 * 1DS JS SDK POST plugin, 3.2.13
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
 * Real Time profile (default profile). RealTime Latency events are sent every 1 sec and
 * Normal Latency events are sent every 2 sec.
 */
export var RT_PROFILE = "REAL_TIME";
/**
 * Near Real Time profile. RealTime Latency events are sent every 3 sec and
 * Normal Latency events are sent every 6 sec.
 */
export var NRT_PROFILE = "NEAR_REAL_TIME";
/**
 * Best Effort. RealTime Latency events are sent every 9 sec and
 * Normal Latency events are sent every 18 sec.
 */
export var BE_PROFILE = "BEST_EFFORT";