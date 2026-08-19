import { DialogConfirmStateEnum } from "#root/interfaces/dialog";
import { DiagramFileOption } from "#root/interfaces/tab";

export const options_dict = {
    cacti: {
        key: DiagramFileOption.cacti,
        title: "Import from CACTi",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromCacti,
    },
    description: {
        key: DiagramFileOption.description,
        title: "Generate from Natural Language Description",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromLLMWithDescription,
    },
    iac: {
        key: DiagramFileOption.iac,
        title: "Import from IaC",
        dialogKey: DialogConfirmStateEnum.confirmGenerateDiagramFromIAC,
    },
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
};
