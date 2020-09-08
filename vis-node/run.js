"use strict";
exports.__esModule = true;
var visnode_1 = require("./visnode");
var NODENUM = 5;
var nodes = [];
var data = { nodes: [], links: [] };
for (var i = 0; i < NODENUM; i++) {
    var threshold = Math.random() * 50;
    var decayRate = Math.random() * 0.1;
    nodes.push(new visnode_1.VisNode(threshold, decayRate));
    data.nodes.push({ id: i.toString() });
}
for (var i = 0; i < nodes.length; i++) {
    for (var j = 0; j < nodes.length; j++) {
        if (i !== j && Math.random() > 0.5) {
            var edgeWeight = Math.random() * 20;
            nodes[i].addConnection(nodes[j], edgeWeight);
            data.links.push({ source: i.toString(), target: j.toString(), value: edgeWeight });
        }
    }
}
nodes[0].input(50);
nodes.forEach(function (node) { return console.log(node.charge); });
console.log("----------------------");
while (nodes[0].charge > 1) {
    nodes.forEach(function (node) { return node.distributeCharge(); });
    nodes.forEach(function (node) { return console.log(node.charge); });
    console.log("----------------------");
}
