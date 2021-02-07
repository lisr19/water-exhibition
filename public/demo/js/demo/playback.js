var tlTimeline = null;
var nSType = 7;
$(function () {
    initCanvas();
});

/**
 * 初始化画布
 */
function initCanvas() {
    var canvas = document.getElementById("timeline");
    if (canvas.getContext) {
        var width = $(".J-video-block").width();
        tlTimeline = new T(canvas, width, 55);
        tlTimeline.C(drag);
    } else {
        $("#timebar").html('');
    }
}

/**
 * 画出时间片段
 *
 * @param fragmentInfo
 */
function drawTimeLine(fragmentInfo) {
    initCanvas();
    if (fragmentInfo.length > 0) {
        for (var i = 0; i < fragmentInfo.length; i++) {
            var sTime = fragmentInfo[i][BidogSdk.sTimeSub];
            var eTime = fragmentInfo[i][BidogSdk.eTimeSub];
            if (sTime) {
                tlTimeline.F(getMyDate(sTime), getMyDate(eTime), 0);
            }
        }
        tlTimeline.M(getMyDate(fragmentInfo[0][BidogSdk.sTimeSub]));
    }
}

/**
 * 实现拖动代码
 *
 */
function drag() {
    var currentTime = new Date(tlTimeline.j.ST()).getTime();
    BidogSdk.recordTimebeat(currentTime);
    BidogSdk.dragTimeStamp = currentTime;
}

/**
 * 跟随视频流跳动
 */
function beatByVideo(time) {
    tlTimeline.M(getMyDate(time));
}

/**
 * 时间刻度放大
 */
function extimeline() {
    nSType++;
    if (nSType > 12) {
        nSType = 12;
        return;
    }
    try {
        tlTimeline.S(nSType);
    } catch (e) {
    }
}

/**
 * 时间刻度缩小
 */
function natimeline() {
    nSType--;
    if (nSType < 6) {
        nSType = 6;
        return;
    }
    try {
        tlTimeline.S(nSType);
    } catch (e) {
    }
}

/**
 * 根据时间信息确定位置上色
 *
 * @param x
 * @param y
 * @param w
 * @param h
 * @param t
 * @param c
 * @param b
 * @param e
 * @constructor
 */
function FileInfo(x, y, w, h, t, c, b, e) {
    this.h = h;
    this.c = c;
    this.t = t;
    this.bt = b;
    this.et = e;
    this.x = x;
    this.s = 0;
    this.b = 0;
    this.m_y = y;
    this.w = w;

    FileInfo.prototype.IR = function (l, r) {
        if ((this.x + this.w) <= l || this.x >= r) {
            return false;
        } else {
            return true;
        }
    };

    FileInfo.prototype.SP = function (x, y, w, h) {
        this.m_y = y;
        this.h = h;
        this.x = x;
        this.w = w;

    };

    FileInfo.prototype.PR = function (s, b) {
        this.s = s;
        this.b = b;
    };

    FileInfo.prototype.D = function (g) {
        if (this.IR(this.s, this.b)) {
            var colorOld = g.fillStyle;
            g.fillStyle = this.c;
            if ((this.x >= this.s) && (this.x + this.w) <= this.b) {
                g.fillRect(this.x, this.m_y, this.w, this.h);
            } else if ((this.x < this.b) && ((this.x + this.w) > this.b)) {
                g.fillRect(this.x, this.m_y, this.b - this.x, this.h);
            } else {
                g.fillRect(this.s, this.m_y, (this.x + this.w) - this.s, this.h);
            }
            g.fillStyle = colorOld;
        }
    };

}

/**
 * 时间处理
 *
 * @constructor
 */
