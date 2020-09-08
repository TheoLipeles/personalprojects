"use strict";


let s = new sigma('container');
const NODENUM = 1700;
const HEIGHT = 250;
const WIDTH = 350;
const EDGE_LEN_REDUCTION = 21;
const MAX_OUTDEGREE = 8;
let nodes = [];
let data = { nodes: [], links: [] };
let threshold = 1;
let decayRate = 0.5;
const colorspread = -20;
const colorstart = 0;
const edgeDecayRate = Math.sqrt(NODENUM/EDGE_LEN_REDUCTION);
const oneWay = false;
const noTri = false;

const minNodeSize = 0.45;
const maxNodeSize = 6;
const minEdgeSize = 0.2;
const maxEdgeSize = 1.5;
const nodeMult = ((minNodeSize + maxNodeSize)/6);
const edgeMult = ((minEdgeSize + maxEdgeSize)/40);
// nodes.push(new VisNode(threshold, decayRate));
// s.graph.addNode({
//     // Main attributes:
//     id: 0,
//     label: 0,
//     // Display attributes:
//     x: -250,
//     y: -250,
//     size: 1,
//     color: '#000'
// });
// threshold = Math.random() * 30+1;
// nodes.push(new VisNode(threshold, decayRate, 1));
// s.graph.addNode({
//     // Main attributes:
//     id: 1,
//     label: 1,
//     // Display attributes:
//     x: 250,
//     y: 250,
//     size: 1,
//     color: '#000'
// });

for (let i = 0; i < NODENUM; i++) {
  const gamma = clamp(regularize(i % 16 + 1, 0, 16)+0.5, 0.5, 1);
    const angle = Math.random()*Math.PI*2;
    let ifire = Math.pow(regularize(Math.random()*NODENUM, 0, NODENUM)*Math.random(), 0.5*Math.random());
    // let threshold = Math.random() * 20+1;
    nodes.push(new VisNode(threshold, Math.random() * decayRate, 1, edgeDecayRate));
    s.graph.addNode({
        // Main attributes:
        id: i,
        label: i,
        // Display attributes:
        x: Math.cos(angle) * clamp(ifire * WIDTH,Math.pow(WIDTH, 0.5),WIDTH),
        y: Math.sin(angle) * clamp(ifire * HEIGHT,Math.pow(HEIGHT, 0.5),HEIGHT)-50,
        size: minNodeSize,
        color: convert(spread(regularize(i, 0, NODENUM), 380-colorspread, 781+colorspread))
    });
}
s.refresh()
const graphNodes = s.graph.nodes();
const graphEdges = s.graph.edges();
const r = diff({x:WIDTH,y:WIDTH}, {x:-HEIGHT, y:-HEIGHT});
// console.log(r);
// console.log(graphNodes);
let edges = 0;
for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
        let distModifier = diff(graphNodes[i], graphNodes[j])*EDGE_LEN_REDUCTION/r;
        // distModifier += Math.pow(clamp(i, 0.1, distModifier), 0.5);
        if (i !== j && Math.random() > distModifier) {
            if (oneWay && nodes[j].children.includes(nodes[i])) continue;
            if (noTri && nodes[j].children.reduce((T, n) => T + n.children.includes(nodes[i]), 0)) continue;
            let edgeWeight = Math.random() * 20 * distModifier;
            nodes[i].addConnection(nodes[j], edgeWeight);
            s.graph.addEdge({
                id: i + '-' + j,
                source: i,
                target: j,
                size: minEdgeSize,
                color: "#45b5ac"
            });
            edges++;
            if (nodes[i].children.length > MAX_OUTDEGREE) break;
        }
    }
}
console.log("edges", edges)

s.settings({
    minNodeSize: minNodeSize,
    maxNodeSize: maxNodeSize,
    defaultNodeSize: 0,
    minEdgeSize: minEdgeSize,
    maxEdgeSize: maxEdgeSize,
    defaultEdgeSize: 0,
    autoRescale: false,
    drawLabels: false,
    drawEdgeLabels: false,
    doubleClickEnabled: false,
    zoomingRatio: 1.1,
    enableHovering: false,
    eventsEnabled: false
})
s.refresh();
// function update() {
//     const graphNodes = s.graph.nodes().slice();
//     const graphEdges = s.graph.edges().slice();
//     for (let i = 0; i < graphNodes.length; i++) {
//         s.graph.addNode({
//             // Main attributes:
//             id: i,
//             label: i,
//             // Display attributes:
//             x: Math.random(),
//             y: Math.random(),
//             size: 1,
//             color: '#f00'
//         });
//     }
// }
// nodes[0].input(50);
// nodes[0].input(50);
// nodes[1].input(50);

let x = 0;
// const decayInterval = Math.round(Math.pow(nodes.length, 1/4));
// console.log(decayInterval, "decayInterval");
// s.bind('clickNode',(e) => {
//     nodes[e.data.node.id].input(10);
// });

