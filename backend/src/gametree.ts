const MOVES: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const WINNING_MOVES: string[][] = [
  ["0", "1", "2"],
  ["3", "4", "5"],
  ["6", "7", "8"],
  ["0", "3", "6"],
  ["1", "4", "7"],
  ["2", "5", "8"],
  ["0", "4", "8"],
  ["2", "4", "6"],
]

export class GameNode {
  id: string;
  parentID: string | null;
  childrenIDs: string[];
  winningConfig: boolean;
  score: number;
  minimaxValue: number;

  constructor(id: string, parentID: string | null, childrenIDs: string[], winningConfig: boolean = false) {
    this.id = id;
    this.parentID = parentID;
    this.childrenIDs = childrenIDs;
    this.winningConfig = winningConfig;
    this.score = 0;
    this.minimaxValue = 0;
  }
}

export class Tree {
  nodes: Map<string, GameNode>;
  leaves: GameNode[];
  root: GameNode;

  constructor() {
    this.nodes = new Map<string, GameNode>;
    this.leaves = new Array();
    this.root = Tree.createRoot(this);
  }

  static createRoot(sappling: Tree): GameNode {
    let root: GameNode = new GameNode("", null, MOVES.slice(), false);

    sappling.insertNode(root);

    return root;
  }

  insertNode(newNode: GameNode): void {
    this.nodes.set(newNode.id, newNode);
  }

  expandFullTree(): void {
    this.expand(this.root);
  }

  expand(node: GameNode): void {
    if (this.identifyLeaf(node)) {
      node.minimaxValue = node.score;
      this.leaves.push(node);
    } else {
      let self: Tree = this;
      node.childrenIDs
        .forEach(function(childID: string) {
          let child: GameNode = self.createNode(childID, node.id);
          self.insertNode(child);
          self.expand(child);
        });
    }
  }

  identifyLeaf(node: GameNode): boolean {
    return node.id.length === 9 || node.winningConfig === true;
  }

  createNode(newID: string, parentID: string): GameNode {
    let nodeChildren: string[] = this.computeChildIDs(newID);
    let [winningConfig, score]: [boolean, number] = this.identifyWinningConfig(newID);
    let node: GameNode = new GameNode(newID, parentID, nodeChildren, winningConfig);

    node.score = score;
    node.minimaxValue = node.id.length % 2 ? Infinity : -Infinity;

    if (node.winningConfig) {
      node.childrenIDs = [];
    }

    return node;
  }

  computeChildIDs(nodeID: string): string[] {
    let nextMoves: string[] = this.identifyRemainingMoves(nodeID);
    return nextMoves.map((move) => nodeID + move);
  }

  identifyWinningConfig(nodeID: string): [boolean, number] {
    let winStatus: boolean;
    let xMoves: string = this.getMoves(nodeID, "X");
    let oMoves: string = this.getMoves(nodeID, "O");
    let score: number = 0;

    if (this.checkForWin(xMoves)) {
      score = 10 - nodeID.length;
      winStatus = true;
    } else if (this.checkForWin(oMoves)) {
      score = -10 + nodeID.length;
      winStatus = true;
    } else {
      score = 0;
      winStatus = false;
    }

    return [winStatus, score];
  }

  identifyRemainingMoves(nodeID: string): string[] {
    return MOVES.filter((move) => !nodeID.includes(move));
  }

  getMoves(nodeID: string, marker: string): string {
    let modulo: number = marker === "X" ? 0 : 1;

    return nodeID.split("").filter((_, idx) => idx % 2 === modulo).join("");
  }

  checkForWin(moves: string): boolean {
    return WINNING_MOVES.some((group) => {
      return group.every((move) => moves.includes(move));
    });
  }

  setMinimaxValues(node: GameNode): void {
    let parent: GameNode = this.nodes.get(node.parentID ?? "") ?? this.root;

    if (parent.id !== "") {
      let minimaxValue: number = node.minimaxValue;
      if (parent.id.length % 2 === 0) {
        // X to play
        if (minimaxValue > parent.minimaxValue) {
          parent.minimaxValue = minimaxValue;
        }
      } else {
        // O to play
        if (minimaxValue < parent.minimaxValue) {
          parent.minimaxValue = minimaxValue;
        }
      }
    }
  }
}
