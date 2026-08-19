import { HandleInputFnOutput } from "#root/interfaces/chatbot";

export const stringsToHandleInputFnOutput = (...strings: string[]): HandleInputFnOutput => {
    return {
        messages: strings.map((s: string) => {
            return {
                text: s,
            };
        }),
    };
};
