import {
    default_edge_cacti_attributes,
    default_edge_data_advanced_attributes,
    default_edge_data_attributes,
    default_edge_main_attributes,
    default_edge_marker_attributes,
    default_edge_style_attributes,
} from "#root/constants/diagramAttributes";
import { DiagramEdge, ProjectDiagram } from "#root/interfaces/diagram";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";

export interface EdgeAttributeFactoryProps {
    draftEdge: DiagramEdge;
    projectDiagram: ProjectDiagram;
    allEdges: DiagramEdge[];
}

export class EdgeAttributeFactory {
    // These fields are kept for consistency and potential future use
    private readonly draftEdge: DiagramEdge;
    private readonly projectDiagram: ProjectDiagram;
    private readonly allEdges: DiagramEdge[];

    public readonly main: BaseFieldAttribute[];
    public readonly main_advanced: BaseFieldAttribute[];
    public readonly data: BaseFieldAttribute[];
    public readonly data_advanced: BaseFieldAttribute[];
    public readonly style: BaseFieldAttribute[];
    public readonly style_advanced: BaseFieldAttribute[];
    public readonly marker: BaseFieldAttribute[];
    public readonly cacti: BaseFieldAttribute[];

    constructor({ draftEdge, projectDiagram, allEdges }: EdgeAttributeFactoryProps) {
        this.draftEdge = draftEdge;
        this.projectDiagram = projectDiagram;
        this.allEdges = allEdges;
        // Mark fields as intentionally used to silence warnings
        void this.draftEdge;
        void this.projectDiagram;
        void this.allEdges;

        this.main = this.getMainAttributes();
        this.main_advanced = this.getMainAdvancedAttributes();
        this.data = this.getDataAttributes();
        this.data_advanced = this.getDataAdvancedAttributes();
        this.style = this.getStyleAttributes();
        this.style_advanced = this.getStyleAdvancedAttributes();
        this.marker = this.getMarkerAttributes();
        this.cacti = this.getCactiAttributes();
    }

    /**
     * Gets edge Cacti attributes.
     * Returns a copy of the default Cacti attributes for edges.
     *
     * @returns An array of BaseFieldAttribute objects representing Cacti-specific edge attributes
     */
    private getCactiAttributes(): BaseFieldAttribute[] {
        return [...default_edge_cacti_attributes];
    }

    /**
     * Gets edge data attributes.
     * Returns a copy of the default data attributes for edges.
     * These attributes represent the basic data properties of an edge.
     *
     * @returns An array of BaseFieldAttribute objects representing basic edge data attributes
     */
    private getDataAttributes(): BaseFieldAttribute[] {
        return [...default_edge_data_attributes];
    }

    /**
     * Gets edge advanced data attributes.
     * Returns a copy of the default advanced data attributes for edges.
     * These attributes represent additional data properties beyond the basic set.
     *
     * @returns An array of BaseFieldAttribute objects representing advanced edge data attributes
     */
    private getDataAdvancedAttributes(): BaseFieldAttribute[] {
        return [...default_edge_data_advanced_attributes];
    }

    /**
     * Gets edge main attributes.
     * Returns a copy of the default main attributes for edges.
     * These attributes represent the core properties of an edge (e.g., id, type, source, target).
     *
     * @returns An array of BaseFieldAttribute objects representing main edge attributes
     */
    private getMainAttributes(): BaseFieldAttribute[] {
        return [...default_edge_main_attributes];
    }

    /**
     * Gets edge advanced main attributes.
     * Returns an empty array as there are currently no advanced main attributes defined for edges.
     * This method is provided for consistency and potential future use.
     *
     * @returns An empty array of BaseFieldAttribute objects
     */
    private getMainAdvancedAttributes(): BaseFieldAttribute[] {
        return [];
    }

    /**
     * Gets edge marker attributes.
     * Returns a copy of the default marker attributes for edges.
     * These attributes define the visual markers (arrows, etc.) at the start and end of edges.
     *
     * @returns An array of BaseFieldAttribute objects representing edge marker attributes
     */
    private getMarkerAttributes(): BaseFieldAttribute[] {
        return [...default_edge_marker_attributes];
    }

    /**
     * Gets edge style attributes.
     * Returns a copy of the default style attributes for edges.
     * These attributes control the visual appearance of edges (e.g., stroke color, stroke width).
     *
     * @returns An array of BaseFieldAttribute objects representing edge style attributes
     */
    private getStyleAttributes(): BaseFieldAttribute[] {
        return [...default_edge_style_attributes];
    }

    /**
     * Gets edge advanced style attributes.
     * Returns an empty array as there are currently no advanced style attributes defined for edges.
     * This method is provided for consistency and potential future use.
     *
     * @returns An empty array of BaseFieldAttribute objects
     */
    private getStyleAdvancedAttributes(): BaseFieldAttribute[] {
        return [];
    }

    /**
     * Returns all attributes as a dictionary/object
     */
    public toDictionary(): {
        main: BaseFieldAttribute[];
        main_advanced: BaseFieldAttribute[];
        data: BaseFieldAttribute[];
        data_advanced: BaseFieldAttribute[];
        style: BaseFieldAttribute[];
        style_advanced: BaseFieldAttribute[];
        marker: BaseFieldAttribute[];
        cacti: BaseFieldAttribute[];
    } {
        return {
            main: this.main,
            main_advanced: this.main_advanced,
            data: this.data,
            data_advanced: this.data_advanced,
            style: this.style,
            style_advanced: this.style_advanced,
            marker: this.marker,
            cacti: this.cacti,
        };
    }
}
