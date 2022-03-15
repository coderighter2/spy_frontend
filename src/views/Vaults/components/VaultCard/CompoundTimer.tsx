import React, { useState } from 'react'
import { Text, TextProps } from '@pancakeswap/uikit'
import useInterval from 'hooks/useInterval'


interface CompoundTimerProps {
    target: number
}

const CompoundTimer: React.FC<CompoundTimerProps & TextProps> = ({ target, ...props }) => {
    
    const [countdown, setCountdown] = useState('')

    useInterval(() => {

        if (target > 0) {
            const now = Math.floor(new Date().getTime() / 1000);
            const diffTime = target - now;
            if (diffTime > 0) {
                const duration = diffTime;
                const hour = Math.floor((duration % 86400) / 3600);
                const min = Math.floor((duration % 3600) / 60);
                const sec = duration % 60;

                const hourS = hour < 10 ? `0${hour}`:`${hour}`;
                const minS = min < 10 ? `0${min}`:`${min}`;
                const secS = sec < 10 ? `0${sec}`:`${sec}`;
                setCountdown(`${hourS}:${minS}:${secS}`);
            } else {
                setCountdown('00:00:00');
            }
        } else {
            setCountdown('00:00:00');
        }
    }, 1000)

    return (
        <Text {...props}>
            {countdown}
        </Text>
    )
}

export default CompoundTimer
