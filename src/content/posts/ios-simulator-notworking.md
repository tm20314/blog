---
title: iOSシュミレータがUnable to boot the Simulatorになってキレている人へ
published: 2024-04-28
description: ''
image: ''
tags: [iOS,Swift]
category: 'iOS'
draft: false 
lang: ''
---

# うんち

朝早起きしてコーヒーキメて
「よっしゃ今日も開発するか」
ってなったらこんなエラーが出た。

![CleanShot 2024-04-28 at 12.48.27@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/23094ab7-32b0-4c4e-b674-ac3bb26e702d.png)

```
Unable to boot the Simulator.
Domain: NSPOSIXErrorDomain
Code: 60
Failure Reason: launchd failed to respond.
User Info: {
    DVTErrorCreationDateKey = "2024-04-28 03:47:19 +0000";
    IDERunOperationFailingWorker = "_IDEInstalliPhoneSimulatorWorker";
    Session = "com.apple.CoreSimulator.SimDevice.8E0A5A17-085F-4899-A772-870E4031EF82";
}
--
Unable to boot the Simulator.
Domain: NSPOSIXErrorDomain
Code: 60
Failure Reason: launchd failed to respond.
User Info: {
    IDERunOperationFailingWorker = "_IDEInstalliPhoneSimulatorWorker";
    Session = "com.apple.CoreSimulator.SimDevice.8E0A5A17-085F-4899-A772-870E4031EF82";
}
--
Failed to start launchd_sim: could not bind to session, launchd_sim may have crashed or quit responding
Domain: com.apple.SimLaunchHostService.RequestError
Code: 4
--

Event Metadata: com.apple.dt.IDERunOperationWorkerFinished : {
    "device_model" = "iPhone16,1";
    "device_osBuild" = "17.4 (21E213)";
    "device_platform" = "com.apple.platform.iphonesimulator";
    "dvt_coredevice_version" = "355.24";
    "dvt_mobiledevice_version" = "1643.100.58";
    "launchSession_schemeCommand" = Run;
    "launchSession_state" = 1;
    "launchSession_targetArch" = arm64;
    "operation_duration_ms" = 8766;
    "operation_errorCode" = 60;
    "operation_errorDomain" = NSPOSIXErrorDomain;
    "operation_errorWorker" = "_IDEInstalliPhoneSimulatorWorker";
    "operation_name" = IDERunOperationWorkerGroup;
    "param_debugger_attachToExtensions" = 0;
    "param_debugger_attachToXPC" = 1;
    "param_debugger_type" = 3;
    "param_destination_isProxy" = 0;
    "param_destination_platform" = "com.apple.platform.iphonesimulator";
    "param_diag_MainThreadChecker_stopOnIssue" = 0;
    "param_diag_MallocStackLogging_enableDuringAttach" = 0;
    "param_diag_MallocStackLogging_enableForXPC" = 1;
    "param_diag_allowLocationSimulation" = 1;
    "param_diag_checker_tpc_enable" = 1;
    "param_diag_gpu_frameCapture_enable" = 0;
    "param_diag_gpu_shaderValidation_enable" = 0;
    "param_diag_gpu_validation_enable" = 0;
    "param_diag_memoryGraphOnResourceException" = 0;
    "param_diag_queueDebugging_enable" = 1;
    "param_diag_runtimeProfile_generate" = 0;
    "param_diag_sanitizer_asan_enable" = 0;
    "param_diag_sanitizer_tsan_enable" = 0;
    "param_diag_sanitizer_tsan_stopOnIssue" = 0;
    "param_diag_sanitizer_ubsan_stopOnIssue" = 0;
    "param_diag_showNonLocalizedStrings" = 0;
    "param_diag_viewDebugging_enabled" = 1;
    "param_diag_viewDebugging_insertDylibOnLaunch" = 1;
    "param_install_style" = 0;
    "param_launcher_UID" = 2;
    "param_launcher_allowDeviceSensorReplayData" = 0;
    "param_launcher_kind" = 0;
    "param_launcher_style" = 0;
    "param_launcher_substyle" = 0;
    "param_runnable_appExtensionHostRunMode" = 0;
    "param_runnable_productType" = "com.apple.product-type.application";
    "param_structuredConsoleMode" = 1;
    "param_testing_launchedForTesting" = 0;
    "param_testing_suppressSimulatorApp" = 0;
    "param_testing_usingCLI" = 0;
    "sdk_canonicalName" = "iphonesimulator17.4";
    "sdk_osVersion" = "17.4";
    "sdk_variant" = iphonesimulator;
}
--


System Information

macOS Version 14.4.1 (Build 23E224)
Xcode 15.3 (22618) (Build 15E204a)
Timestamp: 2024-04-28T12:47:19+09:00
```

# 解決方法
ターミナルにてこいつをコピペしてブチかます。
```
rm -rf ~/Library/Developer/CoreSimulator/Caches/*
```

ソース元:

https://medium.com/@liwp.stephen/my-solution-to-solve-unable-to-boot-the-ios-simulator-39bbb4aad100


ちなみに設定アプリで「プロジェクトビルドデータとインデックス」を削除すると治るって聞いたけど、それでは解決しなかったわ。

![CleanShot 2024-04-28 at 12.52.46@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/0182d990-3fc6-3621-a924-032047353749.png)

↑赤枠の部分ね？

# まとめ

🙌😁乙😁🙌

![CleanShot 2024-04-28 at 12.50.12@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/ab85654c-5868-58f2-a47b-bd69ae81e345.png)


