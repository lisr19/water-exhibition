
function worker_func() {
    self.addEventListener("message", function(e) {
        var data = e.data;
        switch (data["cmd"]) {
        case "start":
            break;

        case "stop":
            this.postMessage({"cmd": "stopped"});
            self.close();
            break;

        case "convert":
            var d = data["data"];
            var img = _do_convert_yuv2rgb(d["chroma"], d["y"], d["u"], d["v"],  d["w"], d["h"], d["stridey"], d["strideu"], d["stridev"], 
                d["bppy"], d["bppu"], d["bppv"]);
            this.postMessage({"cmd": "converted", "data": {"image": img}}, [img.buffer]);
            break;

        default:
            // ignore unknown commands
            break;
        }
    }, 0);
}


function _do_convert_yuv420(y, u, v, w, h, stridey, strideu, stridev, bppy, bppu, bppv, dest) {
    var yval;
    var uval;
    var vval;
    var xpos = 0;
    var ypos = 0;
    var w2 = w >> 1;
    var maxi = w2*h;
    var yoffset = 0;
    var uoffset = 0;
    var voffset = 0;
    var x2;
    var i2;
    for (var i=0; i<maxi; i++) {
        i2 = i << 1;
        x2 = (xpos << 1);
        yval = 1.164 * (y[yoffset + x2] - 16);

        uval = u[uoffset + xpos] - 128;
        vval = v[voffset + xpos] - 128;
        dest[(i2<<2)+0] = yval + 1.596 * vval;
        dest[(i2<<2)+1] = yval - 0.813 * vval - 0.391 * uval;
        dest[(i2<<2)+2] = yval + 2.018 * uval;
        dest[(i2<<2)+3] = 0xff;

        yval = 1.164 * (y[yoffset + x2 + 1] - 16);
        dest[((i2+1)<<2)+0] = yval + 1.596 * vval;
        dest[((i2+1)<<2)+1] = yval - 0.813 * vval - 0.391 * uval;
        dest[((i2+1)<<2)+2] = yval + 2.018 * uval;
        dest[((i2+1)<<2)+3] = 0xff;

        xpos++;
        if (xpos === w2) {
            xpos = 0;
            ypos++;
            yoffset += stridey;
            uoffset = ((ypos >> 1) * strideu);
            voffset = ((ypos >> 1) * stridev);
        }
    }
}

function _do_convert_yuv2rgb(chroma, y, u, v, w, h, stridey, strideu, stridev, bppy, bppu, bppv, dest) {
    if (!dest) {
        dest = new Uint8ClampedArray(w*h*4);
    }
    // NOTE: we can't use libde265 constants here as the function can also be
    // run inside the Worker where "libde265" is not available.
    switch (chroma) {
    case 0:  /* libde265.de265_chroma_mono */
        // TODO(fancycode): implement me
        console.log("Chroma format not implemented yet", chroma, bppy, bppu, bppv);
        break;
    case 1:  /* libde265.de265_chroma_420 */
        if (bppy !== 8 || bppu !== 8 || bppv !== 8) {
            // TODO(fancycode): implement me
            console.log("Chroma format not implemented yet", chroma, bppy, bppu, bppv);
        } else {
            _do_convert_yuv420(y, u, v, w, h, stridey, strideu, stridev, bppy, bppu, bppv, dest);
        }
        break;
    case 2:  /* libde265.de265_chroma_422 */
        // TODO(fancycode): implement me
        console.log("Chroma format not implemented yet", chroma, bppy, bppu, bppv);
        break;
    case 3:  /* libde265.de265_chroma_444 */
        // TODO(fancycode): implement me
        console.log("Chroma format not implemented yet", chroma, bppy, bppu, bppv);
        break;
    default:
        console.log("Unsupported chroma format", chroma, bppy, bppu, bppv);
        break;
    }
    return dest;
}

