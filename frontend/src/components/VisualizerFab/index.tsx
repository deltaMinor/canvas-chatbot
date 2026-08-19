import AllEdges from "./AllEdges";
import AllNodes from "./AllNodes";
import AllPaths from "./AllPaths";
import AttackPath from "./AttackPath";

const VisualizerFab: {
    AllEdges: typeof AllEdges;
    AllNodes: typeof AllNodes;
    AllPaths: typeof AllPaths;
    AttackPath: typeof AttackPath;
} = {
    AllEdges,
    AllNodes,
    AllPaths,
    AttackPath,
};

export default VisualizerFab;
