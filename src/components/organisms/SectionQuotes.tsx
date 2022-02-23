import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import styles from './SectionQuotes.module.css'

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
interface HomeContentData {
  file: {
    childIndexJson: {
      content: {
        teaser: {
          title: string
          text: string
        }
        paragraphs: {
          title: string
          body: string
          cta: string
          ctaTo: string
          interactivity: string
        }[]
      }
    }
  }
  ctdBenefits: {
    childImageSharp: { original: { src: string } }
  }
}

export default function SectionQuotes(): ReactElement {
  const data: HomeContentData = useStaticQuery(query)
  console.log(data)
  return <div className={styles.container}>test</div>
}