function Timeinfo() {
    var c = new Date();
    this.min = c.getMinutes();
    this.s = c.getSeconds();
    this.ms = c.getTime();
    this.y = c.getFullYear();
    this.mon = c.getMonth() + 1;
    this.d = c.getDate();
    this.h = c.getHours();

    Timeinfo.prototype.TS = function (ms) {
        var s = new Date(ms);
        this.h = s.getHours();
        this.min = s.getMinutes();
        this.s = s.getSeconds();
        this.ms = ms;
        this.y = s.getFullYear();
        this.mon = s.getMonth() + 1;
        this.d = s.getDate();
    };

    Timeinfo.prototype.ST = function () {
        var y = "" + this.y;

        var m;
        if (this.mon < 10) {
            m = "0" + this.mon;
        } else {
            m = "" + this.mon;
        }

        var h;
        if (this.h < 10) {
            h = "0" + this.h;
        } else {
            h = "" + this.h;
        }

        var min;
        if (this.min < 10) {
            min = "0" + this.min;
        } else {
            min = "" + this.min;
        }

        var d;
        if (this.d < 10) {
            d = "0" + this.d;
        } else {
            d = "" + this.d;
        }

        var s;
        if (this.s < 10) {
            s = "0" + this.s;
        } else {
            s = "" + this.s;
        }
        var str = y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s;
        return str;
    };

    Timeinfo.prototype.parseTime = function (szTime) {
        var d = szTime.split(' ')[0].split('-');
        var t = szTime.split(' ')[1].split(':');

        this.h = parseInt(t[0], 10);
        this.min = parseInt(t[1], 10);
        this.s = parseInt(t[2], 10);

        this.y = parseInt(d[0], 10);
        this.mon = parseInt(d[1], 10);
        this.d = parseInt(d[2], 10);

        var t = new Date();
        t.setFullYear(this.y);
        t.setMonth(this.mon - 1, this.d);

        t.setHours(this.h);
        t.setMinutes(this.min);
        t.setSeconds(this.s);

        this.ms = t.getTime();
    };
}

/**
 * 刻度信息
 *
 * @param x
 * @param y
 * @param s
 * @constructor
 */
function KeduInfo(x, y, s) {
    this.s = 0;
    this.b = 0;
    this.x = x;
    this.m_y = y;
    this.h = parseInt(s / 3600, 10);
    this.min = parseInt(s % 3600 / 60, 10);
    this.s = parseInt(s % 3600 % 60, 10);
    this.m_st = "";
    if (this.h < 10 && this.min < 10) {
        this.m_st = "0" + this.h + ":0" + this.min;
    }

    else if (this.h < 10 && this.min >= 10) {
        this.m_st = "0" + this.h + ":" + this.min;
    }

    else if (this.h >= 10 && this.min >= 10) {
        this.m_st = "" + this.h + ":" + this.min;
    }

    else {
        this.m_st = "" + this.h + ":0" + this.min;
    }

    KeduInfo.prototype.SP = function (x, y) {
        if (x < this.s) {
            x = this.b - (this.s - x);
        } else if (x > this.b) {
            x = this.s + (x - this.b);
        }
        this.x = x;
        this.m_y = y;
    };

    KeduInfo.prototype.PR = function (s, b) {
        this.s = s;
        this.b = b;
    };

    KeduInfo.prototype.IR = function (s, b) {
        if (this.x >= s && this.x <= b) {
            return true;
        } else {
            return false;
        }
    };

    KeduInfo.prototype.update = function (s) {
        this.h = parseInt(s / 3600, 10);
        this.min = parseInt(s % 3600 / 60, 10);
        this.s = parseInt(s % 3600 % 60, 10);
        if (this.h < 10 && this.min < 10) {
            this.m_st = "0" + this.h + ":0" + this.min;
        }

        else if (this.h < 10 && this.min >= 10) {
            this.m_st = "0" + this.h + ":" + this.min;
        }

        else if (this.h >= 10 && this.min >= 10) {
            this.m_st = "" + this.h + ":" + this.min;
        }

        else {
            this.m_st = "" + this.h + ":0" + this.min;
        }
    };

}

/**
 * 向左偏移
 * @param o
 * @returns {*}
 * @constructor
 */
function L(o) {
    var x = o.offsetLeft;
    while (o = o.offsetParent) {
        x += o.offsetLeft;
    }
    return x;
}

/**
 * 向上偏移
 *
 * @param o
 * @returns {*}
 * @constructor
 */
function TO(o) {
    var y = o.offsetTop;
    while (o = o.offsetParent) {
        y += o.offsetTop;
    }
    return y;
}

/**
 * 初始化时间轴
 *
 * @param timecanvas 时间轴画布
 * @param w 画布宽度
 * @param h 画布高度
 * @constructor
 */
