const start = { x: 0,    y: 0  };
const cp1 =   { x: 230,   y: 30  };
const cp2 =   { x: 150,   y: 80  };
const end =   { x: 250,   y: 100 };

let SPREAD = 0.0009;
let MINSPREAD = 0.000001;
let VLEN = 100;
let MINSPREADLEN = 20
let SCALE = 50;
let MINSCALE = 1;
let MINTOTALCURVES = 2000;
let MAX_TRIES = 1000;
let MINADDITION = 5;
let POW= -1.99
let height;
let width;

function diffVector(p1, p2) {
    return {x: p1.x-p2.x, y:p1.y-p2.y};
}

function addVector(p1, p2) {
    return {x: p1.x+p2.x, y:p1.y+p2.y};
}

function vectorLength(x1,y1,x2,y2) {
    const d1 = x1-x2;
    const d2 = y1-y2;
    return Math.sqrt(d1*d1+d2*d2);
}

function drawSpline(ctx, start, cp1, cp2, end) {
    // Cubic Bézier curve
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.stroke();
}

function randomVector(scale) {
    return {
        x: Math.random()*scale,
        y: Math.random()*scale
    }
}

function reorient(curve) {
    if (vectorLength(curve[0].x, curve[0].y, curve[3].x, curve[3].y) < vectorLength(curve[0].x, curve[1].y, curve[1].x, curve[1].y)) {
        curve[3].x += curve[3].x-curve[0].x;
        curve[3].y += curve[3].y-curve[0].y;

        // const tmpvec = curve[2];
        // curve[2].x = curve[3].x;
        // curve[2].y = curve[3].y;
        // curve[3].x = tmpvec.x;
        // curve[3].y = tmpvec.y;
        console.log('reoriented')
        // curve[2] = curve[3];
        // curve[3] = tmpvec;
    }
}

function spreadVectors(start, maxRads, minRads=0.1) {
    const angle = Math.atan2(start.y, start.x);
    const newAngle1 = (angle + (Math.random()*maxRads+minRads))%(2*Math.PI);
    const newAngle2 = (angle - (Math.random()*maxRads+minRads))%(2*Math.PI);
    return [
        {x: Math.cos(newAngle1), y:Math.sin(newAngle1)},
        {x: Math.cos(newAngle2), y:Math.sin(newAngle2)}
    ]
}

function randomSpreadVectors(start, maxRads, scale, minRads=0.1) {
    const vectors = spreadVectors(start, maxRads*SCALE*SCALE/(scale*scale), minRads);
    vectors[0].x *= Math.random()*scale + MINSPREADLEN;
    vectors[0].y *= Math.random()*scale + MINSPREADLEN;
    vectors[1].x *= Math.random()*scale + MINSPREADLEN;
    vectors[1].y *= Math.random()*scale + MINSPREADLEN;
    // console.log(vectors);
    return vectors;
}

const curves = [];
function proximity(curve) {
    let prox = 0;
    curves.forEach((c) => {
        const diffStart = diffVector(c[0], curve[0]);
        const diffEnd = diffVector(c[3], curve[3]);
        if (diffStart.x+diffStart.y == 0) return;
        prox += 1/Math.sqrt(diffStart.x*diffStart.x + diffStart.y*diffStart.y);
        prox += 1/Math.sqrt(diffEnd.x*diffEnd.x + diffEnd.y*diffEnd.y);
    });
    return prox;
}

function intersects(curve) {
    for (let i = 0; i < curves.length; i++) {
        const c = curves[i];
        const diffStart = diffVector(c[0], curve[0]);
        const diffEnd = diffVector(c[3], curve[0]);
        if (diffStart.x+diffStart.y === 0 || diffEnd.x+diffEnd.y === 0) continue;
        if (
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[0].x, curve[0].y, curve[2].x, curve[2].y) ||
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[1].x, curve[1].y, curve[3].x, curve[3].y) ||
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[0].x, curve[0].y, curve[1].x, curve[1].y) ||
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y) ||
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[1].x, curve[1].y, curve[2].x, curve[2].y) ||
            bezierIntersect.cubicBezierLine(c[0].x, c[0].y, c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y, curve[0].x, curve[0].y, curve[3].x, curve[3].y)) {
            return true;
        }
    }
    return false;
}
// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function linearIntersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };


