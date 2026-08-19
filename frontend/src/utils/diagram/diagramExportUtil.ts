export const downloadImage = (dataUrl: string, imageName = "project_diagram.png") => {
    const a = document.createElement("a");
    a.setAttribute("download", imageName);
    a.setAttribute("href", dataUrl);
    a.click();
};
