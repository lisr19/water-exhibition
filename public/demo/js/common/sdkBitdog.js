var cmdType = {
    baseMsgType: {
        gateMsgType: 257,
        transmitMsgType: 513
    },
    gateMsgType: {
        loginRe: 4101,
        loginRes: 4102,
        getClientInfoRe: 4103,
        getClientInfoRes: 4104
    },
    transMsgType: {
        createSessionRe: 8208,
        createSessionRes: 8209,
        getInfoRe: 8272,
        getInfoRes: 8273,
        createSubSessionRe: 8216,
        createRelaySessionRe: 8217,
        createRelaySessionRes: 8218,
        setDeviceParamRe: 8268,
        setDeviceParamRes: 8269,
        sdkRes: 8448,
        playVideoRe: 8224,
        playVideoRes: 8225,
        stopVideoRe: 8232,
        stopVideoRes: 8233,
        setPtzRe: 8284,
        ptzNum: 111,
        playAudioRe: 8228,
        playAudioRes: 8229,
        stopAudioRe: 8236,
        playMixedPlayRe: 8230,
        searchPlaybackRe: 8248,
        searchPlaybackRes: 8249,
        playbackVideoRe: 8252,
        playbackVideoRes: 8253,
        playbackVideoEndRes: 8262,
        stopPlaybackVideoRe: 8264
    }
};

