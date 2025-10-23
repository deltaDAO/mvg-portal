import Button from '@components/@shared/atoms/Button'
import Tabs from '@components/@shared/atoms/Tabs'
import Refresh from '@images/refresh.svg'
import { useConsentsFeed } from './ConsentsFeed.hooks'
import styles from './ConsentsFeed.module.css'

export default function ConsentsFeed() {
  const {
    address,
    tabs,
    tabIndex,
    setTabIndex,
    setIsOnlyPending,
    isOnlyPending,
    refreshConsents
  } = useConsentsFeed()

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <Button
          style="text"
          size="small"
          title="Refresh consents"
          className={styles.refresh}
          onClick={refreshConsents}
        >
          <Refresh />
          Refresh
        </Button>

        <div className={styles.onlyPending}>
          <input
            type="checkbox"
            checked={isOnlyPending}
            onChange={() => setIsOnlyPending(!isOnlyPending)}
            id="onlyPending"
          />
          <label className={styles.toggle} htmlFor="onlyPending">
            Only show pending
          </label>
        </div>
      </div>

      <Tabs
        items={tabs}
        selectedIndex={tabIndex}
        onIndexSelected={setTabIndex}
      />
    </div>
  )
}