function T(timecanvas, w, h) {
    timecanvas.width = w;
    timecanvas.height = h;
    this.m_tc = timecanvas;
    this.m_ct = timecanvas.getContext("2d");
    this.mtf = '14px Arial';//中线字体大小
    this.ctf = '12px Arial';//时间提示字体大小
    this.fsf = '12px Arial';//时间字体大小
    this.fcf = '12px Arial';
    this.bdc = 'rgb(146, 146,146)';//背景色
    this.plc = 'rgb(200, 200, 200)';//横线间隔
    this.cnc = 'rgb(210, 210, 210)';//时间字体
    this.tsc = 'rgb(210, 210, 210)';//竖线间隔
    this.mlc = 'rgb(250, 210, 0)';//中线
    this.mltc = 'rgb(251, 251, 251)';//中线字体
    this.sfc = 'rgb(51, 157, 244)';//普通片段
    this.afc = 'rgb(225,0,15)';//报警片段
    timecanvas.style.backgroundColor = this.bdc;
    this.ct = parseFloat(1.0);
    this.max = 4;
    this.m_nSelWnd = 0;
    this.m_iMinW = 1;
    this.KI = 12;
    this.a = 0;
    this.b = 2;//横线的宽度
    this.c = 40;
    this.p = 0;
    this.q = 0;
    this.r = false;
    this.s = false;
    this.t = 0;
    this.u = 0;
    this.h = parseInt(timecanvas.height, 10);//间隔高度
    this.w = parseInt(timecanvas.width, 10);
    this.j = new Timeinfo();
    this.m_ct.font = this.mtf;
    this.k = this.m_ct.measureText(this.j.ST()).width;
    this.l = new Timeinfo();
    this.m_ct.font = this.ctf;
    this.m = this.m_ct.measureText(this.l.ST()).width;
    this.d = this.h - this.c - this.b * 2;
    this.e = parseInt((this.a + this.w) / 2, 10);
    this.f = Math.floor((this.w - this.a) / this.KI);
    this.i = parseInt((3600 * this.ct * 1000) / this.f, 10);
    this.n = L(this.m_tc);
    this.o = TO(this.m_tc);
    this.KeduInfo = new Array();
    this.KeduInfoNum = parseInt(24 / this.ct, 10);

    for (var i = 0; i < this.KeduInfoNum; i++) {
        this.KeduInfo.push(new KeduInfo(0, 0, parseInt(i * 3600 * this.ct)));
    }
    this.FI = new Array(this.max);

    for (i = 0; i < this.max; i++) {
        this.FI[i] = new Array();
    }
    for (i = 0; i < this.KeduInfoNum; i++) {
        var seconds = (this.KeduInfo[i].h - this.j.h) * 3600 + (this.KeduInfo[i].min - this.j.min) * 60 + (this.KeduInfo[i].s - this.j.s);
        var iScalePos = this.e + parseInt(parseFloat(seconds / (3600 * this.ct)) * this.f);
        this.KeduInfo[i].PR(this.a, this.a + parseInt(this.f * this.KeduInfoNum));
        this.KeduInfo[i].SP(iScalePos, this.c);
    }

    this.v = function (o) {
        this.p = o.clientX;
        this.u = this.j.ms;
        this.r = true;
        A(document, 'mousemove', B(this, this.MV));
        A(document, 'mouseup', BI(this, this.SP));
        A(window, "blur", B(this, B(this, this.SP)));
        o.preventDefault();
        R(timecanvas, 'mousemove', B(this, this.MM));
    };
    this.FC = function () {
    };
    this.SP = function () {
        document.body.style.cursor = 'default';
        this.r = false;
        R(document, 'mousemove', B(this, this.MV));
        R(document, 'mouseup', B(this, this.SP));
        R(window, "blur", B(this, this.SP));
        A(timecanvas, 'mousemove', B(this, this.MM));
        this.FC();
    };
    this.MV = function (oEvent) {//拖拽
        // console.log("拖拽:"+tlTimeline.j.ST());
        document.body.style.cursor = "pointer";
        this.m_tc.style.cursor = "pointer";
        this.t = oEvent.clientX - this.p;
        if (this.r) {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            this.j.TS(this.u - this.t * this.i);//中线时间
            this.P();
        }
    };
    this.m_tc.style.cursor = "pointer";
    this.MM = function (oEvent) {//鼠标移动
        this.q = oEvent.clientX - this.n;
        this.l.TS((this.q - this.e) * this.i + this.j.ms);
        this.P();
        var szCurMouseTime = this.l.ST();
        this.m_ct.fillStyle = this.mltc;
        this.m_ct.font = this.ctf;
        this.m_ct.fillText(szCurMouseTime, (this.q - parseInt(this.m / 2)), parseInt(this.c / 4));
        // console.log("鼠标:"+tlTimeline.j.ST());
    };
    this.MO = function (oEvent) {//鼠标离开
        // console.log("鼠标离开:"+tlTimeline.j.ST());
        this.P();
    };
    A(timecanvas, 'mousedown', B(this, this.v));
    A(timecanvas, 'mousemove', B(this, this.MM));
    A(timecanvas, 'mouseout', B(this, this.MO));
    this.P();
}

