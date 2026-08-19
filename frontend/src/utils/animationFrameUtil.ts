export const waitForNextFrame = async <T = void>(
    frames = 1,
    callback?: () => T | Promise<T>
): Promise<T | void> => {
    const nextFrameCount = Math.max(1, Math.floor(frames));

    await new Promise<void>((resolve) => {
        const scheduleFrame = (remainingFrames: number) => {
            window.requestAnimationFrame(() => {
                if (remainingFrames <= 1) {
                    resolve();
                    return;
                }

                scheduleFrame(remainingFrames - 1);
            });
        };

        scheduleFrame(nextFrameCount);
    });

    if (callback) {
        return await callback();
    }
};

export const runWithHeavyExecutionGuard = async <T = void>(
    callback: () => T | Promise<T>,
    frames = 2
): Promise<void> => {
    await waitForNextFrame(frames);

    window.setTimeout(() => {
        void callback();
    }, 0);
};