s.myUpdate = () => {
    const graphNodes = s.graph.nodes()
    const graphEdges = s.graph.edges()
    let j = 0;
    for (let i = 0; i < graphNodes.length; i++) {
        graphNodes[i].size = clamp((nodes[i].charge + 1)*nodeMult, minNodeSize, maxNodeSize);
        for (let k = 0; k < nodes[i].edges.length; k++) {
            graphEdges[j].size = clamp(nodes[i].edges[k] *edgeMult, minEdgeSize, maxEdgeSize);
            j++;
        }
    }
}
s.myUpdate();
const order = [];
for (let i = 0; i < NODENUM; i++) {
  order.push(i);
}
const stochDistribute = () => {
  const start = new Date();
  const graphNodes = s.graph.nodes()
  const graphEdges = s.graph.edges()
  // order.sort(() => Math.random() - 0.5);
  let j = 0;
  for (let i = 0; i < order.length; i++) {
      // const j = Math.floor(Math.random() * NODENUM);
      nodes[i].tick();
      graphNodes[i].size = clamp((nodes[i].charge + 1)*nodeMult, minNodeSize, maxNodeSize);
      for (let k = 0; k < nodes[i].edges.length; k++) {
          graphEdges[j].size = clamp(nodes[i].edges[k] *edgeMult, minEdgeSize, maxEdgeSize);
          j++;
      }
  }
  if (new Date() - start > 100) console.log(new Date() - start);
}
setInterval(() => {
  stochDistribute();
}, 100);
requestAnimationFrame(s.refresh.bind(s));
// setInterval(() => {
//     const graphNodes = s.graph.nodes()
//     const graphEdges = s.graph.edges()
//     let j = 0;
//     for (let i = 0; i < graphNodes.length; i++) {
//         graphNodes[i].size = clamp((nodes[i].charge + 1) * 0.5, minNodeSize, maxNodeSize);
//         for (let k = 0; k < nodes[i].edges.length; k++) {
//             graphEdges[j].size = clamp(nodes[i].edges[k] * 0.05, minEdgeSize, maxEdgeSize);
//             j++;
//         }
//     }

//     if (x++ % decayInterval == 0) nodes.forEach(node => node.decay());
//     nodes.forEach(node => node.distributeCharge());
//     s.refresh();
//     // const sin = (Math.sin(x/slowness)+1)*2;
//     // const cos = (Math.cos(x++/slowness)+1)*2;
//     // // console.log(sin);
//     // // console.log(cos);
//     // nodes[0].input(sin);
//     // nodes[1].input(cos);
//     // nodes.forEach(node => node.decay());
// }, 100);

// setInterval(() => {
//     nodes.forEach(node => node.distributeCharge())
// }, 100)


// setInterval(() => {

// }, 100)
// s.graph.nodes()[0].size = 10.3;
// s.refresh();

function diff(a, b) {
    return Math.sqrt(Math.pow(a.x-b.x, 2)+Math.pow(a.y-b.y, 2))
}


function toColor(num) {
    const val = 200 * num / NODENUM;
    console.log(val)
    const h= Math.floor((200 - val) * 240 / 200);
    const s = Math.abs(val - 100)/100;
    const v = 5;
    return hsv2rgb(h, s, v);
}

function hsv2rgb(h, s, v) {
    // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
    var rgb, i, data = [];
    if (s === 0) {
      rgb = [v,v,v];
    } else {
      h = h / 60;
      i = Math.floor(h);
      data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
      switch(i) {
        case 0:
          rgb = [v, data[2], data[0]];
          break;
        case 1:
          rgb = [data[1], v, data[0]];
          break;
        case 2:
          rgb = [data[0], v, data[2]];
          break;
        case 3:
          rgb = [data[0], data[1], v];
          break;
        case 4:
          rgb = [data[2], data[0], v];
          break;
        default:
          rgb = [v, data[0], data[1]];
          break;
      }
    }
    return '#' + rgb.map(function(x){
      return ("0" + Math.round(x*255).toString(16)).slice(-2);
    }).join('');
  };

function decimalToHex(d) {
  d = Math.round(d);
  var hex = d.toString(16);
  while (hex.length < 2) {
      hex = "0" + hex;
  }

  return hex;
}

function regularize(n, min, max) {
  return (clamp(n, min, max) - min) / (max-min);
}

function spread(n, min, max) {
  return n * (max - min)+min;
}

function convert(w, gamma=0.8) {
  let red, green, blue, factor;

  if (w >= 380 && w < 440) {
    red = -(w - 440) / (440 - 380);
    green = 0.0;
    blue = 1.0;
  } else if (w >= 440 && w < 490) {
    red = 0.0;
    green = (w - 440) / (490 - 440);
    blue = 1.0;
  } else if (w >= 490 && w < 510) {
    red = 0.0;
    green = 1.0;
    blue = -(w - 510) / (510 - 490);
  } else if (w >= 510 && w < 580) {
    red = (w - 510) / (580 - 510);
    green = 1.0;
    blue = 0.0;
  } else if (w >= 580 && w < 645) {
    red = 1.0;
    green = -(w - 645) / (645 - 580);
    blue = 0.0;
  } else if (w >= 645 && w < 781) {
    red = 1.0;
    green = 0.0;
    blue = 0.0;
  } else {
    red = 0.0;
    green = 0.0;
    blue = 0.0;
  }


  // Let the intensity fall off near the vision limits

  if (w >= 380 && w < 420)
    factor = 0.4 + 0.6 * (w - 380) / (420 - 380);
  else if (w >= 420 && w < 701)
    factor = 1.0;
  else if (w >= 701 && w < 781)
    factor = 0.4 + 0.6 * (780 - w) / (780 - 700);
  else
    factor = 0.0;

  // const gamma = 0.80;
  const R = (red > 0 ? 255 * Math.pow(red * factor, gamma) : 0);
  const G = (green > 0 ? 255 * Math.pow(green * factor, gamma) : 0);
  const B = (blue > 0 ? 255 * Math.pow(blue * factor, gamma) : 0);

  const hex = "#" + decimalToHex(R) + decimalToHex(G) + decimalToHex(B);
  return hex;
}