const drawQueue = [];
function drawFractal(ctx, startPoint, startVector, secondVector=false, scale=SCALE) {
    // debugger;
    if (
        startPoint.x > width || startPoint.y > height ||
        startPoint.x < 0 || startPoint.y < 0 ||
        startPoint.x+startVector.x > width || startPoint.y+startVector.y > height) return;
    const cp1 = addVector(startPoint, startVector);
    let d1;
    if (secondVector) {
        d1 = secondVector;
    }else {
        d1 = randomVector(Math.random()*VLEN);
    }
    const segmentScale = Math.random()*scale+MINSCALE;
    const cp2 = addVector(cp1, d1);
    const spreadVectors = randomSpreadVectors(d1, SPREAD/Math.pow(segmentScale,POW), segmentScale, MINSPREAD/segmentScale, scale)
    const d2 = spreadVectors[Math.round(Math.random())];
    const endPoint = addVector(cp2, d2);
    const curve = [startPoint, cp1, cp2, endPoint];
    // const prox = proximity(curve);
    // console.log(prox);
    reorient(curve);
    if (linearIntersects(curve[0].x, curve[0].y, curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y)) {
        return;
    }
    if (intersects(curve)) {
        return;
    }
    curves.push(curve);
    // console.log(prox);
    drawQueue.push(drawSpline.bind(this, ctx, startPoint, cp1, cp2, endPoint));
    // console.log(ctx, startPoint, cp1, cp2, endPoint);
    // setTimeout(() => {
    const vectors = randomSpreadVectors(startVector, SPREAD/segmentScale, Math.random()*segmentScale, MINSPREAD/segmentScale)
    const vectors2 = randomSpreadVectors(startVector, SPREAD/segmentScale, Math.random()*segmentScale, MINSPREAD/segmentScale)
    const newStartVector = diffVector(endPoint, cp2);
    if(Math.round(Math.random()*segmentScale/SCALE)) {
        drawFractal(ctx, endPoint, newStartVector, vectors[0]);
    }
    drawFractal(ctx, endPoint, newStartVector, vectors2[0]);
    if(Math.round(Math.random()*segmentScale/SCALE)) {
        drawFractal(ctx, endPoint, newStartVector, vectors[1]);
    }
    drawFractal(ctx, endPoint, newStartVector, vectors2[1]);
    // }, 100)
    // drawFractal(ctx, endPoint, diffVector(endPoint, cp2), -1);
}
function drawTry(ctx, attempt=0) {
    if (attempt > MAX_TRIES) return;
    // SCALE *= 1 - curves.length / MINTOTALCURVES;
    // SPREAD /= 1 - curves.length / MINTOTALCURVES;
    drawQueue.forEach((f)=>f());
    drawQueue.length = 0;
    const oldLen = curves.length;
    if (oldLen < MINTOTALCURVES) {
        const newStart = curves[Math.floor(Math.random()*oldLen)];
        drawFractal(ctx, newStart[0], diffVector(newStart[0], newStart[1]), diffVector(newStart[1], newStart[2]));
        const newCurves = curves.length - oldLen;
        if (newCurves < MINADDITION) {
            curves.length = oldLen;
            drawQueue.length = 0;
        }
        console.log("again");
        setTimeout(drawTry.bind(this, ctx, attempt+1), 10);
    } else {
        return;
    }
}

(() => {
    const c = document.getElementById("mycanvas");
    height = c.height;
    width = c.width;
    const ctx = c.getContext("2d");
    ctx.lineWidth = 1.5;
    drawFractal(ctx, start, diffVector(cp1, start));
    drawTry(ctx);
    // for (let i = 0; i < MAX_TRIES; i++) {
    //     drawQueue.forEach((f)=>f());
    //     drawQueue.length = 0;
    //     const oldLen = curves.length;
    //     if (oldLen < MINTOTALCURVES) {
    //         const newStart = curves[Math.floor(Math.random()*oldLen)];
    //         drawFractal(ctx, newStart[0], diffVector(newStart[0], newStart[1]), diffVector(newStart[1], newStart[2]));
    //         const newCurves = curves.length - oldLen;
    //         if (newCurves < (MINTOTALCURVES/oldLen)) {
    //             curves.length = oldLen;
    //             drawQueue.length = 0;
    //         }
    //         console.log("retry");
    //     } else {
    //         break;
    //     }
    // }
    // setInterval(() => {
    //     drawQueue.shift()();
    // }, 30);
})();