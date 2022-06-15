import useParsedQueryString from "hooks/useParsedQueryString";
import { useEffect, useState } from "react";

export function useDefaultsFromURLSearch() {

    const parsedQs = useParsedQueryString()
    const [result, setResult] = useState<{ amount: string } | undefined>()

    useEffect(() => {
        const amount = parsedQs.amount;
        // eslint-disable-next-line no-restricted-globals
        if (typeof amount === 'string' && !isNaN(parseFloat(amount))) {
            setResult({amount})
        }
    }, [parsedQs])

    return result;
}