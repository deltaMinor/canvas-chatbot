import { FrameworkMapping } from "#root/constants/frameworks";
import { DisplayFrameworksSettings } from "#root/interfaces/project";
import {
    FrameworkCategoryEnum,
    FrameworkCategoryType,
    FrameworksEnum,
    ThreatFrameworks,
} from "#root/interfaces/register";

export const getFrameworkCategoryKeys = () =>
    Object.keys(FrameworkMapping) as FrameworkCategoryType[];

export const isFrameworkCategory = (framework: string): framework is FrameworkCategoryType =>
    getFrameworkCategoryKeys().includes(framework as FrameworkCategoryType);

export const checkIfFrameworkHidden = (
    framework: string,
    displayFrameworks?: DisplayFrameworksSettings
): boolean => {
    return isFrameworkCategory(framework) && !displayFrameworks?.[framework];
};

export const displayFrameworksTypedValue = (
    typedValue: ThreatFrameworks
): Record<string, any[]> => {
    const typedKeys = Object.keys(typedValue) as string[];

    const result = typedKeys.reduce(
        (acc, curKey) => {
            const _acc = acc[curKey] ?? (acc[curKey] = []);

            const mapping = FrameworkMapping[curKey as FrameworkCategoryEnum];
            if (!mapping) return acc;

            const { label, color, link } = mapping;

            typedValue[curKey as keyof ThreatFrameworks]?.forEach((v) => {
                _acc.push({
                    key: v ?? "",
                    label: label[v as keyof FrameworksEnum] || "",
                    color: color[v as keyof FrameworksEnum] || "",
                    link: link?.[v as keyof FrameworksEnum] || "",
                });
            });

            return acc;
        },
        {} as Record<
            string,
            {
                key: string;
                label: string;
                color: string;
                link: string;
            }[]
        >
    );
    return result;
};
