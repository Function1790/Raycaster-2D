const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

const mapData = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,1,0,0,0,0,0,0,1,0,0],
    [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
]

const eventPos = []

const data = {
    size: 800 / mapData.length,
    count: 1000,
    color : 'rgba(250,250,100, 0.01)'
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
            return eventPos[i]
        }
        if ((conY1 || conY2) && isInX[0] && isInX[1]) {
            return eventPos[i]
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
        return isOver(this.x) || isOver(this.y)
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
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)

        while (!current.isOver()) {
            current.add(dir)
            var hpos = getHitWallPos(before, current, dir)
            if (hpos) {
                break
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
    new Light(300, 200),
    new Light(300, 600),
]
function render() {
    ctx.strokeStyle = 'white'
    for (var i in mapData) {
        for (var j in mapData[i]) {
            if (mapData[i][j] == 1) {
                eventPos.push([Number(j), Number(i)])
                ctx.strokeRect(j * data.size, i * data.size, data.size, data.size)
            }
        }
    }
    for (var j in light) {
        ctx.lineWidth = 7
        for (var i = 0; i < data.count; i++) {
            light[j].draw(Math.PI * 2 / data.count * i)
        }
    }
}

render()