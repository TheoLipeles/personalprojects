function drawCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

function randOff() {
    return Math.random()*2 - 1;
}
function normalize(vector) {
    const hypotenuse = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
    vector.x = vector.x/hypotenuse;
    vector.y = vector.y/hypotenuse;
}


(() => {
    const RADIUS = 2, COLUMNS = 10000, MAXCURVE = 1, OFFSET = 6;
    const c = document.getElementById("mycanvas");
    const ctx = c.getContext("2d");
    let x = -500, y = -500;
    ctx.fillStyle='rgb(170,159,145)';
    ctx.strokeStyle='rgb(170,159,145)';
    // create first line
    let prevLine = [];
    for (let i = 0; i < COLUMNS; i++) {
        const delta = randOff();
        let dx = 1;
        let dy = delta*MAXCURVE;
        const hypotenuse = Math.sqrt(dx*dx + dy*dy);
        dx = dx/hypotenuse;
        dy = dy/hypotenuse;
        x += OFFSET * dx;
        y += OFFSET * dy;
        prevLine.push({x,y});
    }


    // while (prevLine[0].y < c.height + RADIUS) {
    //     for (let i = 0; i < prevLine.length; i++) {
    //         const dot = prevLine[i];
    //         drawCircle(ctx, dot.x, dot.y, RADIUS);
    //     }
    //     prevLine[0].y += OFFSET + OFFSET * randOff() * MAXCURVE;
    //     for (let i = 1; i < prevLine.length - 1; i++) {
    //         if (prevLine[i].x > c.width + RADIUS) break;
    //         const delta = {
    //             x: prevLine[i+1].x - prevLine[i].x,
    //             y: prevLine[i+1].y - prevLine[i].y + randOff()
    //         }
    //         normalize(delta);
    //         prevLine[i].x = prevLine[i-1].x + delta.x * OFFSET;
    //         prevLine[i].y = Math.max(prevLine[i-1].y + delta.y * OFFSET*MAXCURVE, prevLine[i].y + RADIUS*2);
    //     }
    //     console.log(prevLine);

    // }
    console.log(prevLine.length)
    function step(timestamp) {
        window.requestAnimationFrame(step);
        let maxY = prevLine[0].y;
        if (prevLine[0].y < c.height + RADIUS) {
            for (let i = 0; i < prevLine.length; i++) {
                const dot = prevLine[i];
                drawCircle(ctx, dot.x, dot.y, RADIUS);
            }
            prevLine[0].y += OFFSET + OFFSET * randOff() * MAXCURVE;
            for (let i = 1; i < prevLine.length - 1; i++) {
                if (prevLine[i].x > c.width*2) break;
                const delta = {
                    x: prevLine[i+1].x - prevLine[i].x,
                    y: prevLine[i+1].y - prevLine[i].y + randOff()
                }
                normalize(delta);
                prevLine[i].x = prevLine[i-1].x + delta.x * OFFSET;
                prevLine[i].y = Math.max(prevLine[i-1].y + delta.y * OFFSET*MAXCURVE, prevLine[i].y + RADIUS*2);
                maxY = Math.max(maxY, prevLine[i].y-500);
            }
        }
        window.scrollTo(0, maxY);
    }
    window.requestAnimationFrame(step);
})();