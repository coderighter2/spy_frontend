import React from 'react'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { Input, InputProps } from '@pancakeswap/uikit'

import 'react-datepicker/dist/react-datepicker.css'
import { CSSProperties } from 'styled-components'
import { StyledInput } from './StyledControls'

export interface DateTimePickerProps extends ReactDatePickerProps {
  inputProps?: InputProps
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ inputProps = {}, ...props }) => {
  return (
    <ReactDatePicker showTimeSelect customInput={<StyledInput {...inputProps} />} portalId="reactDatePicker" dateFormat="PPP ppp" {...props} />
  )
}

export default DateTimePicker
