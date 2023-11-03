import testRender from '../../../../../.jest/testRender'
import Badge from '@shared/atoms/Badge'

describe('Badge', () => {
  testRender(<Badge label="Badge text" />)
})
