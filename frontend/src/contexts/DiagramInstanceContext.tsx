import React from "react";

export const DiagramInstanceContext = React.createContext<string>("default");

export const useDiagramInstanceId = () => React.useContext(DiagramInstanceContext);
