import React, { useState } from 'react'
import { Text, TextProps } from '@pancakeswap/uikit'
import useInterval from 'hooks/useInterval'
import styled from 'styled-components'


const StyledText = styled(Text)`
`

interface HarvestTimerProps {
    target: number
    onChangeExpiration: (expired: boolean) => void
}

const HarvestTimer: React.FC<HarvestTimerProps & TextProps> = ({ target, onChangeExpiration, ...props }) => {
    
    const [countdown, setCountdown] = useState('')
    const [expired, setExpired] = useState(false)

    useInterval(() => {

        let _expired = expired;

        if (target > 0) {
            const now = Math.floor(new Date().getTime() / 1000);
            const diffTime = target - now;
            if (diffTime > 0) {
                const duration = diffTime;
                const hour = Math.floor(duration / 3600);
                const min = Math.floor((duration % 3600) / 60);
                const sec = duration % 60;

                const hourS = hour < 10 ? `0${hour}`:`${hour}`;
                const minS = min < 10 ? `0${min}`:`${min}`;
                const secS = sec < 10 ? `0${sec}`:`${sec}`;
                setCountdown(`${hourS}:${minS}:${secS}`);
                _expired = false;
            } else {
                setCountdown('00:00:00');
                _expired = true;
            }

            if (_expired !== expired) {
                setExpired(_expired)
                onChangeExpiration(_expired)
            }
        } else {
            setCountdown('--:--:--');
        }
    }, 1000)

    return (
        <StyledText {...props}>
            {countdown}
        </StyledText>
    )
}

export default HarvestTimer
