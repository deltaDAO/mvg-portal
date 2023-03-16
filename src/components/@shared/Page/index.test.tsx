import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import { render, screen } from '@testing-library/react'
import React from 'react'
import Page from './index'

describe('@shared/Page', () => {
  it('renders without crashing', () => {
    render(
      <SearchBarStatusProvider>
        <Page uri="/hello" title="Hello Title" description="Hello Description">
          Hello Children
        </Page>
      </SearchBarStatusProvider>
    )
    expect(screen.getByText('Hello Children')).toBeInTheDocument()
    expect(screen.getByText('Hello Title')).toBeInTheDocument()
    expect(screen.getByText('Hello Description')).toBeInTheDocument()
  })

  it('renders without title', () => {
    render(
      <SearchBarStatusProvider>
        <Page uri="/hello">Hello Children</Page>
      </SearchBarStatusProvider>
    )
  })
})
