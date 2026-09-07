import _ from "lodash";
import { DateTime } from "luxon";

import { SelectableValue } from "#root/interfaces";

const DEFAULT_AUTOSAVE_INTERVAL = 2000;

export const runFunctionAtInterval = (
    runThis: () => Promise<boolean>, //
    runThisOnError: (err?: unknown) => Promise<void>, //
    counter: React.RefObject<number>,
    interval?: number,
    maxCounter = 2
) => {
    setTimeout(async function request() {
        const runNextCondition = await runThis();
        if (!runNextCondition) {
            runThisOnError();
            counter.current += 1;
        }
        if (counter.current > maxCounter) return;
        setTimeout(request, interval ?? DEFAULT_AUTOSAVE_INTERVAL);
    }, interval ?? DEFAULT_AUTOSAVE_INTERVAL);
};

export const getStringArrayFromSelected = (data_list: SelectableValue[]) => {
    return data_list?.map(
        (v, v_index) => `${v?.label}${v_index === data_list?.length - 1 ? "" : ","} `
    );
};

export const convertCamelToTitleCase = (str: string) => {
    const words = str.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
    const titleCaseWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
    return titleCaseWords.join(" ");
};

export const reformatPathString = (path: string): string => {
    const regex = /^path_(\d+)$/;
    const match = path.match(regex);
    if (match) {
        const numericPart = match[1];
        if (numericPart) {
            const number = parseInt(numericPart, 10);
            return `Path ${number}`;
        }
    }
    return path;
};

export const convertTitleToCamelCase = (str: string) => {
    const words = str.split(" ");
    const camelCaseString =
        (words[0]?.toLowerCase() || "") +
        words
            .slice(1)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
    return camelCaseString;
};

export const toTitleCase = (input: string): string => {
    if (input === undefined) {
        return "";
    }

    const words = input.split(" ");
    const capitalizedWords = words.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalizedWords.join(" ");
};

export const convertTimezoneToSGT = (time: string): string => {
    if (!time) return "";

    // Convert the UTC time string to Asia/Singapore timezone
    const singaporeTime = DateTime.fromISO(time, { zone: "UTC" }) // Parse as UTC
        .setZone("Asia/Singapore"); // Convert to Singapore timezone

    // Format the output
    const formattedTime = singaporeTime.toFormat("yyyy-MM-dd HH:mm:ss");
    return `${formattedTime} (SGT)`;
};

// Function to get the difference between two objects

interface DiffObjectSingle {
    [key: string]: DiffObjectSingle;
}

export const getObjectDifference = (
    obj1: DiffObjectSingle, //
    obj2: DiffObjectSingle
) => {
    return _.reduce(
        obj1,
        (result: Record<string, unknown>, value: DiffObjectSingle, key: string) => {
            if (!_.isEqual(value, obj2[key])) {
                result[key] =
                    _.isObject(value) && _.isObject(obj2[key])
                        ? getObjectDifference(value, obj2[key])
                        : { oldValue: value, newValue: obj2[key] };
            }
            return result;
        },
        {}
    );
};

export const getFileExtension = (filename: string): string => {
    const dotIndex = (filename || "").lastIndexOf(".");
    return dotIndex >= 0 ? filename.slice(dotIndex) : "";
};

export const getFileBaseName = (filename: string): string => {
    const dotIndex = (filename || "").lastIndexOf(".");
    return dotIndex >= 0 ? filename.slice(0, dotIndex) : filename || "";
};
