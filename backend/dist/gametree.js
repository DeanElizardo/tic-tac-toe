const MOVES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const WINNING_MOVES = [
    ["0", "1", "2"],
    ["3", "4", "5"],
    ["6", "7", "8"],
    ["0", "3", "6"],
    ["1", "4", "7"],
    ["2", "5", "8"],
    ["0", "4", "8"],
    ["2", "4", "6"],
];
export class GameNode {
    constructor(id, parentID, childrenIDs, winningConfig = false) {
        this.id = id;
        this.parentID = parentID;
        this.childrenIDs = childrenIDs;
        this.winningConfig = winningConfig;
        this.score = 0;
        this.minimaxValue = 0;
    }
}
export class Tree {
    constructor() {
        this.nodes = new Map;
        this.leaves = new Array();
        this.root = Tree.createRoot(this);
    }
    static createRoot(sappling) {
        let root = new GameNode("", null, MOVES.slice(), false);
        sappling.insertNode(root);
        return root;
    }
    insertNode(newNode) {
        this.nodes.set(newNode.id, newNode);
    }
    expandFullTree() {
        this.expand(this.root);
    }
    expand(node) {
        if (this.identifyLeaf(node)) {
            node.minimaxValue = node.score;
            this.leaves.push(node);
        }
        else {
            let self = this;
            node.childrenIDs
                .forEach(function (childID) {
                let child = self.createNode(childID, node.id);
                self.insertNode(child);
                self.expand(child);
            });
        }
    }
    identifyLeaf(node) {
        return node.id.length === 9 || node.winningConfig === true;
    }
    createNode(newID, parentID) {
        let nodeChildren = this.computeChildIDs(newID);
        let [winningConfig, score] = this.identifyWinningConfig(newID);
        let node = new GameNode(newID, parentID, nodeChildren, winningConfig);
        node.score = score;
        node.minimaxValue = node.id.length % 2 ? Infinity : -Infinity;
        if (node.winningConfig) {
            node.childrenIDs = [];
        }
        return node;
    }
    computeChildIDs(nodeID) {
        let nextMoves = this.identifyRemainingMoves(nodeID);
        return nextMoves.map((move) => nodeID + move);
    }
    identifyWinningConfig(nodeID) {
        let winStatus;
        let xMoves = this.getMoves(nodeID, "X");
        let oMoves = this.getMoves(nodeID, "O");
        let score = 0;
        if (this.checkForWin(xMoves)) {
            score = 10 - nodeID.length;
            winStatus = true;
        }
        else if (this.checkForWin(oMoves)) {
            score = -10 + nodeID.length;
            winStatus = true;
        }
        else {
            score = 0;
            winStatus = false;
        }
        return [winStatus, score];
    }
    identifyRemainingMoves(nodeID) {
        return MOVES.filter((move) => !nodeID.includes(move));
    }
    getMoves(nodeID, marker) {
        let modulo = marker === "X" ? 0 : 1;
        return nodeID.split("").filter((_, idx) => idx % 2 === modulo).join("");
    }
    checkForWin(moves) {
        return WINNING_MOVES.some((group) => {
            return group.every((move) => moves.includes(move));
        });
    }
    setMinimaxValues(node) {
        var _a, _b;
        let parent = (_b = this.nodes.get((_a = node.parentID) !== null && _a !== void 0 ? _a : "")) !== null && _b !== void 0 ? _b : this.root;
        if (parent.id !== "") {
            let minimaxValue = node.minimaxValue;
            if (parent.id.length % 2 === 0) {
                // X to play
                if (minimaxValue > parent.minimaxValue) {
                    parent.minimaxValue = minimaxValue;
                }
            }
            else {
                // O to play
                if (minimaxValue < parent.minimaxValue) {
                    parent.minimaxValue = minimaxValue;
                }
            }
        }
    }
}
