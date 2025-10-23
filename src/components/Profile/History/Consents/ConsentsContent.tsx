import QueryBoundary from '@components/@shared/QueryBoundary'
import ConsentsFeed from './Feed/ConsentsFeed'
import Modal from '@components/@shared/Modal'

export default function ConsentsContent() {
  return (
    <QueryBoundary text="Loading consents">
      <Modal>
        <ConsentsFeed />
      </Modal>
    </QueryBoundary>
  )
}
