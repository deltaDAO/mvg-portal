import { useUserConsentsAmount } from '@hooks/useUserConsents'
import NumberUnit from './NumberUnit'

function StatsConsents() {
  const {
    data: {
      incoming_pending_consents: incomingPendingConsents,
      outgoing_pending_consents: outgoingPendingConsents
    }
  } = useUserConsentsAmount()

  return (
    <>
      <NumberUnit
        label="Incoming Pending Consents"
        value={incomingPendingConsents ?? 0}
      />
      <NumberUnit
        label="Outgoing Pending Consents"
        value={outgoingPendingConsents ?? 0}
      />
    </>
  )
}

export default StatsConsents
