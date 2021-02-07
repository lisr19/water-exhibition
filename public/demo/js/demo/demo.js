$(function () {
    defaultLanguage('cn');
    $.cookies.set('language', 'cn');
});

function eventThing() {
    var isWebgl2 = document.createElement('canvas').getContext('webgl2'),
        renderJs = isWebgl2 ? "./js/video/super-render20.js" : "./js/video/super-render10.js";
    $LAB.script(renderJs);
    isDisableButton(true);
	$('.J-play').on('click', function () {
		var deviceId = String($('.J-device-id').val()),
			user = String($('.J-user').val()),
			password = String($('.J-password').val()),
			channel = $('.J-channel').val(),
			videoType = $('.J-video-type').val(),
			calendar = $('.J-calendar').val(),
			stream = $('.J-stream').val();
		if (!deviceId || !user || !password || !channel) {
			alert(lang.deviceinfo.labError);
			return;
		}
		if (videoType == 'remoteplayback' && !calendar) {
			alert(lang.localviewer.labPleaseSetDate);
			return;
		}

		$('.J-loading').show();
		var deviceInfoBysql = {
			channel: channel,
			deviceId: deviceId,
			localPwd: password,
			localUser: user,
			stream: stream ? stream : -1,
			playbackInfo: {
				fileType: "4",
				streamId: "0"
			},
			playbackTime: calendar
		};
		BidogSdk.init(deviceInfoBysql);
		BidogSdk.initSocket(videoType);
		videoType == 'livevideo' && $('.J-stream-block').show();
		isDisableButton(false);
		BidogSdk.monitorValueChange(BidogSdk, 'playStatus', function (label, val) {
			val ? $('.J-loading').hide() : $('.J-loading').show();
		});
		BidogSdk.getDeviceStatus(deviceId, function (status) {
			getDeviceLineStatus(status);
		});
	});


    //停止视频
    $('.J-stop').on('click', function () {
        var videoType = $('.J-video-type').val(),
            channelId = parseInt($('.J-channel').val()),
            streamId = parseInt($('.J-stream').val());
        videoType == 'livevideo' ? BidogSdk.stopVideo(channelId, streamId) : BidogSdk.stopRecord(channelId);
        // BidogSdk.stopAudio();
    });

    //打开音频
    $('.J-play-audio').on('click', function () {
        BidogSdk.playAudio();
    });

    //关闭音频
    $('.J-stop-audio').on('click', function () {
        BidogSdk.stopAudio();
    });

    //PTZ控制
    var ptzUpNum;
    $('.J-ptz').on('mousedown', function () {
        var ptzDownNum = parseInt($(this).attr('data-id'));
        ptzUpNum = ptzDownNum + 1;
        BidogSdk.setPtz(ptzDownNum);
    }).on('mouseup', function () {
        BidogSdk.setPtz(ptzUpNum);
    });

    //切换码流
    $('.J-stream').on('change', function () {
        $('.J-loading').show();
        if ($('#video-265').is(':visible') == true && parseInt($('.J-stream').val()) == 0) {
            alert(lang.videoplay.labTip);
        }
        BidogSdk.currentStreamId = parseInt($(this).val());
        BidogSdk.streamMediaConnect();
    });

    //选择回放
    $('.J-video-type').on('change', function () {
        if ($(this).val() == 'remoteplayback') {
            $('.J-playback-block').show();
            getCalendar();
            $('.J-stream-block,.J-ptz,.J-enlarge').hide();

        } else {
            $('.J-stream-block,.J-ptz,.J-enlarge').show();
            $('.J-playback-block').hide();
        }
    });

    //刻度尺调节
    $('.J-scale-control').on('click', function () {
        $(this).attr('data-id') == 1 ? extimeline() : natimeline();
    });

    //电子放大
    $('.J-enlarge').on('click', function () {
        $('#canvas-enlarge').addClass('show');
        BidogSdk.enlarge();
    });

    //切换通道号时，码流隐藏
    $('.J-device-id').on('blur', function () {
        $('.J-stream-block').hide();
        $('.J-stream').val('-1');
    });

    //鼠标移上相关按钮时显示提示框
    $(".J-ptz").mouseenter(function () {
        // console.log("inMouseenter");
        var actualLeft = $(this).offset().left;
        var actualTop = $(this).offset().top;
        // console.log("LEFT:" + actualLeft + ",TOP:" + actualTop);
        $("#txt").css({
            "margin-left": actualLeft - 5 + "px",
            //放置图片的地方刚好和鼠标重合时，会一直触发鼠标事件
            "margin-top": "-60px",
            "display": "block"
        });
    });
    $(".J-ptz").mouseleave(function () {
        $("#txt").css("display", "none");
    });

    // 语言切换
    $(".lanSelect").val($.cookies.get('language'));
    // console.log($.cookies.get('language'));
    $(".lanSelect").on('change', function () {
        var value = $(".lanSelect option:selected").attr("value");
        $.cookies.set('language', value);
        chooseLanguage(value);
    });

    //刷新设备状态
    $(".J-refresh-status").on('click', function () {
        BidogSdk.getDeviceStatus($('.J-device-id').val(), function (status) {
            getDeviceLineStatus(status);
        });
    });

    //截图
    $(".J-capture").on('click', function () {
        BidogSdk.capture(function (data) {
            data && downImgFromDataUrl(data);
        });
    });
};

