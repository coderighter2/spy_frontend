import { Token } from '@pancakeswap/sdk';
import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo, useState } from 'react'

interface HarvestModalProps {
    earnings?: BigNumber
    pid?: number
    nextHarvestUntil?: number
}