T.prototype.P = function () {//每秒跳动
    var c = this.j.ST();
    this.K();
    this.U();
    this.m_ct.clearRect(0, 0, this.w, this.h);
    this.m_ct.fillStyle = this.mltc;
    this.m_ct.font = this.mtf;
    this.k = this.m_ct.measureText(c).width;
    this.m_ct.fillText(c, (this.e - parseInt(this.k / 2)), parseInt(this.c / 2) + 5);
    this.m_ct.strokeStyle = this.plc;
    this.m_ct.lineWidth = 1;
    this.m_ct.beginPath();
    this.m_ct.moveTo(this.a, this.c);
    this.m_ct.lineTo(this.a, this.h);
    this.m_ct.stroke();
    this.m_ct.lineWidth = this.b;
    this.m_ct.beginPath();
    this.m_ct.moveTo(0, this.c);
    this.m_ct.lineTo(this.w, this.c);
    this.m_ct.stroke();
    this.m_ct.beginPath();
    this.m_ct.moveTo(0, this.h - this.b / 2);
    this.m_ct.lineTo(this.w, this.h - this.b / 2);
    this.m_ct.stroke();
    this.m_ct.fillStyle = this.cnc;
    this.m_ct.font = this.fcf;
    this.m_ct.strokeStyle = this.tsc;
    this.m_ct.font = this.fsf;
    this.m_ct.lineWidth = 1;

    for (var i = 0; i < this.KeduInfoNum; i++) {
        if (this.KeduInfo[i].IR(this.a, this.w)) {
            this.m_ct.beginPath();
            this.m_ct.moveTo(this.KeduInfo[i].x, this.c);
            this.m_ct.lineTo(this.KeduInfo[i].x, this.h);
            this.m_ct.stroke();
            this.m_ct.fillText(this.KeduInfo[i].m_st, this.KeduInfo[i].x - 15, this.c - 5);
        }
    }

    for (var i = 0; i < this.FI[this.m_nSelWnd].length; i++) {
        this.FI[this.m_nSelWnd][i].D(this.m_ct);
    }

    this.m_ct.strokeStyle = this.mlc;
    this.m_ct.lineWidth = 2;
    this.m_ct.beginPath();
    this.m_ct.moveTo(this.e, 0);
    this.m_ct.lineTo(this.e, this.h);
    this.m_ct.stroke();
};

T.prototype.K = function () {//每秒跳动

    if (this.KeduInfo.length == 0) {
        return;
    }

    var s = (this.KeduInfo[0].h - this.j.h) * 3600 + (this.KeduInfo[0].min - this.j.min) * 60 + (this.KeduInfo[0].s - this.j.s);
    var p = this.e + parseInt(parseFloat(s / (3600 * this.ct)) * this.f);
    if (p < this.KeduInfo[0].s) {
        p = this.KeduInfo[0].b - (this.KeduInfo[0].s - p);
    } else if (p > this.KeduInfo[0].b) {
        p = this.KeduInfo[0].s + (p - this.KeduInfo[0].b);
    }
    var m = p - this.KeduInfo[0].x;
    if (m == 0) {
        return;
    }
    for (var i = 0; i < this.KeduInfoNum; i++) {
        var iScalePos = this.KeduInfo[i].x + m;

        this.KeduInfo[i].PR(this.a, this.a + parseInt(this.f * this.KeduInfoNum));
        this.KeduInfo[i].SP(iScalePos, this.c);
    }
};

T.prototype.U = function () {//每秒跳动
    var l = this.FI[this.m_nSelWnd].length;
    if (l == 0) {
        return;
    }
    var b = this.FI[this.m_nSelWnd][0].bt;
    var s = parseInt((b.ms - this.j.ms) / 1000);
    var f = this.e + parseInt(parseFloat(s / (3600 * this.ct)) * this.f);
    var m = f - this.FI[this.m_nSelWnd][0].x;
    if (m == 0) {
        return;
    }
    for (var i = 0; i < l; i++) {
        var x = this.FI[this.m_nSelWnd][i].x + m;
        var y = this.FI[this.m_nSelWnd][i].m_y;
        var w = this.FI[this.m_nSelWnd][i].w;
        var h = this.FI[this.m_nSelWnd][i].h;
        this.FI[this.m_nSelWnd][i].SP(x, y, w, h);
    }
};

/**
 * 刻度缩放范围
 *
 * @param t 具体数值
 * @constructor
 */
