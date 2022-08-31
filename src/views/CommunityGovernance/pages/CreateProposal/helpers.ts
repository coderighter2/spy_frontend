import BigNumber from 'bignumber.js'
import { Decimal } from 'decimal.js'
import { isNaN, isNumber } from 'lodash'
import { BLOCKS_PER_YEAR } from 'config'
import { ContextApi } from 'contexts/Localization/types'
import { format, parseISO, isValid } from 'date-fns'
import { useMemo } from 'react'
import { useFarmFromPid } from 'state/farms/hooks'
import { BIG_ONE, BIG_ZERO } from 'utils/bigNumber'
import { FormState } from './types'

export const combineDateAndTime = (date: Date, time: Date) => {
  if (!isValid(date) || !isValid(time)) {
    return null
  }

  const dateStr = format(date, 'yyyy-MM-dd')
  const timeStr = format(time, 'HH:mm:ss')

  return parseISO(`${dateStr}T${timeStr}`).getTime() / 1e3
}

export const getFormErrors = (formData: FormState, t: ContextApi['t']) => {
  const { name, body, durationInHours, executionDurationInHours } = formData
  const errors: { [key: string]: string[] } = {}

  if (!name) {
    errors.name = [t('%field% is required', { field: 'Title' })]
  }

  if (!body) {
    errors.body = [t('%field% is required', { field: 'Body' })]
  }

  if (!durationInHours) {
    errors.durationInHours = [t('%field% is required', { field: 'Duration' })]
  }

  if (parseInt(durationInHours) < 1) {
    errors.durationInHours = [t('%field% is invalid', { field: 'Duration' })]
  }

  if (!executionDurationInHours) {
    errors.executionDurationInHours = [t('%field% is required', { field: 'Execution expiration' })]
  }

  if (parseInt(executionDurationInHours) < 1) {
    errors.executionDurationInHours = [t('%field% is invalid', { field: 'Execution expiration' })]
  }

  return errors
}

