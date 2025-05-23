
import threading
import requests
import json
import time
import sys
import base64
import hashlib
from .sentry import Sentry
from .appsstorage import AppStorageHelper

class NotificationSender:

    EVENT_PAUSED="paused"
    EVENT_FILAMENT_REQUIRED="filamentchange"
    EVENT_USER_INTERACTION_NEEDED="userinteractionneeded"
    EVENT_TIME_PROGRESS="timerprogress"
    EVENT_DONE="done"
    EVENT_CANCELLED="cancelled"
    EVENT_CUSTOM="custom"
    EVENT_PROGRESS="progress"
    EVENT_STARTED="started"
    EVENT_ERROR="error"
    EVENT_MMU2_FILAMENT_START="mmu_filament_selection_started"
    EVENT_MMU2_FILAMENT_DONE="mmu_filament_selection_completed"
    EVENT_BEEP="beep"
    EVENT_RESUME="resume"
    EVENT_THIRD_LAYER_DONE="third_layer_done"
    EVENT_FIRST_LAYER_DONE="first_layer_done"
    
    STATE_CUSTOM_EVENT_MESSAGE = "message"
    STATE_TIME_REMAINING_SEC = "time_remaining_sec"
    STATE_PROGRESS_PERCENT = "progress_percent"
    STATE_DURATION_SEC = "duration_sec"
    STATE_FILE_NAME = "file_name"
    STATE_ERROR = "error"
    STATE_FILE_PATH = "file_name"
    STATE_PRINT_ID = "print_id"


    def __init__(self):
        self.LastPrintState = {}
        self.LastProgressUpdate = 0
        self.PrinterName = "Printer"
        self.DefaultConfig = dict(
            updatePercentModulus=5,
            highPrecisionRangeStart=5,
            highPrecisionRangeEnd=5,
            minIntervalSecs=300,
            sendNotificationUrl="https://europe-west1-octoapp-4e438.cloudfunctions.net/sendNotificationV2",
        )
        self.CachedConfig = self.DefaultConfig
        self.CachedConfigAt = 0
        self._continuouslyCheckActivitiesExpired()
        self._continuouslyUpdateConfig()

    def SendNotification(self, event, state=None):
        try:
            helper = AppStorageHelper.Get()

            if state is None:
                state = self.LastPrintState

            if event == self.EVENT_DONE:
                state[NotificationSender.STATE_PROGRESS_PERCENT] = 100

            self.LastPrintState = state
            Sentry.Info("SENDER", "Preparing notification for %s" % event)
            priority = self._determinePriority(event=event, state=state)

            # Skip this event
            if  priority == -1: 
                return

            targets = self._getPushTargets(event = event)

            onlyActivities = priority == 1
            if onlyActivities:
                Sentry.Debug("SENDER", "Only activities allowed, filtering")
                targets = helper.GetActivities(targets)

            if not targets:
                Sentry.Debug("SENDER", "No targets, skipping notification")
                return
            
            target_count_before_filter = len(targets)
            targets = self._processFilters(targets=targets, event=event)
            ios_targets = helper.GetIosApps(targets)
            activity_targets = helper.GetActivities(targets)
            activity_auto_start_targets = helper.GetActivityAutoStarts(targets) if (event == self.EVENT_STARTED) else []
            android_targets = helper.GetAndroidApps(targets)
            apnsData = self._createActivityStartData(event, state) if event == self.EVENT_STARTED and len(activity_auto_start_targets) > 0 else (self._createApnsPushData(event, state) if len(ios_targets) or len(activity_targets) else None)

            # Some clients might have user interaction disbaled. First send pause so all live activities etc
            if event == self.EVENT_USER_INTERACTION_NEEDED and target_count_before_filter != len(targets):
                Sentry.Info("SENDER", "User interaction needed, first sending pause")
                self.SendNotification(self.EVENT_PAUSED)
                time.sleep(2)

            if not len(android_targets) and apnsData is None:
                Sentry.Info("SENDER", "Skipping push, no Android targets and no APNS data, skipping notification")
                return
            
            if not len(android_targets) and not len(activity_targets) and apnsData.get("alert", None) is None:
                Sentry.Info("SENDER", "Skipping push, no Android targets, no iOS targets and APNS data has no alert, skipping notification")
                return

            self._doSendNotification(
                targets=targets,
                highProiroty=not onlyActivities,
                apnsData=apnsData,
                androidData=self._createAndroidPushData(event, state)
            )
        except Exception as e:
            Sentry.ExceptionNoSend("Failed to send notification", e)

        if event in [self.EVENT_DONE, self.EVENT_CANCELLED, self.EVENT_ERROR]:
            helper.RemoveTemporaryApps()
    
    def _determinePriority(self, event, state):
        if event == self.EVENT_STARTED:
            self.LastProgressUpdate = time.time()
            return 0

        # If the event is not progress, send to all (including time progress)
        elif event != self.EVENT_PROGRESS:
            return 0
        
        # Sanity check
        elif self.CachedConfig is None:
            Sentry.Warn("SENDER", "No config cached!")
            return 1
        
        modulus = self.CachedConfig["updatePercentModulus"]
        highPrecisionStart = self.CachedConfig["highPrecisionRangeStart"]
        highPrecisionEnd = self.CachedConfig["highPrecisionRangeEnd"]
        minIntervalSecs = self.CachedConfig["minIntervalSecs"]
        time_since_last = time.time() - self.LastProgressUpdate
        progress = int(state[NotificationSender.STATE_PROGRESS_PERCENT])
        if progress < 100 and progress > 0 and (
            (progress % modulus) == 0
            or progress <= highPrecisionStart
            or progress >= (100 - highPrecisionEnd)
        ):
            Sentry.Debug("SENDER", "Updating progress in main interval, sending high priotiy update: %s" % progress)
            self.LastProgressUpdate = time.time()
            return 0
        elif time_since_last > minIntervalSecs:
            Sentry.Debug("SENDER", "Over %s sec passed since last progress update, sending high priority update" % int(time_since_last))
            self.LastProgressUpdate = time.time()
            return 0
        elif time_since_last > (minIntervalSecs / 10):
            Sentry.Debug("SENDER", "Over %s sec passed since last progress update, sending low priority update" % int(time_since_last))
            return 1
        else:
            Sentry.Debug("SENDER", "Skipping progress update, only %s seconds passed since last" % int(time_since_last))
            return -1
    
    def _processFilters(self, targets, event):
        filterName = None
        if event == self.EVENT_FIRST_LAYER_DONE:
            filterName = "layer_1"
        elif event == self.EVENT_THIRD_LAYER_DONE:
            filterName = "layer_3"
        elif event == self.EVENT_FILAMENT_REQUIRED:
            filterName = "filament_required"
        elif event == self.EVENT_ERROR:
            filterName = "error"
        elif event == self.EVENT_USER_INTERACTION_NEEDED:
            filterName = "interaction"
        elif event == self.EVENT_BEEP:
            filterName = "beep"
        else:
            return targets
    
        return list(filter(lambda target: filterName not in target.ExcludeNotifications, targets))

    def _doSendNotification(self, targets, highProiroty, apnsData, androidData):
        try:
            if not len(targets): 
                Sentry.Info("SENDER", "No targets, skipping send")
                return

            # Base priority on onlyActivities. If the flag is set this is a low
            # priority status update
            body = dict(
                targets=list(map(lambda x: {
                    "fcmToken": x.FcmToken,
                    "fcmTokenFallback": x.FcmFallbackToken,
                    "instanceId": x.InstanceId
                }, targets)),
                highPriority=highProiroty,
                androidData=androidData,
                apnsData=apnsData,
            )

            Sentry.Info("SENDER", "Sending notification: %s" % json.dumps(body))

            # Make request and check 200
            r = requests.post(
                self.CachedConfig["sendNotificationUrl"],
                timeout=float(10), 
                json=body
            )
            function_execution_id = r.headers.get("Function-Execution-Id", "N/A")

            if r.status_code != requests.codes.ok:
                raise Exception("Unexpected response code %d: %s (Execution ID: %s)" % (r.status_code, r.text, function_execution_id))
            else:
                Sentry.Info("SENDER", "Send to %s was success %s (Execution ID: %s)" % (len(targets), r.json(), function_execution_id))

            # Delete invalid tokens
            apps = AppStorageHelper.Get().GetAllApps()
            invalid_tokens = r.json()["invalidTokens"]
            for fcmToken in invalid_tokens:
                Sentry.Info("SENDER", "Removing %s, no longer valid" % fcmToken)
                apps = [app for app in apps if app.FcmToken == fcmToken or app.FcmFallbackToken == fcmToken]
                AppStorageHelper.Get().RemoveApps(apps)

        except Exception as e:
            Sentry.ExceptionNoSend("Failed to send notification %s", e)

    def _createAndroidPushData(self, event, state):
        data = {}
        if event == self.EVENT_BEEP:
            data = { "type": "beep" }
        elif event == self.EVENT_CUSTOM:
            data = { "type": "custom", "message": state.get(self.STATE_CUSTOM_EVENT_MESSAGE, "Gcode notification") }
        else:
            type = None
            if event == self.EVENT_PROGRESS or event == self.EVENT_STARTED or event == self.EVENT_TIME_PROGRESS or event == self.EVENT_RESUME:
                type = "printing"
            elif event == self.EVENT_FIRST_LAYER_DONE:
                type = "first_layer_done"
            elif event == self.EVENT_FIRST_LAYER_DONE:
                type = "third_layer_done"
            elif event == self.EVENT_PAUSED:
                type = "paused"
            elif event == self.EVENT_DONE:
                type = "completed"
            elif event == self.EVENT_ERROR:
                type = "error"
            elif event == self.EVENT_FILAMENT_REQUIRED:
                type = "filament_required"
            elif event == self.EVENT_USER_INTERACTION_NEEDED:
                type = "paused_gcode"
            elif event == self.EVENT_MMU2_FILAMENT_START:
                type = "mmu_filament_selection_started"
            elif event == self.EVENT_MMU2_FILAMENT_DONE:
                type = "mmu_filament_selection_completed"
            elif event == self.EVENT_CANCELLED:
                type = "idle"
            elif event == self.EVENT_CUSTOM:
                type = "custom"

            data = {
                "serverTime": int(time.time()),
                "serverTimePrecise": time.time(),
                "printId": state.get(NotificationSender.STATE_PRINT_ID, None),
                "fileName": state.get(NotificationSender.STATE_FILE_NAME, None),
                "progress": state.get(NotificationSender.STATE_PROGRESS_PERCENT, None),
                "timeLeft": state.get(NotificationSender.STATE_TIME_REMAINING_SEC, None),
                "type": type,
                "message": state.get(NotificationSender.STATE_CUSTOM_EVENT_MESSAGE, None)
            }

        try:
            cipher = AESCipher(AppStorageHelper.Get().GetOrCreateEncryptionKey())
            if cipher.prepare():
                return cipher.encrypt(json.dumps(data))
            else:
                return json.dumps(data)
        except Exception as e:
            Sentry.ExceptionNoSend("Failed to encrypt push notification", e)
            return json.dumps(data)
        
    
    def _createApnsPushData(self, event, state):
        Sentry.Info("SENDER", "Targets contain iOS devices, generating texts for '%s'" % event)
        notificationTitle = None
        notificationBody = None
        notificationTitleKey = None
        notificationTitleArgs = None
        notificationBodyKey = None
        notificationBodyArgs = None
        notificationSound = None
        liveActivityState = None
        defaultBody = "Time to check %s!" % self.PrinterName

        if event == self.EVENT_CUSTOM:
            return {
                "alert": {
                    "title": state.get(self.STATE_CUSTOM_EVENT_MESSAGE, "Gcode notification"),
                    "body": "Triggered on %s by a Gcode command" % self.PrinterName,
                    "loc-key": "print_notification___custom_message",
                    "loc-args": [self.PrinterName]
                },
                "sound": "default",
            }
        
        elif event == self.EVENT_BEEP:
            return {
                "alert": {
                    "title": "Beep",
                    "body": "%s needs attention " % self.PrinterName,
                    "title-loc-key": "print_notification___beep_title",
                    "title-loc-args": [],
                    "loc-key": "print_notification___beep_message",
                    "loc-args": [self.PrinterName]
                },
                "sound": "default",
            }
        
        elif event == self.EVENT_STARTED:
            notificationTitle = "%s started to print" % self.PrinterName
            notificationTitleKey = "print_notification___start_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = "Open the app to see the progress"
            notificationBodyKey = "print_notification___start_message"
            notificationBodyArgs = []
            notificationSound = "default"
            liveActivityState = "printing"
    
        elif event == self.EVENT_PROGRESS or event == self.EVENT_TIME_PROGRESS or event == self.EVENT_RESUME:
            liveActivityState = "printing"

        elif event == self.EVENT_FIRST_LAYER_DONE:
            notificationTitle = "First layer completed"
            notificationTitleKey = "print_notification___layer_x_completed_title"
            notificationTitleArgs = ["1"]
            notificationBody = defaultBody
            notificationBodyKey = "print_notification___layer_x_completed_message"
            notificationBodyArgs = [self.PrinterName]
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "printing"

        elif event == self.EVENT_THIRD_LAYER_DONE:
            notificationTitle = "Third layer completed"
            notificationTitleKey = "print_notification___layer_x_completed_title"
            notificationTitleArgs = ["3"]
            notificationBody = defaultBody
            notificationBodyKey = "print_notification___layer_x_completed_message"
            notificationBodyArgs = [self.PrinterName]
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "printing"

        elif event == self.EVENT_CANCELLED:
            liveActivityState = "cancelled"
            notificationTitle = "Print on %s cancelled" % self.PrinterName
            notificationTitleKey = "print_notification___cancelled_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyKey = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyArgs = []
            notificationSound = "notification_filament_change.wav"

        elif event == self.EVENT_DONE:
            notificationTitle = "%s is done!" % self.PrinterName
            notificationTitleKey = "print_notification___print_done_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyKey = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyArgs = []
            notificationSound = "notification_print_done.wav"
            liveActivityState = "completed"

        elif event == self.EVENT_FILAMENT_REQUIRED:
            notificationTitle = "Filament required"
            notificationTitleKey = "print_notification___filament_change_required_title"
            notificationTitleArgs =  [self.PrinterName]
            notificationBody = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyKey = state.get(NotificationSender.STATE_FILE_NAME, None)
            notificationBodyArgs = []
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "filamentRequired"

        elif event == self.EVENT_USER_INTERACTION_NEEDED:
            notificationTitle = "%s needs attention!" % self.PrinterName
            notificationTitleKey = "print_notification___paused_from_gcode_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = "Print was paused"
            notificationBodyKey = "print_notification___paused_from_gcode_message"
            notificationBodyArgs = []
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "pausedGcode"

        elif event == self.EVENT_PAUSED:
            liveActivityState = "paused"
        
        elif event == self.EVENT_MMU2_FILAMENT_START:
            notificationTitle = "%s asks for filament selection" % self.PrinterName
            notificationTitleKey = "print_notification___filament_selection_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = "Print is waiting for MMU"
            notificationBodyKey = "print_notification___filament_selection_message"
            notificationBodyArgs = []
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "filamentRequired"

        elif event == self.EVENT_MMU2_FILAMENT_DONE:
            liveActivityState = "printing"

        elif event == self.EVENT_ERROR:
            notificationTitle = "%s needs attention!" % self.PrinterName
            notificationTitleKey = "print_notification___paused_from_gcode_title"
            notificationTitleArgs = [self.PrinterName]
            notificationBody = state.get(self.STATE_ERROR, "Print failed")
            notificationSound = "notification_filament_change.wav"
            liveActivityState = "error"

        else:
            Sentry.Warn("SENDER", "Missing handling for '%s'" % event)
            return None

        # Let's only end the activity on cancel. If we end it on completed the alert isn't shown
        data = self._createActivityContentState(
            isEnd=event == self.EVENT_CANCELLED or event == self.EVENT_ERROR or event == self.EVENT_DONE,
            state=state,
            liveActivityState=liveActivityState
        )

        # Delay cancel or complete notification to ensure it's last
        if event == self.EVENT_CANCELLED or event == self.EVENT_DONE or event == self.EVENT_ERROR:
            time.sleep(5)

        if notificationSound is not None:
            data["sound"] = notificationSound
        
        if notificationBody is None and notificationBodyKey is None:
            notificationBody = "Time to check %s!" % self.PrinterName

        if notificationTitle is not None or notificationTitleKey is not None:
             # Create alert
            data["alert"] = {
                "title": notificationTitle,
                "body": notificationBody,
                "title-loc-key": notificationTitleKey,
                "title-loc-args": notificationTitleArgs,
                "loc-key": notificationBodyKey,
                "loc-args": notificationBodyArgs
            }

            data["activity-alert"] = {
                "title": {
                    "loc-key": notificationTitleKey,
                    "loc-args": notificationTitleArgs,
                },
                "body": {
                    "loc-key": notificationBodyKey,
                    "loc-args": notificationBodyArgs,
                },
                # "sound": notificationSound -> We send a notification alongside because iOS doesn't play this sound reliably, especially with Apple Watch connected
            }

            # Delete None values, causes issues with APNS
            for k, v in dict(data["alert"]).items():
                if v is None or (type(v) == list and len(v) == 0):
                    del data["alert"][k]

        return data
    

    def _createActivityStartData(self, event, state):
        # Base: Activity state
        data = self._createActivityContentState(
            isEnd=False,
            state=state,
            liveActivityState="printing"
        )
        # Add alert
        data.update(self._createApnsPushData(event, state))

        # Add attributes needed for start
        # ! the node JS server will set attributes.instanceId
        data.update(
            {
                "event": "start",
                "attributes-type": "PrintActivityAttributes",
                "attributes": {
                    "filePath": state.get(NotificationSender.STATE_FILE_PATH, None),
                    "startedAt": time.time()
                }
            }
        )
        return data


    def _createActivityContentState(self, isEnd, state, liveActivityState):
        return {
            "event": "end" if isEnd else "update",
            "content-state": {
                "fileName": state.get(NotificationSender.STATE_FILE_NAME, None),
                "filePath": state.get(NotificationSender.STATE_FILE_PATH, None),
                "progress": int(float(state.get(NotificationSender.STATE_PROGRESS_PERCENT, None))),
                "sourceTime": int(time.time() * 1000),
                "state": liveActivityState,
                "error": state.get(self.STATE_ERROR, None),
                "timeLeft": int(float(state.get(NotificationSender.STATE_TIME_REMAINING_SEC, None))),
                "printTime": int(float(state.get(NotificationSender.STATE_DURATION_SEC, None))),
            }
        }

    def _getPushTargets(self, event):
        Sentry.Info("SENDER", "Finding targets for event=%s" % event)
        helper = AppStorageHelper.Get()
        apps = helper.GetAllApps()
        phones = {}

        # Group all apps by phone
        for app in apps:
            instance_id = app.InstanceId
            phone = phones.get(instance_id, [])
            phone.append(app)
            phones[instance_id] = phone

        # Pick activity if available, otherwise any other app
        def pick_best_app(apps):
            activities = helper.GetActivities(apps)
            ios = helper.GetIosApps(apps)
            android = helper.GetAndroidApps(apps)

            # For start events we can generate LiveActivity instances on the fly which will start a LiveActivity
            if event == self.EVENT_STARTED:
                for ios_app in ios:
                    if ios_app.ActivityAutoStartToken:
                        activities.append(ios_app.WithToken(ios_app.ActivityAutoStartToken))

            if len(android):
                # If we have android...return any way. Handled all the same.
                return android
            elif event in [self.EVENT_CUSTOM, self.EVENT_BEEP, self.EVENT_FIRST_LAYER_DONE, self.EVENT_THIRD_LAYER_DONE]:
                # If we have an event Live Activities can't handle send via notification
                 return ios
            elif event in [self.EVENT_STARTED, self.EVENT_FILAMENT_REQUIRED, self.EVENT_USER_INTERACTION_NEEDED, self.EVENT_CANCELLED, self.EVENT_DONE, self.EVENT_ERROR]:
                # If we have a important event, send to all targets
                return activities + ios
            else:
                # Send only to activities, might be empty
                return activities

        # Get apps per phone and flatten
        apps = list(map(lambda phone: pick_best_app(phone), phones.values()))
        apps = [app for sublist in apps for app in sublist]
        return list(filter(lambda app: app is not None, apps))


    def _continuouslyCheckActivitiesExpired(self):
        t = threading.Thread(
            target=self._doContinuouslyCheckActivitiesExpired,
            args=[]
        )
        t.daemon = True
        t.start()


    def _doContinuouslyCheckActivitiesExpired(self):
         Sentry.Debug("SENDER", "Checking for expired apps every 60s")
         while True:
            time.sleep(60)

            try:
                helper = AppStorageHelper.Get()
                expired = helper.GetExpiredApps(helper.GetAllApps())
                if len(expired):
                    Sentry.Debug("SENDER", "Found %s expired apps" % len(expired))
                    helper.LogApps()

                    expired_activities = helper.GetActivities(expired)
                    if len(expired_activities):
                        # This will end the live activity, we currently do not send a notification to inform
                        # the user, we can do so by setting isEnd=False and the apnsData as below
                        apnsData=self._createActivityContentState(
                            isEnd=True,
                            liveActivityState="expired",
                            state=self.LastPrintState
                        )
                        # apnsData["alert"] = {
                        #     "title": "Updates paused for %s" % self.LastPrintState.get("name", ""),
                        #     "body": "Live activities expire after 8h, open OctoApp to renew"
                        # }
                        self._doSendNotification(
                            targets=expired_activities,
                            highProiroty=True,
                            apnsData=apnsData,
                            androidData="none"
                        )

                    helper.RemoveApps(expired)
                    Sentry.Debug("SENDER", "Cleaned up expired apps")


            except Exception as e:
                Sentry.ExceptionNoSend("Failed to retire expired", e)


    #
    # CONFIG
    #

    def _continuouslyUpdateConfig(self):
        Sentry.Info("SENDER", "Updating config")
        t = threading.Thread(target=self._doContinuouslyUpdateConfig)
        t.daemon = True
        t.start()

    def _doContinuouslyUpdateConfig(self):
        while True:
            time.sleep(3600)
            # If we have no config cached or the cache is older than a day, request new config
            cache_config_max_age = time.time() - 86400
            if self.CachedConfigAt > cache_config_max_age:
                Sentry.Info("SENDER", "Config still valid")

            # Request config, fall back to default
            try:
                r = requests.get(
                    "https://www.octoapp.eu/config/plugin.json", timeout=float(15)
                )
                if r.status_code != requests.codes.ok:
                    raise Exception("Unexpected response code %d" % r.status_code)
                self.CachedConfig = r.json()
                self.CachedConfigAt = time.time()
        
                Sentry.Info("SENDER", "OctoApp loaded config: %s" % self.CachedConfig)
            except Exception as e:
                Sentry.ExceptionNoSend("Failed to fetch config using defaults for 5 minutes", e)
                self.CachedConfig = self.DefaultConfig
                self.CachedConfigAt = cache_config_max_age + 300

class AESCipher(object):
    _ready = None

    def __init__(self, key):
        self.key = hashlib.sha256(key.encode()).digest()

    def prepare(self):
        global AES, Random

        if AESCipher._ready is None:
            try:
                from Crypto.Cipher import AES
                from Crypto import Random
                AESCipher._ready = True
            except ImportError as e:
                Sentry.Warn("SENDER", "Missing Crypto, notifications will not be encrypted. This happens on Sonic Pad and K1 (maybe others)")
                AESCipher._ready = False
        
        return AESCipher._ready

    def encrypt(self, raw):
        global AES, Random
        bs = AES.block_size

        def _pad(s):
            return s + (bs - len(s) % bs) * chr(bs - len(s) % bs)

        raw = _pad(raw)
        iv = Random.new().read(bs)
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        return base64.b64encode(iv + cipher.encrypt(raw.encode())).decode("utf-8")
            