T.prototype.S = function (t) {
    switch (t) {
        case 6:
            this.KI = 12;
            this.ct = parseFloat(2.0);
            break;
        case 7:
            this.KI = 12;
            this.ct = parseFloat(1.0);
            break;
        case 8:
            this.KI = 12;
            this.ct = parseFloat(0.5);
            break;
        case 9:
            this.KI = 8;
            this.ct = parseFloat(0.5);
            break;
        case 10:
            this.KI = 12;
            this.ct = parseFloat(1 / 6);
            break;
        case 11:
            this.KI = 12;
            this.ct = parseFloat(1 / 12);
            break;
        case 12:
            this.KI = 6;
            this.ct = parseFloat(1 / 12);
            break;
        default:
            this.KI = 12;
            this.ct = parseFloat(1.0);
            return;
    }
    this.KeduInfoNum = parseInt(24 / this.ct, 10);
    this.f = Math.floor((this.w - this.a) / this.KI);
    this.i = parseInt((3600 * this.ct * 1000) / this.f, 10);

    this.KeduInfo.length = 0;
    for (var i = 0; i < this.KeduInfoNum; i++) {
        this.KeduInfo.push(new KeduInfo(0, 0, parseInt(i * 3600 * this.ct)));
    }

    for (i = 0; i < this.KeduInfoNum; i++) {
        var s = (this.KeduInfo[i].h - this.j.h) * 3600 + (this.KeduInfo[i].min - this.j.min) * 60 + (this.KeduInfo[i].s - this.j.s);
        var p = this.e + parseInt(parseFloat(s / (3600 * this.ct)) * this.f);
        this.KeduInfo[i].PR(this.a, this.a + parseInt(this.f * this.KeduInfoNum));
        this.KeduInfo[i].SP(p, this.c);
    }


    for (i = 0; i < this.FI[this.m_nSelWnd].length; i++) {
        var f = this.FI[this.m_nSelWnd][i];
        var ls = parseInt((f.bt.ms - this.j.ms) / 1000);
        var fpl = this.e + parseInt(parseFloat(ls / (3600 * this.ct)) * this.f);
        var rs = parseInt((f.et.ms - this.j.ms) / 1000);
        var fpr = this.e + parseInt(parseFloat(rs / (3600 * this.ct)) * this.f);
        if ((fpr - fpl) < this.m_iMinW) {
            fpr = fpl + this.m_iMinW;
        }
        f.SP(fpl, this.c + parseInt(this.b / 2), fpr - fpl, this.d + 2);
    }
    this.P();
};

/**
 * 处理时间信息
 *
 * @param nb 开始时间
 * @param ne 结束时间
 * @param t
 * @constructor
 */
T.prototype.F = function (nb, ne, t) {
    var b = new Timeinfo();
    var e = new Timeinfo();
    b.parseTime(nb);
    e.parseTime(ne);
    var f;
    switch (t) {
        case 0:
            f = this.sfc;
            break;
        case 1:
            f = this.afc;
            break;
        default:
            f = this.afc;
            break;
    }

    var ls = parseInt((b.ms - this.j.ms) / 1000);
    var fpl = this.e + parseInt(parseFloat(ls / (3600 * this.ct)) * this.f);
    var rs = parseInt((e.ms - this.j.ms) / 1000);
    var fpr = this.e + parseInt(parseFloat(rs / (3600 * this.ct)) * this.f);
    var fileInfo = new FileInfo(fpl, this.c + parseInt(this.b / 2), fpr - fpl, this.d + 2, t, f, b, e);
    fileInfo.PR(this.a, this.a + parseInt(this.f * this.KeduInfoNum));
    if (arguments.length >= 4) {
        this.FI[arguments[3]].push(fileInfo);
    } else {
        this.FI[this.m_nSelWnd].push(fileInfo);
    }
};

/**
 * 定位中线显示时间
 *
 * @param t
 * @constructor
 */
T.prototype.M = function (t) {
    var c = new Timeinfo();
    c.parseTime(t);
    this.j.TS(c.ms);
    this.P();
};

T.prototype.C = function (c) {
    this.FC = c;
};

var B = function (o, f) {
    //调用方法的参数截取出来
    var a = Array.prototype.slice.call(arguments).slice(2);
    return function (event) {
        return f.apply(o, [event || window.event].concat(a));
    }
};

/**
 * apply特定的作用域中调用函数，等于设置函数体内this对象的值，以扩充函数赖以运行的作用域。
 *
 * @param o 函数运行的作用域
 * @param f 参数数组
 * @returns {Function}
 * @constructor
 */
var BI = function (o, f) {
    return function () {
        return f.apply(o, arguments);
    }
};

//绑定触发事件
var A = function (o, s, f) {
    o["on" + s] = f;
};

//取消触发事件
var R = function (o, s) {
    o["on" + s] = null;
};