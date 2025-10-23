import { customStyles } from '@components/@shared/atoms/Table/_styles'
import { TableStyles } from 'react-data-table-component'

export const consentsTableStyles: TableStyles = {
  ...customStyles,
  cells: {
    style: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  rows: {
    style: {
      border: 'none !important'
    },
    highlightOnHoverStyle: {
      backgroundColor: 'var(--brand-grey-dimmed)',
      transition: 'background-color 0.2s ease'
    }
  }
}
