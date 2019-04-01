/*
    autour beckwu
    arcCenter: 圆心坐标
    outRadius： 外圈圆半径
    outArcData： 外圈圆数据，eg： [[0.5,"#FFA500"],[0.25, "#00FF00"],[0.25,"#0000FF"]]
    outMaskScale： 外圈遮罩圆比例
    outMaskColor： 外圈遮罩颜色
    innerRadius： 内圈圆半径
    innerArcData： 内圈圆数据 eg：[[0.5,"#FFA500"],[0.25, "#00FF00"],[0.25,"#0000FF"]]
    innerMaskScale： 内圈圆遮罩比列
    innerMaskColor： 内圈圆遮罩颜色
    startRad： 起始弧度
    endRad: 结束弧度
    step: 步长 取值0 ~ 1之前 值越大动画越快
    anmiation: 动画，
*/
function Disc(canvas, userOptions) {

    deafualtOptions = {
        arcCenter: [],
        outRadius: 0,
        outArcData: [],
        outMaskScale: 0,
        outMaskColor: "#ffffff",
        innerRadius: 0,
        innerArcData: [],
        innerMaskScale: 0,
        innerMaskColor: "#ffffff",
        startRad: Math.PI,
        endRad: 2 * Math.PI,
        step: 0.002,
        animation: true,
    }
    this.options = { ...deafualtOptions, ...userOptions }
    if (canvas.getContext) {
        this.ctx = canvas.getContext('2d');
        this.adjustPixel(canvas);
    }
}

Disc.prototype.adjustPixel = function (canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    if (window.devicePixelRatio) {
        canvas.style.width = this.width + "px";
        canvas.style.height = this.height + "px";
        canvas.height = this.height * window.devicePixelRatio;
        canvas.width = this.width * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}
Disc.prototype.getOptions = function () {
    return this.options;
}
Disc.prototype.getContext = function () {
    return this.ctx;
}
Disc.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height)
}

Disc.prototype.checkRadOver2PI = function (rad) {
    if (rad > 2 * Math.PI) {
        return (rad - 2 * Math.PI)
    }
    return rad;
}
Disc.prototype.checkStartOverEnd = function () {
    var endRad = this.options.endRad;
    var startRad = this.options.startRad;
    if (startRad > endRad) {
        return endRad += 2 * Math.PI;
    }
    return endRad
}
/* 
    radius: 半径
    data: 圆环数据 eg：[[0.6, "#03c342"], [0.3, "#fc9801"], [0.1, "#e81f1f"]]
*/
Disc.prototype.drawArc = function (radius, data) {
    var endRad = this.checkStartOverEnd();
    var startRad = this.options.startRad;
    var arcCenter = this.options.arcCenter;
    var sum = data.reduce((preValue, curValue) => {
        return (preValue + curValue[0])
    }, 0);
    var startAngle = startRad; // 开始点
    for (var i in data) {
        this.ctx.beginPath();
        this.ctx.moveTo(arcCenter[0], arcCenter[1]);
        var value = data[i][0];
        var color = data[i][1];
        var endSectorRad = startAngle + (endRad - startRad) * value / sum; //结束点
        var calculateRad = this.checkRadOver2PI(endSectorRad);
        this.ctx.fillStyle = color;
        this.ctx.arc(arcCenter[0], arcCenter[1], radius, startAngle, calculateRad);
        this.ctx.fill();
        startAngle = calculateRad;
    }
}
/* 
    arcCenter圆心坐标
 */
Disc.prototype.drawMaskArc = function (maskScale, maskColor) {
    var arcCenter = this.options.arcCenter;
    var outRadius = this.options.outRadius;
    var radius = maskScale * outRadius; // 圆弧半径
    this.ctx.beginPath();
    this.ctx.moveTo(arcCenter[0], arcCenter[1]);
    this.ctx.fillStyle = maskColor;
    this.ctx.arc(arcCenter[0], arcCenter[1], radius, 0, 2 * Math.PI);
    this.ctx.fill();
}

Disc.prototype.drawOneFrame = function (curStep, curRad) {
    var color = this.findFillColor(curStep);
    this.clear();
    //画外圈圆
    this.drawArc(this.options.outRadius, this.options.outArcData);
    this.drawMaskArc(this.options.outMaskScale, this.options.outMaskColor);
    //画内圈圆
    this.drawArc(this.options.innerRadius, this.options.innerArcData);
    this.drawMaskArc(this.options.innerMaskScale, this.options.innerMaskColor);
    //填充圆环
    this.drawRing(curRad, color);
    this.drawMaskArc(this.options.innerMaskScale, this.options.innerMaskColor);
    this.drawText(parseInt(curStep * 100) + "%", color);

}
Disc.prototype.drawRing = function (curRad, color) {
    var startRad = this.options.startRad;
    var arcCenter = this.options.arcCenter;
    var radius = this.options.innerRadius;
    this.ctx.beginPath();
    this.ctx.moveTo(arcCenter[0], arcCenter[1]);
    this.ctx.fillStyle = color;
    this.ctx.arc(arcCenter[0], arcCenter[1], radius, startRad, curRad);
    this.ctx.fill();
}
Disc.prototype.requestAnimationNextFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60) }
}
Disc.prototype.findFillColor = function (scale) {
    var data = this.options.outArcData;
    var sum = data.reduce((preValue, curValue) => {
        return (preValue + curValue[0])
    }, 0);
    var proportion = 0;
    for (var i = 0; i < data.length; i++) {
        proportion += data[i][0] / sum;
        if (scale <= proportion) {
            return data[i][1];
        }
    }

}
Disc.prototype.drawText = function (text, color = this.options.outArcData[0][1]) {
    var arcCenter = this.options.arcCenter;
    this.ctx.font = "24px serif";
    var tm = this.ctx.measureText(text);
    var offsetX = (tm && tm.width) ? tm.width / 2 : 0;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, arcCenter[0] - offsetX, arcCenter[1]);
}
/*
    draw 绘画仪表盘入口
    percent： 百分数 
 */
Disc.prototype.draw = function (percent) {
    var that = this;
    var endRad = this.checkStartOverEnd();
    var startRad = this.options.startRad;
    var endFillRad = this.checkRadOver2PI(startRad + (endRad - startRad) * percent);
    var nextFarme = this.requestAnimationNextFrame();
    var animation = this.options.animation;
    var curStep = 0;
    var step = this.options.step;
    var stepRad = (endRad - startRad) * step;
    var curRad = startRad;
    function drawFrame(timestamps) {
        if (!animation) {
            curStep = percent;
        } else {
            curStep += step;
        }
        if (curStep >= percent) {
            curRad = endFillRad;
            that.drawOneFrame(curStep, curRad)
        } else {
            curRad = that.checkRadOver2PI(curRad + stepRad);
            that.drawOneFrame(curStep, curRad)
            nextFarme(drawFrame);
        }
    }
    nextFarme(drawFrame);
}