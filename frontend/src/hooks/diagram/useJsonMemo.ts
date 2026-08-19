import React from "react";

export const useJsonMemo = <T>(value: T) => React.useMemo(() => JSON.stringify(value), [value]);

export default useJsonMemo;
