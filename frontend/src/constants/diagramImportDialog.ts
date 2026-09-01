import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { DiagramFileOption } from "#root/interfaces/tab";

export const options_dict = {
    image: {
        key: DiagramFileOption.image,
        title: "Import from Image (PNG / JPG / WEBP / GIF / BMP / PDF)",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromLLM,
    },
    json: {
        key: DiagramFileOption.json,
        title: "Import from JSON",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromJson,
    },
    template: {
        key: DiagramFileOption.template,
        title: "Import from Template",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromTemplate,
    },
    xml: {
        key: DiagramFileOption.xml,
        title: "Import from XML (Draw.io / mxGraph)",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromXML,
    },
    pdf: {
        key: DiagramFileOption.pdf,
        title: "Upload PDF",
        dialogKey: undefined,
    },
    generatedJson: {
        key: DiagramFileOption.generatedJson,
        title: "View generated JSONs",
        dialogKey: undefined,
    },
};