/**
 * 只显示支持的码流
 */
function getStreamList() {
    var html;
    for (var i in BidogSdk.streamList) {
        if (i == 0) {
            // html += '<option value="' +  i  + '">' + BidogSdk.streamList[i] + '</option>';
            html += '<option value="' + i + '">' + lang.videoplay.labHD + '</option>';
        } else if (i == 1) {
            html += '<option value="' + i + '">' + lang.videoplay.labBD + '</option>';
        } else {
            html += '<option value="' + i + '">' + lang.videoplay.labFluent + '</option>';
        }
    }
    $('.J-stream').html(html).val(BidogSdk.currentStreamId);
    // $('.J-stream').empty().append(html).val(BidogSdk.currentStreamId);
}

/**
 * 日历
 */
function getCalendar() {
    $('.J-calendar').click(function () {
        BidogSdk.searchVideoResNum = BidogSdk.totalRecordCounts = 0;
        BidogSdk.curRecordCounts = BidogSdk.playVideoPart = 0;
        BidogSdk.recordFileInfo = BidogSdk.recordFileArr = [];
        $('.ui-datepicker').toggle();
        $('.J-select-time').datepicker({
            autoclose: true,
            todayHighlight: true,
            format: 'm/d/yyyy'
        }).on('change', function (dateText) {
            $('.ui-datepicker').hide();
            var sdate = dateText.currentTarget.value;
            $('.J-calendar').val(sdate);
        })
    });
}

/**
 * 未播放前，禁止其他按钮操作
 * @param flag
 */
function isDisableButton(flag) {
    $('.J-stop,.J-play-audio,.J-stop-audio,.J-ptz,.J-enlarge,.J-capture').attr('disabled', flag);
}

/**
 * 时间戳转化 2018-11-11 00:00:00
 *
 * @param str 时间戳
 * @returns {string}
 */
function getMyDate(str) {
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oHour = oDate.getHours(),
        oMin = oDate.getMinutes(),
        oSen = oDate.getSeconds(),
        oTime = oYear + '-' + getzf(oMonth) + '-' + getzf(oDay) + ' ' + getzf(oHour) +
            ':' + getzf(oMin) + ':' + getzf(oSen);
    return oTime;
}

/**
 * 补0操作
 *
 * @param num 时间
 * @returns {*}
 */
function getzf(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}

/**
 * 页面初始化
 */
function defaultLanguage() {
    $("#content").html(template($("#template").html(), lang));
    eventThing();
}

/**
 * 国际
 * @param {*} value 
 */
function chooseLanguage(value) {
    if (value === "cn") {
        loadJs("./js/lang/cn.js");
        setTimeout(function () {
            //模板渲染后绑定的点击事件无效（和运行顺序有关），想着重新绑定，所以取了个名字，调用于渲染之后
            $("#content").html(template($("#template").html(), lang));
            eventThing();
        }, 1000)
    } else {
        // console.log($(".lanSelect").val());
        loadJs("./js/lang/en.js");
        setTimeout(function () {
            $("#content").html(template($("#template").html(), lang));
            eventThing();
        }, 1000)
    }
}

/**
 * 国际化之加载不同的语言包js文件
 * @param {*} src 
 */
function loadJs(src) {
    var de = document.getElementsByTagName("script")[0];
    de.parentNode.removeChild(de);
    var JSONP = document.createElement('script');
    JSONP.type = 'text/javascript';
    JSONP.src = src;
    document.getElementsByTagName("head")[0].appendChild(JSONP);
}

/**
 * 获取设备在线情况
 * @param {*} data 
 */
function getDeviceLineStatus(data) {
    var test = "";
    switch (data) {
        case 0:
            test = lang.deviceinfo.labNotOnline;
            isDisableButton(true);
            break;
        case 1:
            test = lang.deviceinfo.labOnline;
            break;
    };
    $(".J-status").html(test);
}

/**
 * Safari
 */
function isSafari() {
    // chrome拥有safari字符，判断不出
    // 需要判断拥有safari字符，且没有chrome字符的
    return /Safari/.test(window.navigator.userAgent) && !/Chrome/.test(window.navigator.userAgent);
}

/**
 * 截图地址
 * @param {*} url 图片路径
 */
function downImgFromDataUrl(url) {
    var aTag = document.createElement('a'),
        nowTime = new Date(),
        now = nowTime.toLocaleDateString() + "_" + nowTime.getHours() + "_" + nowTime.getMinutes() + "_" + nowTime.getSeconds()
    if (!isSafari()) {
        var blob = dataURLtoBlob(url);
        aTag.href = URL.createObjectURL(blob);
    } else {
        aTag.href = url;
    }
    aTag.download = now + ".jpeg";
    // aTag.click();
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    aTag.dispatchEvent(event);
}

/**
 * @funtion  base64 To Blob
 * @Author   gzr
 * @DateTime 2019-12-13
 * @param    {[type]}   dataurl [description]
 * @return   {[type]}           [description]
 */
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
