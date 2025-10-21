import { ExcludingAccordionTrigger } from '@components/@shared/ExcludingAccordion/_components/ExcludingAccordionTrigger'
import { ExcludingAccordionContent } from '@components/@shared/ExcludingAccordion/_components/ExcludingAccordionContent'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react'

interface ExcludingAccordionContextProps {
  openIndex: number
  triggerCallback: (index: number) => void
}

const ExcludingAccordionContext = createContext(
  {} as ExcludingAccordionContextProps
)

interface ExcludingAccordionProviderProps {
  startingOpenIndex?: number
  children: ReactNode
  className?: string
}

function ExcludingAccordionProvider({
  startingOpenIndex,
  children,
  className
}: Readonly<ExcludingAccordionProviderProps>) {
  const [openIndex, setOpenIndex] = useState(startingOpenIndex ?? 0)

  const triggerCallback = useCallback(
    (index: number) => {
      setOpenIndex((prev) => {
        if (prev === index) return -1
        return index
      })
    },
    [setOpenIndex]
  )

  return (
    <ExcludingAccordionContext.Provider
      value={{
        openIndex,
        triggerCallback
      }}
    >
      <div className={className}>{children}</div>
    </ExcludingAccordionContext.Provider>
  )
}

ExcludingAccordionProvider.Trigger = ExcludingAccordionTrigger
ExcludingAccordionProvider.Content = ExcludingAccordionContent

export const useExcludingAccordion = () => useContext(ExcludingAccordionContext)
export default ExcludingAccordionProvider
