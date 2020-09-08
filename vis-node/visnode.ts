const MAXCHARGE = 100;
const EDGE_DECAY_RATE = 0.1;
export class VisNode {
    private threshold:number;
    private decayRate:number;
    public charge:number;
    children:VisNode[] = [];
    edges:number[] = [];

    constructor(threshold:number, decayRate:number, startingCharge=0) {
        this.threshold = threshold;
        this.decayRate = decayRate;
        this.charge = startingCharge;
    }

    tick() {
        this.distributeCharge();
    }

    distributeCharge() {
        if (this.charge < this.threshold) {
            this.charge *= 1 - this.decayRate;
            return this.decayEdges()
        }

        let remainingEdges:number[] = [];
        for (let i = 0; i < this.edges.length; i++) {
            remainingEdges.push(i);
        }
        const dischargedEdges:number[] = [];
        let itts = 0;
        while (remainingEdges.length > 0 && itts++ < 10) {
            const newRemainingEdges = [];
            for (const i of remainingEdges) {
                const child = this.children[i];
                const edge = this.edges[i];
                const chargeShare = this.charge/remainingEdges.length;
                if (chargeShare > edge) {
                    child.charge += edge;
                    this.charge -= edge;
                    dischargedEdges.push(i);
                } else {
                    newRemainingEdges.push(i);
                }
            }
            remainingEdges = newRemainingEdges;
        }
        const edgesToDistribute:number[] = [];
        for (let i = 0; i < this.edges.length; i++) {
            if (dischargedEdges.includes(i)) continue;
            edgesToDistribute.push(i);
        }
        const chargePortion = this.charge/edgesToDistribute.length
        for (let i = 0; i < edgesToDistribute.length; i++) {
            const edgeIndex = edgesToDistribute[i];
            console.log(edgeIndex);
            const target = this.children[edgeIndex];
            target.charge += chargePortion;
            this.charge -= chargePortion;
        }

        return this.growEdges();
    }
    decayEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i] *= 1 - EDGE_DECAY_RATE;
        }
    }

    growEdges() {
        for (let i = 0; i < this.edges.length; i++) {
            this.edges[i] *= 1 + EDGE_DECAY_RATE;
        }
    }

    input(charge:number) {
        this.charge = min(this.charge + charge, MAXCHARGE);
    }

    addConnection(target:VisNode, edgeThrougput:number) {
        this.children.push(target);
        this.edges.push(edgeThrougput);
    }
}

function min(a, b) {
    if (a < b) return a;
    return b
}
