const canvas = document.getElementById("canvas")
const canvas2 = document.getElementById("canvas2")
const ctx = canvas.getContext("2d")
const ctx2 = canvas2.getContext("2d")
const HTML = {
    data1: document.getElementsByClassName('data1')[0]
}


const print = (t) => console.log(t)

const mapData = [
    [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 3, 0, 0, 0, 0, 2, 3, 1, 3, 1, 1, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 2, 3, 1],
    [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 2, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 1, 2, 3, 2]
]
const eventPos = []

const data = {
    size: 800 / mapData.length,
    count: 100,
    color: 'rgba(255,255,255, 0.2)',
    lineWidth: 1,
    reflectCount: 0,
    visionWide: Math.PI * 3 / 6,
    moveSpeed: 6,
    cameraSpeed: 0.02
}
data.halfVision = data.visionWide / 2

function isOver(value) {
    if (0 >= value || value >= canvas.width) {
        return true
    }
    return false
}

function getHitWallPos(pos1, pos2, dir) {
    var a = [pos1.x, pos1.y]
    var b = [pos2.x, pos2.y]
    if (dir.x < 0) {
        a[0] = pos2.x
        b[0] = pos1.x
    }
    if (dir.y < 0) {
        a[1] = pos2.y
        b[1] = pos1.y
    }

    for (var i in eventPos) {
        var p1 = [eventPos[i][0] * data.size, eventPos[i][1] * data.size]
        var p2 = [p1[0] + data.size, p1[1] + data.size]

        var isInX = [a[0] >= p1[0] && a[0] <= p2[0], b[0] >= p1[0] && b[0] <= p2[0]]
        var isInY = [a[1] >= p1[1] && a[1] <= p2[1], b[1] >= p1[1] && b[1] <= p2[1]]
        var conX1 = a[0] - 1 <= p1[0] && b[0] + 1 >= p1[0]
        var conX2 = a[0] - 1 <= p2[0] && b[0] + 1 >= p2[0]
        var conY1 = a[1] - 1 <= p1[1] && b[1] + 1 >= p1[1]
        var conY2 = a[1] - 1 <= p2[1] && b[1] + 1 >= p2[1]
        if ((conX1 || conX2) && isInY[0] && isInY[1]) {
            return {
                pos: eventPos[i],
                axis: 0,
                value: mapData[eventPos[i][1]][eventPos[i][0]]
            }
        }
        if ((conY1 || conY2) && isInX[0] && isInX[1]) {
            return {
                pos: eventPos[i],
                axis: 1,
                value: mapData[eventPos[i][1]][eventPos[i][0]]
            }
        }
    }
    return 0
}

class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    normalized() {
        var size = Math.sqrt(this.sizeSquare())
        return new Vector(this.x / size, this.y / size)
    }
    mul(m) {
        this.x *= m
        this.y *= m
    }
    add(v) {
        this.x += v.x
        this.y += v.y
    }
    isOver() {
        return [isOver(this.x), isOver(this.y)]
    }
    toStr() {
        return `(${this.x}, ${this.y})`
    }
}

