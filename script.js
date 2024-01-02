const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

const eventPos = []

const data = {
    size: 800 / mapData.length,
    count: 100,
    color: 'rgba(255,255,255, 0.1)',
    lineWidth: 1,
    reflectCount: 0,
    visionWide: Math.PI * 1 / 2
}

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

        var isInX = [a[0] > p1[0] && a[0] < p2[0], b[0] > p1[0] && b[0] < p2[0]]
        var isInY = [a[1] > p1[1] && a[1] < p2[1], b[1] > p1[1] && b[1] < p2[1]]
        var conX1 = a[0] < p1[0] && b[0] >= p1[0]
        var conX2 = a[0] < p2[0] && b[0] >= p2[0]
        var conY1 = a[1] < p1[1] && b[1] >= p1[1]
        var conY2 = a[1] < p2[1] && b[1] >= p2[1]
        if ((conX1 || conX2) && isInY[0] && isInY[1]) {
            return { pos: eventPos[i], axis: 0 }
        }
        if ((conY1 || conY2) && isInX[0] && isInX[1]) {
            return { pos: eventPos[i], axis: 1 }
        }
    }
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
    }
    drawMe() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
    draw(seta) {
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
                if (over[0]) {
                    dir.x *= -1
                }
                if (over[1]) {
                    dir.y *= -1
                }
                tick++
            }
            if (tick > data.reflectCount) {
                break
            }
            current.add(dir)
            var hpos = getHitWallPos(before, current, dir)
            if (hpos) {
                if (hpos.axis == 0) {
                    dir.x *= -1
                } else {
                    dir.y *= -1
                }
                current.add(dir)
                tick++
            }
            ctx.lineTo(current.x, current.y)
            before.x = current.x
            before.y = current.y
            distanceIndex++
        }
        ctx.stroke()
        ctx.closePath()
        if(over[0] || over[1]){
            return
        }

        ctx.beginPath()
        ctx.moveTo(400 + seta * 80, 400+16000/distanceIndex)
        ctx.lineTo(400 + seta * 80, 400-16000/distanceIndex)
        console.log(16000/distanceIndex)
        ctx.stroke()
        ctx.closePath()
    }

}

const light = [
    new Light(400, 400),
    //new Light(300, 600),
]

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
        if (mapData[i][j] == 1) {
            eventPos.push([Number(j), Number(i)])
        }
    }
}

var viewSeta = Math.PI / 4
ctx.lineWidth = data.lineWidth
function render() {
    ctx.strokeStyle = 'white'
    for (var i in eventPos) {
        ctx.strokeRect(eventPos[i][0] * data.size, eventPos[i][1] * data.size, data.size, data.size)
    }

    for (var j in light) {
        for (var i = 0; i < data.count + 1; i++) {
            light[j].draw(data.visionWide / data.count * i + viewSeta)
        }
    }
}

render()