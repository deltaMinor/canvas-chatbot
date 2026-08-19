import React, { Suspense } from "react";

import MuiSkeleton from "#root/components/MuiSkeleton";
import { svg_image_src_dict } from "#root/media/icons";

interface NodeIconProps {
    name: string;
    alt?: string;
    style?: React.CSSProperties;
}

const NodeIconComponent = ({
    name, //
    ...props
}: NodeIconProps) => {
    const [imageSrc, setImageSrc] = React.useState<string>("");

    React.useEffect(() => {
        const loadImage = async () => {
            const _imageSrc =
                svg_image_src_dict?.[name as keyof typeof svg_image_src_dict] ||
                svg_image_src_dict.placeholder;
            if (typeof _imageSrc !== "string") return;
            setImageSrc(_imageSrc);
        };

        loadImage();
    }, [name]);

    return (
        <Suspense fallback={<MuiSkeleton />}>
            {!!imageSrc ? (
                <img
                    src={imageSrc}
                    alt={props.alt || name}
                    style={{
                        maxWidth: "unset",
                        maxHeight: "unset",
                        lineHeight: "unset",
                        verticalAlign: "unset",
                        ...props.style,
                    }}
                />
            ) : (
                <MuiSkeleton />
            )}
        </Suspense>
    );
};

export default React.memo(NodeIconComponent);
