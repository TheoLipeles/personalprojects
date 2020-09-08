import { VisNode } from "./visnode";

const NODENUM = 5
const nodes:VisNode[] = [];
const data = {nodes:[], links:[]}

for (let i = 0; i < NODENUM; i++) {
    const threshold = Math.random() * 50;
    const decayRate = Math.random() * 0.1;
    nodes.push(new VisNode(threshold, decayRate))
    data.nodes.push({id:i.toString()})
}

for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
        if (i !== j && Math.random() > 0.5) {
            const edgeWeight = Math.random() * 20;
            nodes[i].addConnection(nodes[j], edgeWeight);
            data.links.push({source:i.toString(), target:j.toString(), value:edgeWeight})
        }
    }
}

nodes[0].input(50);
nodes.forEach(node => console.log(node.charge));
console.log("----------------------");
while(nodes[0].charge > 1) {
    nodes.forEach(node => node.distributeCharge())
    nodes.forEach(node => console.log(node.charge));
    console.log("----------------------");
}
