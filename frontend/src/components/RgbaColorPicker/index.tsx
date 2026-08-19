import React from "react";
import { RgbaStringColorPicker } from "react-colorful";

import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

// Convert hex color code to RGB/RGBA
const convertToRGBA = (colorCode: string): string => {
    return colorCode.startsWith("rgba") ? colorCode : colord(colorCode).toRgbString();
};

interface RgbaColorPickerProps {
    color: string;
    setColor: (newColor: string, key: string) => void;
    attribute_key: string;
    disabled: boolean;
}

const RgbaColorPickerComponent: React.FC<RgbaColorPickerProps> = ({
    color,
    setColor,
    attribute_key,
    disabled,
}) => {
    const [isOpen, toggle] = React.useState(false);

    const handleClick = React.useCallback(() => {
        if (!disabled) toggle((prevIsOpen) => !prevIsOpen);
    }, [disabled]);

    return (
        <>
            <div
                style={{
                    backgroundColor: color,
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    border: "3px solid #fff",
                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                }}
                onClick={handleClick}
            />
            {isOpen && (
                <div className="p-1">
                    <RgbaStringColorPicker
                        color={convertToRGBA(color)}
                        onChange={(newColor: string) => setColor(newColor, attribute_key)}
                        style={{ width: "auto" }}
                    />
                </div>
            )}
        </>
    );
};

export default React.memo(RgbaColorPickerComponent);