var worker_blob_url = null;
var WorkerConverter = function() {
    this.player = new RawPlayer(BidogSdk.video265);

    this.callbacks = [];
    if (worker_blob_url === null) {
        // load worker from inplace blob so we don't have to depend
        // on additional external files
        var worker_func_data = worker_func.toString();
        var worker_func_name = worker_func.name;
        if (!worker_func_name) {
            // Get name of function for older browsers and IE.
            // See http://stackoverflow.com/a/17923727/608954
            worker_func_name = /^function\s+([\w\$]+)\s*\(/.exec(worker_func_data)[1];
        }
        var blob = new Blob([
            "(function() {\n",
            _do_convert_yuv420.toString() + ";\n",
            _do_convert_yuv2rgb.toString() + ";\n",
            worker_func_data + ";\n",
            worker_func_name + "();\n",
            "}).call(this);"
        ], {"type": "text/javascript"});

        worker_blob_url = window.URL.createObjectURL(blob);
    }

    var that = this;
    this.worker = new Worker(worker_blob_url);
    this.worker.addEventListener('message', function(e) {
        switch (e.data["cmd"]) {
        case "converted":
            if (that.callbacks.length > 10){
                console.log("callbacks ", that.callbacks.length);
                that.callbacks = that.callbacks.slice(that.callbacks.length - 5);
            }
            if (that.callbacks.length == 0) {
                break;
            }
            for (var i = 0;i < that.callbacks.length - 1; i++) {
                var cb = that.callbacks[0];
                that.callbacks = that.callbacks.splice(1);
                cb(e.data["data"]["image"]);
            }
            break;
        case "stopped":
            that.callbacks = null;
            that = null;
            break;

        default:
            // ignore unknown commands
            break;
        }
    }, false);
    this.worker.postMessage({"cmd": "start"});
};

WorkerConverter.prototype.destroy = function() {
    if (this.worker) {
        this.worker.postMessage({"cmd": "stop"});
        this.worker = null;
    }
};

WorkerConverter.prototype.convert = function(chroma, y, u, v, w, h, stridey, strideu, stridev, bppy, bppu, bppv) {
    var msg = {
        "cmd": "convert",
        "data": {
            "chroma": chroma,
            "y": y,
            "u": u,
            "v": v,
            "w": w,
            "h": h,
            "stridey": stridey,
            "strideu": strideu,
            "stridev": stridev,
            "bppy": bppy,
            "bppu": bppu,
            "bppv": bppv
        }
    };
    var image_data = this.player._get_img_data(w, h);
    var that = this;
    this.callbacks.push(function(data) {
        if (image_data.data.set) {
            image_data.data.set(data);
        } else {
            var dest = image_data.data;
            var cnt = dest.length;
            for (var i=0; i<cnt; i++) {
                dest[i] = data[i];
            }
        }
        that.player._display_image(image_data);
    });
    this.worker.postMessage(msg, [y.buffer, u.buffer, v.buffer]);
};




/**
 * A simple raw bitstream player interface.
 *
 * @constructor
 */
var RawPlayer = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ratio = null;
    this.filters = false;
    this._reset();
};

RawPlayer.prototype._reset = function() {
    this.start = null;
    this.frames = 0;
    this.image_data = null;
    this.running = false;
    this.queue = null;
    this.pending_image_data = null;
    this.queue = [];
};

RawPlayer.prototype._get_img_data = function(w, h) {
    if (w != this.canvas.width || h != this.canvas.height || !this.image_data) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.image_data = this.ctx.createImageData(w, h);

        var image_data = this.image_data.data;
        for (var i=0; i<w*h; i++) {
            image_data[i*4+3] = 255;
        }
    }
    return this.image_data;
}


RawPlayer.prototype._display_image = function(image_data) {
    if (window.requestAnimationFrame) {
        this.pending_image_data = image_data;
        var that = this;
        window.requestAnimationFrame(function() {
            if (that.pending_image_data) {
                that.ctx.putImageData(that.pending_image_data, 0, 0);
                that.pending_image_data = null;
            }
        });
    } else {
        this.ctx.putImageData(image_data, 0, 0);
    }

    return image_data;
}

/** @expose */
RawPlayer.prototype.stop = function() {
    this._reset();
};

/** @expose */
RawPlayer.prototype.set_framerate_ratio = function(ratio) {
    this.ratio = ratio;
};

/** @expose */
RawPlayer.prototype.disable_filters = function(disable) {
    this.filters = disable;
};
