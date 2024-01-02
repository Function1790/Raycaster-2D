const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const mapData = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 9, 7, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const eventPos = []
const checkDir = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
]

const data = {
    size: 800 / mapData.length,
    count: 12,
    color: 'rgba(255,0,0,0.5)',
    lineWidth: 5,
    reflectCount: 0
}

function isOver(value) {
    if (0 >= value || value >= canvas.width) {
        return true
    }
    return false
}

function isInner(pos, x, y) {
    var p1 = [pos[0] * data.size, pos[1] * data.size]
    var p2 = [p1[0] + data.size, p1[1] + data.size]
    return x > p1[0] && y < p2[0]
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
        var conX1 = a[0] <= p1[0] && b[0] >= p1[0]
        var conX2 = a[0] <= p2[0] && b[0] >= p2[0]
        var conY1 = a[1] <= p1[1] && b[1] >= p1[1]
        var conY2 = a[1] <= p2[1] && b[1] >= p2[1]
        if ((conX1 || conX2) && isInY[0] && isInY[1]) {
            var l = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
            var sin = (pos2.y - pos1.y) / l
            var cos = (pos2.x - pos1.x) / l
            return {
                pos: eventPos[i],
                axis: 0,
                inner: pos2.x > p1[0] && pos2.x < p2[0],
                sin: sin,
                cos: cos,
            }
        }
        if ((conY1 || conY2) && isInX[0] && isInX[1]) {
            var l = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
            var sin = (pos2.y - pos1.y) / l
            var cos = (pos2.x - pos1.x) / l
            return {
                pos: eventPos[i],
                axis: 1,
                inner: pos2.y > p1[1] && pos2.y < p2[1],
                sin: cos,
                cos: sin,
            }
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

function sym(v) {
    if (v < 0) {
        return -1
    }
    return 1
}

class Light {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.color = data.color
        this.tick = 0
    }
    drawMe() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
    processRefraction(obj) {
        var obj_n = mapData[obj.pos[1]][obj.pos[0]] + 1
        if (!obj.inner) {
            obj_n = 1
        }

        if (obj.axis == 0) {
            this.dir.x *= obj_n / this.n
        } else {
            this.dir.y *= obj_n / this.n
        }

        this.n = obj_n
    }
    draw(seta) {
        ctx.strokeStyle = this.color
        this.dir = new Vector(Math.cos(seta), Math.sin(seta))
        var current = new Vector(this.x, this.y)
        var before = new Vector(this.x, this.y)
        this.n = 1
        this.last_sin = this.dir.y

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        while (true) {
            var over = current.isOver()
            if (over[0] || over[1]) {
                break
            }
            current.add(this.dir)
            var hpos = getHitWallPos(before, current, this.dir)
            if (hpos) {
                if (this.n != mapData[hpos.pos[1]][hpos.pos[0]] + 1 || !hpos.inner) {
                    this.processRefraction(hpos)
                }
            }
            ctx.lineTo(current.x, current.y)
            before.x = current.x
            before.y = current.y
        }
        ctx.stroke()
        ctx.closePath()
    }
}

const light = [
    new Light(500, 400),
    //new Light(500, 100),
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
        if (mapData[i][j] !== 0) {
            eventPos.push([Number(j), Number(i)])
            ctx.strokeRect(j * data.size, i * data.size, data.size, data.size)
        }
    }
}

function render() {
    ctx.clearRect(0, 0, 800, 800)
    ctx.strokeStyle = 'white'
    for(var i in eventPos){
        ctx.strokeRect(eventPos[i][0] * data.size, eventPos[i][1]  * data.size, data.size, data.size)
    }
    ctx.lineWidth = data.lineWidth
    //renderLight()
    for (var j in light) {
        for (var i = 0; i < data.count; i++) {
            light[j].draw(Math.PI * 2 / data.count * i)
        }
    }
    requestAnimationFrame(render)
}

canvas.addEventListener('mousemove', (ev) => {
    light[0].x = ev.clientX
    light[0].y = ev.clientY
})

render()