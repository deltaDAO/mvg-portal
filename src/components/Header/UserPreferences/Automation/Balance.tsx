import React, { ReactElement } from 'react'
import {
  AutomationAllowance,
  AutomationBalance
} from '../../../../@context/Automation/AutomationProvider'

export default function Balance({
  balance,
  allowance
}: {
  balance: AutomationBalance
  allowance: AutomationAllowance
}): ReactElement {
  return (
    <div>
      {' ('}
      <span>
        {Object.keys(balance).map(
          (currency) => `${currency}: ${balance[currency]} - `
        )}
      </span>
      <span>
        {Object.keys(allowance).map(
          (currency) => `${currency}: ${allowance[currency]} - `
        )}
      </span>
      {')'}
    </div>
  )
}