class Light {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.color = data.color
        this.lastValue = -1
        this.record = []
        this.stops = []
    }
    drawMe() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
    draw(seta, isLast = false) {
        ctx.strokeStyle = this.color
        const dir = new Vector(Math.cos(seta), Math.sin(seta))
        var current = new Vector(this.x, this.y)
        var before = new Vector(this.x, this.y)
        var distanceIndex = 0
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        var tick = 0

        while (true) {
            var over = current.isOver()
            if (over[0] || over[1]) {
                break
            }
            current.add(dir)
            var hpos = getHitWallPos(before, current, dir)
            if (hpos) {
                hpos.x = current.x,
                    hpos.y = current.y
                break
            }
            ctx.lineTo(current.x, current.y)
            before.x = current.x
            before.y = current.y
            distanceIndex++
        }
        ctx.stroke()
        ctx.closePath()
        if (over[0] || over[1]) {
            hpos = {
                value: 0,
                x: current.x,
                y: current.y
            }
        }

        //<---------[3D render]--------->
        if (this.lastValue != hpos.value || isLast) {
            // print(`${this.lastValue} -> ${hpos.value}`)
            if (this.lastValue != -1) {
                var op1 = 200 / this.record[0].distance
                var op2 = 200 / distanceIndex
                var color1 = ''
                var color2 = ''
                if (this.lastValue == 0) {
                    color1 = `rgba(255,255,255,${op1})`
                    color2 = `rgba(255,255,255,${op2})`
                } else if (this.lastValue == 1) {
                    color1 = `rgba(255,155,10,${op1})`
                    color2 = `rgba(255,155,10,${op1})`
                } else if (this.lastValue == 2) {
                    color1 = `rgba(200, 150,255,${op1})`
                    color2 = `rgba(200, 150,255,${op1})`
                } else if (this.lastValue == 3) {
                    color1 = `rgba(100, 250,155,${op1})`
                    color2 = `rgba(100, 250,155,${op1})`

                }

                this.record[1] = { seta: seta, distance: distanceIndex }
                var h1 = 20000 / this.record[0].distance
                var h2 = 20000 / this.record[1].distancev
                var x1 = 100 + (this.record[0].seta - viewSeta) * 400
                var x2 = 100 + (this.record[1].seta - viewSeta) * 400
                var paint = ctx2.createLinearGradient(x1, h1, x2, h1)
                paint.addColorStop(0, color1);
                paint.addColorStop(1, color2);
                ctx2.fillStyle = paint
                ctx2.beginPath()
                ctx2.lineTo(this.stops[0][0], this.stops[0][1] + 400)
                for (var i in this.stops) {
                    ctx2.lineTo(this.stops[i][0], this.stops[i][1] + 400)
                }
                for (var i = this.stops.length - 1; i >= 0; i--) {
                    ctx2.lineTo(this.stops[i][0], -this.stops[i][1] + 400)
                }
                //ctx2.lineTo(x2, h2 + 400)
                //ctx2.lineTo(x2, -h2 + 400)
                //ctx2.lineTo(x1, -h1 + 400)
                ctx2.fill()
                ctx2.closePath()
            }
            //new Set
            this.record[0] = { seta: seta, distance: distanceIndex }
            this.lastValue = hpos.value
            this.stops = []
        }
        this.stops.push([100 + (seta - viewSeta) * 400, 20000 / distanceIndex])
        /*var height = 20000 / distanceIndex
        ctx2.strokeStyle = 'white'
        var pos = [100 + (seta - viewSeta) * 400, 400 - height, 7, height * 2]
        if (over[0] || over[1]) {
            ctx2.fillStyle = `rgba(255,255,255,${200 / distanceIndex})`
        } else if (hpos.value == 1) {
            ctx2.fillStyle = `rgba(255,155,10,${200 / distanceIndex})`
        } else if (hpos.value == 2) {
            ctx2.fillStyle = `rgba(200, 150,255,${200 / distanceIndex})`
        } else if (hpos.value == 3) {
            ctx2.fillStyle = `rgba(100, 250,155,${200 / distanceIndex})`
        }

        ctx2.fillRect(pos[0], pos[1], 7, height * 2)*/
        return hpos
    }

}

const light = new Light(200, 600)

var seta_i = 0
function renderLight() {
    if (seta_i >= data.count) {
        return
    }
    for (var j in light) {
        light[j].draw(Math.PI * 2 / data.count * seta_i)
    }
    seta_i++
    requestAnimationFrame(renderLight)
}

for (var i in mapData) {
    for (var j in mapData[i]) {
        if (mapData[i][j] != 0) {
            eventPos.push([Number(j), Number(i)])
        }
    }
}

var viewSeta = 0
ctx.lineWidth = data.lineWidth
function render() {
    ctx.clearRect(0, 0, 800, 800)
    ctx2.clearRect(0, 0, 800, 800)
    ctx.strokeStyle = 'white'
    for (var i in eventPos) {
        ctx.strokeRect(eventPos[i][0] * data.size, eventPos[i][1] * data.size, data.size, data.size)
    }
    var ppp = ''
    for (var i = 0; i < data.count + 1; i++) {
        if (i == data.count) {
            var result = light.draw(data.visionWide / data.count * i + viewSeta, true)
        } else {
            var result = light.draw(data.visionWide / data.count * i + viewSeta)
        }
        if (!result) {
            ppp += `0`
            continue
        }
        ppp += `${result.value}`
    }
    HTML['data1'].innerHTML = ppp
    light.lastValue = -1
    light.record = []
    requestAnimationFrame(render)
}

window.addEventListener('keydown', (ev) => {
    const dir = new Vector(Math.cos(viewSeta + data.halfVision), Math.sin(viewSeta + data.halfVision))
    dir.mul(data.moveSpeed)
    const bub = new Vector(dir.y, dir.x)
    switch (ev.key) {
        case 'd':
            light.x -= bub.x
            light.y += bub.y
            break
        case 'a':
            light.x += bub.x
            light.y -= bub.y
            break
        case 'w':
            light.x += dir.x
            light.y += dir.y
            break
        case 's':
            light.x -= dir.x
            light.y -= dir.y
            break
    }
    if (light.x >= 800) {
        light.x = 799
    }
    else if (light.x < 1) {
        light.x = 1
    }
    if (light.y >= 800) {
        light.y = 799
    }
    else if (light.y < 1) {
        light.y = 1
    }
    switch (ev.key) {
        case 'o':
            viewSeta -= data.cameraSpeed
            break
        case 'p':
            viewSeta += data.cameraSpeed
            break
    }
})

var lastMouse = [0, 0]

canvas2.addEventListener('mouseenter', (ev) => {
    lastMouse = [ev.clientX, ev.clientY]
})

canvas2.addEventListener('mousemove', (ev) => {
    viewSeta -= (ev.clientX - lastMouse[0]) * data.cameraSpeed * 2
    lastMouse = [ev.clientX, ev.clientY]
})

render()