var BidogSdk = {
    'init': function (json) {
        this.wfs;
        this.video264 = document.getElementById('video-264');
        this.video265 = document.getElementById('video-265');
        this.canvasEnlarge = document.getElementById('canvas-enlarge')//'#canvas-enlarge';
        this.date = json.playbackTime;
        this.wsUrl = "wss://ws-xjp.bitdog.com/userGateWay/2";
        this.wsStreamUrl = "wss://ws-xjp.bitdog.com/stream/2";
        this.wsStreamIp = "52.220.91.174";
        this.wsStreamPort = 35009;
        this.userGateWayIp = "52.220.91.174";
        this.streamList = { 0: '高清', 1: '标清', 2: '流畅' }
        this.timePlanTip = 0;
        this.curDeviceInfo = json;
        this.userName = "";
        this.searchVideoResNum = this.totalRecordCounts = this.curRecordCounts = 0;
        this.recordFileInfo = this.recordFileArr = this.publicData = [];
        this.sTimeSub = 0;
        this.eTimeSub = 1;
        this.videoTimeStamp;
        this.dragTimeStamp;
        this.currentStreamId = json.stream;
        this.currentChannelNum = json.channel;
        this.utvChange = BidogSdk.getTimeZone();
        this.msgId = 1;
        this.reboot = false;
        this.format = false;
        this.motion = false;
        this.TimePlan = false;
        this.playVideoPart = 0;
        this.replayDataRate = json.playbackInfo.streamId;
        this.replayVideoType = json.playbackInfo.fileType;
        this.playNextVideo = true;
        this.playStatus = false;
        this.videoType = '';
        this.nRelaySessionID = '';
        this.nRelaySockFd = '';
    },
    'initSocket': function (flag) {
        this.websocket = new WebSocket(this.wsUrl);
        this.websocket.onopen = function () {
            console.log('initSocket Open!');
            BidogSdk.userLogin();
            this.userHeartbeat = setInterval(BidogSdk.userGatewayHeartbeat, 200000);
        };
        this.websocket.onclose = function () {
            console.log('websocket' + lang.deviceinfo.labCloseConnect);
            clearInterval(BidogSdk.websocket.userHeartbeat);
        };
        this.websocket.onerror = function () {
            var result = confirm('websocket' + lang.deviceinfo.labError);
            result && window.location.reload();
        };
        this.websocket.onmessage = function (event) {
            BidogSdk.videoType = flag;
            this.receiveMessage = JSON.parse(event.data);
            console.log(this.receiveMessage);
            // onCallback(this.receiveMessage);
            if (this.receiveMessage.code == 0) {
                if (this.receiveMessage.data.cmdID == cmdType.gateMsgType.loginRes) {
                    this.userGatewayPort = this.receiveMessage.data.cmdData.trans_port;
                    this.sessionId = this.receiveMessage.data.cmdData.client_id;
                    BidogSdk.getClientInfo();
                } else if (this.receiveMessage.data.cmdID == cmdType.gateMsgType.getClientInfoRes) {
                    this.deviceId = this.receiveMessage.data.cmdData.client_id;
                    this.loginIp = this.receiveMessage.data.cmdData.client_loginip;
                    this.loginPort = this.receiveMessage.data.cmdData.client_loginport;
                    BidogSdk.createSession();
                } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createSessionRes &&
                    this.receiveMessage.data.cmdData.msg_data.resultCode != 0) {
                    this.createSessionResultCode = this.receiveMessage.data.cmdData.msg_data.resultCode;
                    BidogSdk.createSessionStatus(this.createSessionResultCode);
                }
                if (flag == 'livevideo') {
                    if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createSessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 0) {
                        this.createSessionResultCode = 0;
                        BidogSdk.streamMediaConnect();
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.playVideoRes) { //html
                        BidogSdk.currentStreamId = this.receiveMessage['data']['cmdData']['msg_data']['rsp_info'][0]['resultCode'];

                        BidogSdk.getSupportStreamType(this.receiveMessage['data']['cmdData']['msg_data']['rsp_info'][0]['streamInfoBitMask']);
                        if (this.receiveMessage['data']['cmdData']['msg_data']['rsp_info'][0]['resultCode'] < 0) {
                            alert(lang.videoplay.labPlayVideoFail);
                            $(BidogSdk.video265, BidogSdk.video264).hide();
                        }
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createRelaySessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 1) {
                        alert(lang.videoplay.labCreateRelaySessionFail);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createRelaySessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 0) {
                        BidogSdk.createSubSession(1, BidogSdk.currentStreamId);
                    }
                } else if (flag == 'remoteplayback') {
                    if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createSessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 0) {
                        this.createSessionResultCode = 0;
                        BidogSdk.searchRecord(BidogSdk.replayVideoType,
                            BidogSdk.replayDataRate,
                            BidogSdk.getUTC(BidogSdk.date)[0],
                            BidogSdk.getUTC(BidogSdk.date)[1]);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.sdkRes &&
                        this.receiveMessage.data.cmdData.msg_data.responseType ==
                        cmdType.transMsgType.searchPlaybackRe &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 1) {
                        alert(lang.remoteplayback.noRecord);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.searchPlaybackRes) {
                        initCanvas();
                        $(BidogSdk.video265, BidogSdk.video264).hide();
                        BidogSdk.searchVideoResNum++;
                        recordFileInfo = this.receiveMessage.data.cmdData.msg_data.recordFileInfo;
                        for (var i in recordFileInfo) {
                            if (recordFileInfo[i]['videoStartTime'] > 0) {
                                if (i == 0) BidogSdk.replayVideoType = recordFileInfo[i].fileType;
                                BidogSdk.recordFileArr.push([recordFileInfo[i]['videoStartTime'],
                                recordFileInfo[i]['videoEndTime']]);
                            }
                        }
                        BidogSdk.recordFileArr.sort(function (a, b) {
                            return a[BidogSdk.sTimeSub] - b[BidogSdk.eTimeSub];
                        });

                        totalRecordCounts = this.receiveMessage.data.cmdData.msg_data.totalRecordCounts;
                        BidogSdk.curRecordCounts = this.receiveMessage.data.cmdData.msg_data.curRecordCounts +
                            BidogSdk.curRecordCounts;
                        if (totalRecordCounts == BidogSdk.curRecordCounts &&
                            BidogSdk.recordFileArr.length > 0) {
                            drawTimeLine(BidogSdk.recordFileArr);
                            BidogSdk.streamMediaConnect();
                        } else if (totalRecordCounts == BidogSdk.curRecordCounts &&
                            BidogSdk.recordFileArr.length < 0) {
                            alert(lang.remoteplayback.noRecord);
                        }
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.playbackVideoRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode < 1) {
                        alert(lang.videoplay.labPlayVideoFail);
                        $(BidogSdk.video265, BidogSdk.video264).hide();
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.playbackVideoRes) {
                        if (BidogSdk.playNextVideo) {
                            BidogSdk.createRelaySession();
                            BidogSdk.playNextVideo = false;
                        }
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createRelaySessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 1) {
                        alert(lang.videoplay.labCreateRelaySessionFail);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createRelaySessionRes &&
                        this.receiveMessage.data.cmdData.msg_data.resultCode == 0) {
                        BidogSdk.createSubSession(3, BidogSdk.replayDataRate, BidogSdk.replayVideoType);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.playbackVideoEndRes) {//播放当前段结束
                        // console.log(recordFileArr, BidogSdk.playVideoPart);
                        BidogSdk.playRecord(BidogSdk.currentReplayVideoType);
                        BidogSdk.playVideoPart++;
                    }
                } else {
                    if (this.receiveMessage.data.cmdID == cmdType.transMsgType.createSessionRes) {
                        this.createSessionResultCode = 0;
                        BidogSdk.getDeviceInfo(BidogSdk.currentChannelNum);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.getInfoRes) {
                        this.getDeviceChannelInfo = this.receiveMessage.data.cmdData.msg_data;
                        if (this.getDeviceChannelInfo.issmart ||
                            this.getDeviceChannelInfo.issmart == true) {   //NVR、XVR
                            BidogSdk.getChannelInfo(BidogSdk.currentChannelNum);
                        }
                        outPutHtml(this.getDeviceChannelInfo, BidogSdk.curDeviceInfo);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        (this.receiveMessage.data.cmdData.msg_data.factory_reset ||
                            (this.receiveMessage.data.cmdData.msg_data.restart && BidogSdk.reboot))) {//重启
                        alert(lang.deviceinfo.labDeviceRestart);
                        BidogSdk.reboot = false;
                        window.location.href = '/';
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        (this.receiveMessage.data.cmdData.msg_data.tfCardFormat ||
                            this.receiveMessage.data.cmdData.msg_data.restart && BidogSdk.format)) {//格式化
                        alert(lang.deviceinfo.labFormatting);
                        BidogSdk.format = false;
                        window.location.href = '/';
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        this.receiveMessage.data.cmdData.msg_data.motdata && BidogSdk.motion) {//移动侦测开关
                        BidogSdk.motion = false;
                        alert(lang.deviceinfo.labMotionDetection + lang.deviceinfo.labSettingSuccess);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        this.receiveMessage.data.cmdData.msg_data.motdata && BidogSdk.TimePlan) {//日程
                        BidogSdk.timePlanTip++;
                        if (BidogSdk.timePlanTip == 7) {
                            alert(lang.deviceinfo.labSettingSuccess);
                            BidogSdk.TimePlan = false;
                            BidogSdk.timePlanTip = 0;
                        } else {
                            BidogSdk.TimePlan = false;
                        }
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        this.receiveMessage.data.cmdData.msg_data.responseCode != 0) {//设置失败
                        outPutHtml(this.getDeviceChannelInfo, BidogSdk.curDeviceInfo);
                        alert(lang.deviceinfo.labSettingFail);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.setDeviceParamRes &&
                        this.receiveMessage.data.cmdData.msg_data.responseCode == 0) {//设置成功
                        alert(lang.deviceinfo.labSettingSuccess);
                    } else if (this.receiveMessage.data.cmdID == cmdType.transMsgType.sdkRes &&
                        this.receiveMessage.data.cmdData.msg_data.responseCode != 0) {//请求失败
                        alert(lang.deviceinfo.labQequestFail);
                    }
                }
            } else {
                alert(lang.deviceinfo.labUnKnownError + ', code:3502');
                BidogSdk.playStatus = true;
                // BidogSdk.refreshDeviceStatus(BidogSdk.curDeviceInfo.deviceId);
            }
        }
    },
    'streamMediaConnect': function () {
        clearInterval(this.responseTimeoutName);
        if (Wfs.isSupported()) {
            BidogSdk.wfs && BidogSdk.wfs.websocketLoader.client.close();
            BidogSdk.wfs = new Wfs();
            var initReq = {
                'functionName': 'RelayAskPro',
                'requestNo': new Date().getTime(),
                'liveTime': 30,
                'param': { 'deviceId': this.curDeviceInfo.deviceId, 'devUUID': '1481703573' }
            };
            BidogSdk.wfs.attachMedia(this.video264, this.wsStreamUrl, initReq);
        }
    },
    'userGatewayHeartbeat': function () {
        var content = {
            'functionName': 'HeartBeat',
            'requestNo': new Date().getTime(),
            'liveTime': 30
        };
        BidogSdk.websocket.send(JSON.stringify(content));
    },
    'streamMediaGatewayHeartbeat': function () {
        var content = {
            'functionName': 'HeartBeat',
            'requestNo': new Date().getTime(),
            'liveTime': 30
        };
        BidogSdk.wfs.trigger('wfsWebsocketMessageSending', { 'req': content });
    },
    'sendDeviceCommandData': function (cmdId, data) {
        var requestBody = {
            'msg_id': this.msgId,
            'cmd_id': cmdId,
            'from_client_id': parseInt(this.websocket.sessionId),
            'to_client_id': parseInt(this.websocket.deviceId),
            'to_client_name': this.curDeviceInfo.deviceId,
            'to_client_role': 1,
            'to_client_loginip': this.websocket.loginIp,
            'to_client_loginport': parseInt(this.websocket.loginPort),
            'to_gate_type': 1,
            'msg_data': data
        };
        this.msgId++;
        return requestBody;
    },
    'sendDeviceCommand': function (cmdTypeRequest, cmdID, data, successTip, failTip) {
        if (this.websocket.receiveMessage.code == 0) {
            try {
                var content = {
                    'functionName': 'SendToRouter',
                    'requestNo': new Date().getTime(),
                    'liveTime': 30,
                    'param': {
                        'cmdType': cmdTypeRequest,
                        'cmdID': cmdID,
                        'cmdData': data
                    }
                };
                !this.websocket && BidogSdk.initSocket();
                console.log(successTip, JSON.stringify(content));
                this.websocket.send(JSON.stringify(content));
            } catch (ex) {
                alert(ex.message);
            }
        } else {
            alert(failTip);
        }
    },
    'userLogin': function () {
        try {
            var content = {
                'functionName': 'SendToRouter',
                'requestNo': new Date().getTime(),
                'liveTime': 30,
                'param': {
                    'cmdType': cmdType.baseMsgType.gateMsgType,
                    'cmdID': cmdType.gateMsgType.loginRe,
                    'cmdData': {
                        'client_name': this.userName,
                        'client_role': 6,
                        'client_modle': 'test',
                        'client_firm_ver': '123',
                        'client_hardware_ver': '456',
                        'client_sdk_ver': '789'
                    }
                }
            };
            !this.websocket && BidogSdk.initSocket();
            this.websocket.send(JSON.stringify(content));
            return true;
        } catch (ex) {
            var result = confirm(ex.message);
            result && window.location.reload();
        }
    },
    'getClientInfo': function () {
        var content = {
            'client_name': this.curDeviceInfo.deviceId,
            'gateway_type': 1,
            'client_role': 6
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.gateMsgType, cmdType.gateMsgType.getClientInfoRe,
            content, '获取客户端信息传参:=>', lang.deviceinfo.labLoginFail);
    },
    'createSession': function () {
        if (this.websocket.loginIp && this.websocket.loginPort) {
            var requestData = {
                'userLoginId': parseInt(this.websocket.sessionId),
                'username': this.userName,
                'devSn': this.curDeviceInfo.deviceId,
                'devUserName': this.curDeviceInfo.localUser,
                'devPasswd': this.curDeviceInfo.localPwd,
                'userGatewayIp': this.userGateWayIp,
                'userGatewayPort': parseInt(this.websocket.userGatewayPort),
                'userGatewayType': 2,
                'userRole': 6,
                'cookie': 0
            };
            BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType,
                cmdType.transMsgType.createSessionRe,
                BidogSdk.sendDeviceCommandData(cmdType.transMsgType.createSessionRe, requestData),
                '创建会话传参:=>', lang.deviceinfo.labGetClientInfoFail);
            BidogSdk.responseTimeout('createSessionInterval',
                lang.videoplay.labCreateSessionFail, '.J-no-request');
        } else {
            alert(lang.deviceinfo.labtipsNoDevice);
        }
    },
    'createRelaySession': function () {
        var requestData = {
            'channelNo': parseInt(BidogSdk.currentChannelNum),
            'relayAddr': this.wsStreamIp,
            'relayPort': this.wsStreamPort,
            'relaySessionId': BidogSdk.nRelaySessionID,
            'socketFd': BidogSdk.nRelaySockFd
        };
        // console.log('createRelaySession',BidogSdk.nRelaySessionID, BidogSdk.nRelaySockFd);
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType,
            cmdType.transMsgType.createRelaySessionRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.createRelaySessionRe, requestData),
            '创建relay会话:=>', lang.videoplay.labVideoInfoMistake);
    },
    'createSubSession': function (cmdTypeSubSession, streamId, fileType) {
        var requestData = {
            'userLoginId': parseInt(this.websocket.sessionId),
            'cmdType': cmdTypeSubSession,
            'channelNo': parseInt(BidogSdk.currentChannelNum),
            'streamId': parseInt(streamId),
            'sessionType': 2,
            'recordType': parseInt(fileType)
        },
            json = {
                'functionName': 'SendToRouter',
                'requestNo': new Date().getTime(),
                'param': {
                    'cmdType': cmdType.baseMsgType.transmitMsgType,
                    'cmdID': cmdType.transMsgType.createSubSessionRe,
                    'cmdData': BidogSdk.sendDeviceCommandData(cmdType.transMsgType.createSubSessionRe,
                        requestData)
                }
            };
        BidogSdk.wfs.trigger('wfsWebsocketMessageSending', { 'req': json });
        BidogSdk.responseTimeout('videoStreamInterval', lang.videoplay.labNoVideo, '#video-264,#video-265');
    },

    //视频播放
    'playVideo': function () {
        var streamId = parseInt(BidogSdk.currentStreamId),
            channelNo = parseInt(BidogSdk.currentChannelNum),
            requestData = {
                'channelNum': 1,
                'connType': 6,
                'relayAddr': this.wsStreamIp,
                'relayPort': this.wsStreamPort,
                'req_info': [{
                    'channelNo': channelNo,
                    'streamId': streamId,
                    'nRelaySessionID': BidogSdk.nRelaySessionID,
                    'nRelaySockFd': BidogSdk.nRelaySockFd,
                    'reserve': 0
                }]
            };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.playVideoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.playVideoRe, requestData),
            '播放视频信息:=>', lang.videoplay.labVideoInfoMistake);
        BidogSdk.responseTimeout('playVideoInterval', lang.videoplay.labCreateRelaySessionFail,
            '#video-264,#video-265');
        this.currentStreamId = streamId;
        BidogSdk.currentChannelNum = channelNo;
        this.dragTimeStamp = 0;
    },
    'stopVideo': function (channelNo, streamId) {
        var requestData = {
            'channelNum': 1,
            'req_info': [{
                'channelNo': parseInt(channelNo),
                'streamId': parseInt(streamId),
                'nRelaySessionID': BidogSdk.nRelaySessionID,
                'nRelaySockFd': BidogSdk.nRelaySockFd,
                'reserve': 0
            }]
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.stopVideoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.stopVideoRe, requestData),
            '停止播放视频:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'searchRecord': function (fileType, streamId, sTime, eTime) {
        clearInterval(this.responseTimeoutName);
        var requestData = {
            'channelNo': parseInt(BidogSdk.currentChannelNum),
            'timeZone': parseInt(this.utvChange),
            'startTime': parseInt(sTime),
            'endTime': parseInt(eTime),
            'fileType': parseInt(fileType),
            'streamId': parseInt(streamId)
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.searchPlaybackRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.searchPlaybackRe, requestData),
            '搜索回放视频信息:=>', lang.videoplay.labVideoInfoMistake);
        BidogSdk.responseTimeout('searchRecordInterval', lang.videoplay.labNoVideo, '#video-264,#video-265');
    },
    'playRecord': function (videoType, streamId, sTime, eTime) {
        clearInterval(this.responseTimeoutName);
        var startTime = sTime ? sTime : BidogSdk.recordFileArr[BidogSdk.playVideoPart][BidogSdk.sTimeSub],
            endTime = eTime ? eTime : BidogSdk.recordFileArr[BidogSdk.playVideoPart][BidogSdk.eTimeSub],
            dTime = (endTime - startTime) / 1000,
            channelNo = parseInt(BidogSdk.currentChannelNum),
            // nRelayIDs = nRelayID ? nRelayID : BidogSdk.nRelaySessionID,
            // nRelayFds = nRelayFd ? nRelayFd : BidogSdk.nRelaySockFd,
            streamIds = streamId ? streamId : BidogSdk.currentStreamId,
            conType = 6;
        // console.log('playRecord',BidogSdk.nRelaySessionID, BidogSdk.nRelaySockFd);
        streamIds = parseInt(streamIds);
        conType = (videoType << 16) | conType;
        var requestData = {
            'channelNo': channelNo,
            'timeZone': parseInt(this.utvChange),
            'videoStartTime': parseInt(startTime),
            'videoEndTime': parseInt(endTime),
            'bufDurationTime': dTime,
            'connType': conType,
            'streamId': streamIds
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.playbackVideoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.playbackVideoRe, requestData),
            '播放回放录像信息:=>', lang.deviceinfo.labGetPlaybackVideoFail);
        this.currentStreamId = streamIds;
        BidogSdk.currentChannelNum = channelNo;
        // this.nRelaySessionID = nRelayIDs;
        // this.nRelaySockFd = nRelayFds;
        this.currentReplayVideoType = videoType;
        this.dragTimeStamp = startTime;
    },
    'stopRecord': function (channelNo) {
        var requestData = {
            'channelNo': parseInt(channelNo)
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType,
            cmdType.transMsgType.stopPlaybackVideoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.stopPlaybackVideoRe, requestData),
            '停止回放录像视频:=>', lang.deviceinfo.labIncorrectOperation);
    },
    //拖动后继续播放
    'recordTimebeat': function (time) {
        $(BidogSdk.video265, BidogSdk.video264).hide();
        this.currentArr = 0;
        // console.log(BidogSdk.recordFileArr);
        for (var i in BidogSdk.recordFileArr) {
            var arr = Object.values(BidogSdk.recordFileArr[i]);
            if (time >= arr[BidogSdk.sTimeSub] && time <= arr[BidogSdk.eTimeSub]) {
                // console.log(this.currentArr);
                this.currentArr = arr;
            }
        }
        if (this.currentArr) {
            BidogSdk.playRecord(BidogSdk.currentReplayVideoType, '', time, this.currentArr[1]);
        } else {
            alert(lang.remoteplayback.noRecord);
        }
    },
    'setPtz': function (num) {
        var requestData = {
            'channelNo': parseInt(BidogSdk.currentChannelNum),
            'ptzCmd': parseInt(num)
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setPtzRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setPtzRe, requestData),
            '云台控制:=>' + num, lang.deviceinfo.labIncorrectOperation);
    },
    'playAudio': function () {
        var requestData = {
            'channelNo': parseInt(BidogSdk.currentChannelNum),
            'connType': 6
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.playAudioRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.playAudioRe, requestData),
            '音频播放:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'stopAudio': function () {
        var requestData = {
            'channelNo': parseInt(BidogSdk.currentChannelNum)
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.stopAudioRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.stopAudioRe, requestData),
            '停止音频播放:=>', lang.deviceinfo.labIncorrectOperation);
    },

    //设备信息
    'getDeviceInfo': function (channelNo) {
        var requestData = {
            'cmd': 'cmd_get_param',
            'channel': parseInt(channelNo),
            'deviceId': this.curDeviceInfo.deviceId,
            'dev_username': this.curDeviceInfo.localUser,
            'dev_passwd': this.curDeviceInfo.localPwd
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.getInfoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.getInfoRe, requestData),
            '获取设备参数:=>', lang.deviceinfo.labCreateSessionFail);
    },
    'getChannelInfo': function (channelNo) {
        var requestData = {
            'dev_username': this.curDeviceInfo.localUser,
            'dev_passwd': this.curDeviceInfo.localPwd,
            'deviceId': this.curDeviceInfo.deviceId,
            'cmd_type': 'channel_info',
            'cmd': 'cmd_get_param',
            'channel_id': 0,
            'channel': parseInt(channelNo)
        };
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.getInfoRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.getInfoRe, requestData),
            '获取通道信息:=>', lang.deviceinfo.labGetChannelInfoFail);
    },
    'setMotionDetectionSwitch': function (status, deviceType) {
        BidogSdk.motion = true;
        BidogSdk.setParamBody();
        if (deviceType == 'IPC') {
            this.publicData['motDetOn'] = status;
        } else {
            this.publicData['motswitch'] = status;
        }
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置移动侦测开关参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setTimePlan': function (data, week) {
        BidogSdk.TimePlan = true;
        BidogSdk.setParamBody();
        this.publicData['time'] = data;
        this.publicData['week_day'] = week;
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置日程参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setCodeType': function (type, deviceType) {
        BidogSdk.setParamBody();
        this.publicData['now_code_type'] = parseInt(type);
        if (deviceType == 'IPC') {
            this.publicData['enable'] = true;
        }
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置编码类型参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setCodeSwitch': function (status) {
        BidogSdk.setParamBody();
        this.publicData['isopen'] = status;
        this.publicData['enable'] = true;
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置编码开关参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setResolution': function (stream, resolution) {
        BidogSdk.setParamBody();
        this.publicData['stream'] = stream;
        this.publicData['now_resolution'] = parseInt(resolution);
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置分辨率参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setFrameRate': function (stream, rate) {
        BidogSdk.setParamBody();
        this.publicData['stream'] = stream;
        this.publicData['now_rate'] = parseInt(rate);
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置帧率参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setFormat': function (deviceType, diskNum) {
        BidogSdk.format = true;
        BidogSdk.setParamBody();
        if (deviceType == 'IPC') {
            this.publicData['tfCardFormat'] = true;
        } else {
            this.publicData['DiskPort'] = diskNum;
        }
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '设置格式化参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setRestoreFactory': function () {
        BidogSdk.setParamBody();
        this.publicData['factory_reset'] = true;
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '恢复出厂设置参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    'setReboot': function () {
        BidogSdk.reboot = true;
        BidogSdk.setParamBody();
        this.publicData['restart'] = true;
        BidogSdk.sendDeviceCommand(cmdType.baseMsgType.transmitMsgType, cmdType.transMsgType.setDeviceParamRe,
            BidogSdk.sendDeviceCommandData(cmdType.transMsgType.setDeviceParamRe, this.publicData),
            '重启设备参数:=>', lang.deviceinfo.labIncorrectOperation);
    },
    //公共请求部分
    'setParamBody': function () {
        this.publicData = {
            'deviceId': this.curDeviceInfo.deviceId,
            'dev_username': this.curDeviceInfo.localUser,
            'dev_passwd': this.curDeviceInfo.localPwd,
            'cmd': 'cmd_set_param',
            'cmd_type': 'channel_info',
            'channel_id': 0,
            'channel': parseInt(BidogSdk.currentChannelNum)
        };
        return this.publicData;
    },
    //创建会话状态
    'createSessionStatus': function (code) {
        switch (code) {
            case 0:
                alert(lang.deviceinfo.labCreateSessionSuccess);
                break;
            case 1:
                alert(lang.deviceinfo.labCreateSessionFail);
                break;
            case 2:
                alert(lang.deviceinfo.labSessionFull);
                break;
            case 5:
                alert(lang.deviceinfo.labNoLogin);
                break;
            case 6:
                var con = confirm(lang.deviceinfo.labIncorrectInfo);
                if (con == true) {
                    var result = prompt(lang.login.labInputUserAndPsw),
                        str = result ? result.split(',') : '';
                    if (str) {
                        this.curDeviceInfo.localUser = str[0];
                        this.curDeviceInfo.localPwd = str[1];
                        BidogSdk.createSession();
                        // console.log(this.curDeviceInfo);
                    }
                }
                break;
            default:
                alert(lang.videoplay.labCreateSessionFail);
        }
    },
    //响应超时
    'responseTimeout': function (name, tips, event) {
        var responseWaitTime = 0;
        name = setInterval(function () {
            // console.log('响应超时', responseWaitTime);
            if ($('.all').length > 0) {
                responseWaitTime++;
                if (responseWaitTime == 40) {
                    alert(tips);
                    // BidogSdk.refreshDeviceStatus(BidogSdk.curDeviceInfo.deviceId);
                    $(event).hide();
                    clearInterval(name);
                    responseWaitTime = 0;
                }
            } else {
                responseWaitTime = 0;
                clearInterval(name);
            }
        }, 1000);
        return this.responseTimeoutName = name;
    },
    //格式2018/11/11 23:59:59   转时间戳
    'getUTC': function (e) {
        var startT = e + ' 00:00:00',
            endT = e + ' 23:59:59';
        startT = (Date.parse(new Date(startT)));
        endT = (Date.parse(new Date(endT)));
        var timeArr = new Array(startT, endT);
        return timeArr;
    },
    //刷新设备状态
    'refreshDeviceStatus': function (dId) {
        $.post('/home/device/refresh-device-status', {
            deviceId: dId
        }, function (data) {
            if (data.code == 0) {
                alert(lang.tip.updateDeviceStatusSuccess, function () {
                    updateDevuceStatus(dId);
                }, 1000, 1);
            } else {
                alert(lang.tip.updateDeviceStatusFail);
            }
        }, 'json');
    },
    //获取时区
    'getTimeZone': function () {
        var timeDiff = new Date().getTimezoneOffset(),
            time = timeDiff / (60);
        return time > 0 ? '-' + Math.abs(time) * 3600 : '+' + Math.abs(time) * 3600;
    },
    //获取当前时间，格式：****/**/**
    'getDate': function () {
        return new Date().getFullYear() + '/' + ((new Date().getMonth() + 1) < 10 ? '0' : '')
            + (new Date().getMonth() + 1) + '/' + (new Date().getDate() < 10 ? '0' : '') + new Date().getDate();
    },
    //获取支持的码流
    'getSupportStreamType': function (type) {
        (type & (0x00000001 << 0)) > 0 == false && delete BidogSdk.streamList[0];// 高清
        (type & (0x00000001 << 1)) > 0 == false && delete BidogSdk.streamList[1];// 标清
        (type & (0x00000001 << 2)) > 0 == false && delete BidogSdk.streamList[2];// 流畅
        getStreamList();
    },
    //检测是否支持webAssemblySupported
    'webAssemblySupported': function () {
        try {
            if (typeof WebAssembly === 'object'
                && typeof WebAssembly.instantiate === 'function') {
                var module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (module instanceof WebAssembly.Module)
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
            }
        } catch (e) {
        }
        return false;
    },
    'enlarge': function () {
        var ctx = BidogSdk.canvasEnlarge.getContext("2d"),
            startX,
            startY,
            endX,
            endY,
            transformVideo = $(BidogSdk.video264).is(":hidden") ? BidogSdk.video265 : BidogSdk.video264,
            width = $(transformVideo).width(),
            height = $(transformVideo).height(),
            isMouseDown;
        BidogSdk.canvasEnlarge.width = width;
        BidogSdk.canvasEnlarge.height = height;
        $(BidogSdk.canvasEnlarge).on("mouseleave", function (e) {
            isMouseDown = false;
            ctx.clearRect(0, 0, width, height);
        }).on("contextmenu", function (e) {
            e.preventDefault();
        }).on("mousedown", function (e) {
            e.preventDefault();
            switch (e.button) {
                case 0:
                    startX = e.offsetX;
                    startY = e.offsetY;
                    isMouseDown = true;
                    break;
                case 2://右键清除
                    transformVideo.style.transform = "";
                    BidogSdk.canvasEnlarge.style.transform = "";
                    break;
            };
        }).on("mouseup", function (e) {
            if (e.button == 0) {
                endX = e.offsetX;
                endY = e.offsetY;
                isMouseDown = false;
                if (startX !== endX && startY !== endY) {
                    var x = Math.abs(startX - endX),
                        y = Math.abs(startY - endY);
                    //放大倍数
                    zoomX = width / x;
                    zoomY = height / y;
                    transformVideo.style.transformOrigin = "top left";
                    BidogSdk.canvasEnlarge.style.transformOrigin = "top left";
                    //计算画布左上角的坐标startX和startY
                    if (startX < endX && startY < endY) { }
                    else if (startX > endX && startY > endY) {
                        startX = endX;
                        startY = endY;
                    } else if (startX < endX && startY > endY) {
                        startY = endY;
                    } else {
                        startX = endX;
                    }
                    //放大后平移
                    transformVideo.style.transform = "matrix(" + zoomX + ",0,0," +
                        zoomY + "," + (-startX * zoomX) + "," + (-startY * zoomY) + ")";
                    ctx.clearRect(0, 0, width, height);
                    //让画布有同样的变化，以便下次画矩阵时保存之前的坐标
                    BidogSdk.canvasEnlarge.style.transform = "matrix(" + zoomX + ",0,0," +
                        zoomY + "," + (-startX * zoomX) + "," + (-startY * zoomY) + ")";
                }
            }
        }).on("mousemove", function (e) {
            if (e.button == 0 && isMouseDown) {
                ctx.clearRect(0, 0, width, height);
                endX = e.offsetX;
                endY = e.offsetY;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                if (startX == endX || startY == endY) ctx.clearRect(0, 0, width, height);
            }
        });
    },
    'getDeviceStatus': function (dId, callback) {
        $.post('https://www.bitdog.com/home/account/get-device-status', {
            device_id: dId
        }, function (data) {
            callback && callback(data.data.device_status);
        }, 'json');
    },
    'capture': function (callback) {
        if ($(BidogSdk.video264).is(':visible')) {//264
            if (isSafari()) {
                alert(lang.videoplay.screenshotTips);
                return;
            }
            var newCanvas = document.createElement("canvas"),
                ctx = newCanvas.getContext("2d"),
                width = BidogSdk.video264.videoWidth,
                height = BidogSdk.video264.videoHeight;
            newCanvas.width = BidogSdk.video264.clientWidth;
            newCanvas.height = BidogSdk.video264.clientHeight;
            ctx.drawImage(BidogSdk.video264, 0, 0, width, height);
            if (newCanvas.toDataURL() && callback) callback(newCanvas.toDataURL());
        } else {//265
            BidogSdk.wfs.websocketLoader.capVideo = true;
            BidogSdk.wfs.websocketLoader.h265Conver.capVideoData = "";
            //监控数值变化
            BidogSdk.monitorValueChange(BidogSdk.wfs.websocketLoader.h265Conver, 'capVideoData', function (label, data) {
                if (data && callback) callback(data);
            });
        };
    },
    'monitorValueChange': function (obj, label, msgCallback) {
        Object.defineProperty(obj, label, {
            get: function () {
                return obj.label;
            },
            set: function (newValue) {
                if (newValue) return msgCallback(label, newValue);
            }
        });
    }
};

