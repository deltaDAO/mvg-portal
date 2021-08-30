import React, { ReactElement, useState } from 'react'
import styles from './index.module.css'
import { graphql, useStaticQuery } from 'gatsby'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import slugify from 'slugify'
import Permission from '../../organisms/Permission'
import { SectionQueryResult } from '../Home'
import TutorialChapter, {
  TutorialChapterProps
} from '../../molecules/TutorialChapter'
import { Spin as Hamburger } from 'hamburger-react'
import { DDO } from '@oceanprotocol/lib'
import ConnectWallet from './Interactives/ConnectWallet'
import PublishMetadata from './Interactives/PublishMetadata'
import EditMetadata from './Interactives/EditMetadata'
import ConsumeData from './Interactives/ConsumeData'
import ViewHistory from './Interactives/ViewHistory'
import TableOfContents from './TableOfContents'
import { queryDemonstrators } from '../../organisms/HomeIntro'

interface TutorialChapterNode {
  node: {
    frontmatter: {
      title: string
      chapter: number
      videoUrl?: string
    }
    rawMarkdownBody: string
    id: string
  }
}

const query = graphql`
  query {
    content: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/.+\/pages\/tutorial\/.+\\.md/"}}, sort: { fields: frontmatter___chapter}) {
      edges {
        node {
          frontmatter {
            title
            chapter
            videoUrl
          }
          rawMarkdownBody
          id
        }
      }
    }
  }
`

export default function PageTutorial({
  setTutorialDdo
}: {
  setTutorialDdo: (ddo: DDO) => void
}): ReactElement {
  const [showPriceTutorial, setShowPriceTutorial] = useState(false)
  const [showComputeTutorial, setShowComputeTutorial] = useState(false)
  const interactivity = [
    {
      chapter: 2,
      component: <ConnectWallet />
    },
    {
      chapter: 8,
      component: (
        <PublishMetadata
          showPriceTutorial={showPriceTutorial}
          setTutorialDdo={setTutorialDdo}
          setShowPriceTutorial={setShowPriceTutorial}
        />
      )
    },
    {
      chapter: 11,
      component: (
        <EditMetadata
          showPriceTutorial={showPriceTutorial}
          showComputeTutorial={showComputeTutorial}
          setShowComputeTutorial={setShowComputeTutorial}
        />
      )
    },
    {
      chapter: 12,
      component: (
        <ConsumeData
          showPriceTutorial={showPriceTutorial}
          showComputeTutorial={showComputeTutorial}
        />
      )
    },
    {
      chapter: 13,
      component: (
        <ViewHistory
          showPriceTutorial={showPriceTutorial}
          showComputeTutorial={showComputeTutorial}
        />
      )
    }
  ]

  const findInteractiveComponent = (
    arr: {
      chapter: number
      component: ReactElement
    }[],
    chapterNumber: number
  ) => {
    if (!chapterNumber) return
    return arr.find((e) => e.chapter === chapterNumber)?.component
  }

  const data = useStaticQuery(query)
  const chapterNodes = data.content.edges as TutorialChapterNode[]
  const chapters: TutorialChapterProps[] = chapterNodes.map((edge, i) => ({
    title: edge.node.frontmatter.title,
    markdown: edge.node.rawMarkdownBody,
    chapter: edge.node.frontmatter?.chapter,
    id: slugify(edge.node.frontmatter.title),
    titlePrefix: `Chapter ${i + 1}:`,
    videoUrl: edge.node.frontmatter?.videoUrl,
    interactiveComponent: findInteractiveComponent(
      interactivity,
      edge.node.frontmatter?.chapter
    )
  }))

  const [scrollPosition, setScrollPosition] = useState(0)
  useScrollPosition(({ prevPos, currPos }) => {
    prevPos.y !== currPos.y && setScrollPosition(currPos.y * -1)
  })

  return (
    <>
      <div className={styles.wrapper}>
        <TableOfContents chapters={chapters} />

        <div className={styles.tutorial}>
          {chapters.map((chapter, i) => {
            return (
              <TutorialChapter
                key={i}
                pageProgress={scrollPosition}
                chapter={chapter}
              />
            )
          })}
          <Permission eventType="browse">
            <>
              {/* !TODO: query content from json? */}
              <h3>Congratulations!</h3>
              <h5>Go ahead and try it yourself</h5>
              <p>
                Feel free to start your journey into the new european data
                economy right away. You can use our demonstrator assets listed
                below to experience what this data economy could feel like.
              </p>
              <SectionQueryResult
                className="demo"
                title=""
                query={queryDemonstrators}
              />
            </>
          </Permission>
        </div>
      </div>
    </>
  )
}
