import fs from "fs";
import { Tree, GameNode } from "./gametree.js";

function logEvent(message: string): void {
  console.log(`[ ${new Date().toDateString()} ]: ${message}`);
}

function logError(message: string, error: Error): void {
  logEvent(message);
  console.log(error);
}

logEvent("CREATING GAME TREE...");
let gameTree: Tree = new Tree();
gameTree.expandFullTree();
logEvent("GAME TREE CREATED.");

logEvent("PREPARING DATA FOR MINIMAX SCORING...");
/**
 * Sort the nodes by id length, longer ids first: longer id's mean longer games.
 * After sorting, remove the root node (it won't get a minimax value), then
 *  assign minimax values to each node.
 */
let layers: string[] = Array.from(gameTree.nodes.values())
  .sort((a, b) => b.id.length - a.id.length)
  .map((node) => node.id);
layers.pop();
logEvent("DATA READY.");

logEvent("MINIMAX SCORING IN PROGRESS...");
layers.forEach((id) => {
  let node = gameTree.nodes.get(id);
  if (node !== undefined) {
    gameTree.setMinimaxValues(node);
  }
});
logEvent("MINIMAX SCORING COMPLETE.");

logEvent("OPTIMIZING MOVES...");
/**
 * For each node (thisNode), iterate over each child node and find the highest
 *  and lowest scores.
 * Once the highest/lowest score is determined, preserve the node ids of
 *  children that have the same score.  Highest scores are for x moves, lowest
 *  scores are for o moves.
 */
let moves: any = {};
Array.from(gameTree.nodes.values()).forEach((node: GameNode) => {
  let currConfig: string = node.id;
  let thisNode = gameTree.nodes.get(currConfig);
  if (thisNode !== undefined) {
    var maxScore: number = thisNode.childrenIDs.reduce(
      (highest: number, currNode: string) => {
        let node = gameTree.nodes.get(currNode);
        if (node !== undefined) {
          let score: number = node.minimaxValue;
          if (score > highest) {
            return score;
          } else {
            return highest;
          }
        }
        return highest;
      },
      -Infinity
    );

    var minScore: number = thisNode.childrenIDs.reduce(
      (lowest: number, currNode: string) => {
        let node = gameTree.nodes.get(currNode);
        if (node !== undefined) {
          let score: number = node.minimaxValue;
          if (score < lowest) {
            return score;
          } else {
            return lowest;
          }
        }
        return lowest;
      },
      Infinity
    );

    let optimalXmoves: string = thisNode.childrenIDs
      .filter((nodeID) => {
        let node = gameTree.nodes.get(nodeID);
        if (node !== undefined && node.minimaxValue === maxScore) {
          return nodeID;
        }
        return "";
      })
      .join(":");

    let optimalOmoves: string = thisNode.childrenIDs
      .filter((nodeID) => {
        let node = gameTree.nodes.get(nodeID);
        if (node !== undefined && node.minimaxValue === minScore) {
          return nodeID;
        }
        return "";
      })
      .join(":");

    moves[currConfig] = { X: optimalXmoves, O: optimalOmoves };
  }
});
logEvent("OPTIMIZED.");

logEvent("WRITING MOVES TO FILE...");
let json: string = JSON.stringify(moves);

try {
  fs.createWriteStream("./dist/moves.json");
} catch (err) {
  logError("FAILED TO CREATE './moves.json'", err as Error);
}

fs.writeFile("./moves.json", json, (err) => {
  if (err) {
    logError("FAILED TO WRITE TO './moves.json'", err as Error);
  } else {
    logEvent("ALL TASKS COMPLETE. SUCCESS!");
  }
});
