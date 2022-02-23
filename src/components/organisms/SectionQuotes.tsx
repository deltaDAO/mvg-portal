import React, { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './SectionQuotes.module.css'
import { graphql, useStaticQuery } from 'gatsby'
import { nanoid } from 'nanoid'
import classNames from 'classnames/bind'
import Container from '../atoms/Container'

const cx = classNames.bind(styles)

const query = graphql`
  query QuotesQuery {
    file(relativePath: { eq: "quotes.json" }) {
      childContentJson {
        title
        quotes {
          name
          profilePicture
          quote
        }
      }
    }
    profilePictures: allFile(
      filter: {
        extension: { regex: "/(jpg)|(jpeg)|(png)/" }
        relativeDirectory: { eq: "quotes" }
      }
    ) {
      edges {
        node {
          name
          childImageSharp {
            original {
              src
            }
          }
        }
      }
    }
  }
`
interface QuotesContentData {
  file: {
    childContentJson: {
      title: string
      quotes: {
        name: string
        profilePicture: string
        quote: string
      }[]
    }
  }
  profilePictures: {
    edges: {
      node: {
        name: string
        childImageSharp: { original: { src: string } }
      }
    }[]
  }
}

interface Quote {
  id: string
  name: string
  profilePicture: string
  quote: string
}

export default function SectionQuotes(): ReactElement {
  const data: QuotesContentData = useStaticQuery(query)
  const { title } = data.file.childContentJson
  const [fullQuotes, setFullQuotes] = useState<Quote[]>([])
  const [currentQuote, setCurrentQuote] = useState(0)

  const currentQuoteRef = useRef(currentQuote)
  currentQuoteRef.current = currentQuote

  const nextQuoteTimer = useRef(null)

  useEffect(() => {
    if (!data) return
    setFullQuotes(
      data.file.childContentJson.quotes.map((quote) => {
        const picture = data.profilePictures.edges.find(
          (e) => e.node.name === quote.profilePicture
        )
        return {
          ...quote,
          profilePicture: picture.node.childImageSharp.original.src,
          id: nanoid()
        }
      })
    )
  }, [data])

  useEffect(() => {
    if (nextQuoteTimer) clearTimeout(nextQuoteTimer.current)
    nextQuoteTimer.current = setTimeout(() => {
      setCurrentQuote((currentQuoteRef.current + 1) % fullQuotes.length)
    }, 5000)

    return () => {
      clearTimeout(nextQuoteTimer.current)
    }
  }, [fullQuotes, currentQuote])

  return (
    <Container>
      <div className={styles.container}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <div className={styles.images}>
          {fullQuotes.map((e, i) => (
            <img
              key={e.id}
              className={cx({
                profilePicture: true,
                active: e.id === fullQuotes?.[currentQuote].id
              })}
              alt="profile-picture"
              src={e.profilePicture}
              onClick={() => setCurrentQuote(i)}
            />
          ))}
        </div>
        <div className={styles.quote}>
          <h3
            className={styles.text}
          >{`"${fullQuotes[currentQuote]?.quote}"`}</h3>
          <p className={styles.name}>{fullQuotes[currentQuote]?.name}</p>
        </div>
      </div>
    </Container>
  )
}
