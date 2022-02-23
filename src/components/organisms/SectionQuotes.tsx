import React, { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './SectionQuotes.module.css'
import { graphql, useStaticQuery } from 'gatsby'
import { nanoid } from 'nanoid'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

const query = graphql`
  query QuotesQuery {
    file(relativePath: { eq: "quotes.json" }) {
      childContentJson {
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
  const [fullQuotes, setFullQuotes] = useState<Quote[]>([])
  const [currentQuote, setCurrentQuote] = useState(0)

  const currentQuoteRef = useRef(currentQuote)
  currentQuoteRef.current = currentQuote

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
    if (fullQuotes.length === 0) return
    const nextQuoteTimer = setTimeout(() => {
      setCurrentQuote((currentQuoteRef.current + 1) % fullQuotes.length)
    }, 5000)

    return () => {
      clearTimeout(nextQuoteTimer)
    }
  }, [fullQuotes, currentQuote])

  return (
    <div className={styles.container}>
      <div className={styles.images}>
        {fullQuotes.map((e) => (
          <img
            key={e.id}
            className={cx({
              profilePicture: true,
              active: e.id === fullQuotes?.[currentQuote].id
            })}
            alt="profile-picture"
            src={e.profilePicture}
          />
        ))}
      </div>
      <div className={styles.quote}>
        <h2 className={styles.text}>{fullQuotes[currentQuote]?.quote}</h2>
        <p className={styles.name}>{fullQuotes[currentQuote]?.name}</p>
      </div>
    </div>
  )
}
