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
import { DDO } from '@oceanprotocol/lib'
import ConnectWallet from './Interactives/ConnectWallet'
import PublishMetadata from './Interactives/PublishMetadata'
import EditMetadata from './Interactives/EditMetadata'
import ConsumeData from './Interactives/ConsumeData'
import ViewHistory from './Interactives/ViewHistory'
import TableOfContents from './TableOfContents'
import { queryDemonstrators } from '../../organisms/HomeIntro'
import { useWeb3 } from '../../../providers/Web3'

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
    chapters: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/.+\/pages\/tutorial\/.+\\.md/"}}, sort: { fields: frontmatter___chapter}) {
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
    content: tutorialJson {
      congratulations {
        title
        tagline
        body
      }
    }
  }
`

export default function PageTutorial({
  setTutorialDdo
}: {
  setTutorialDdo: (ddo: DDO) => void
}): ReactElement {
  const { accountId } = useWeb3()
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
          accountId={accountId}
        />
      )
    }
  ]

  const findInteractiveComponent = (chapterNumber: number) => {
    if (!chapterNumber) return
    return interactivity.find(
      (interactive) => interactive.chapter === chapterNumber
    )?.component
  }

  const data = useStaticQuery(query)
  const chapterNodes = data.chapters.edges as TutorialChapterNode[]
  const { content } = data

  const chapters: TutorialChapterProps[] = chapterNodes.map((edge, i) => ({
    title: edge.node.frontmatter.title,
    markdown: edge.node.rawMarkdownBody,
    chapter: edge.node.frontmatter?.chapter,
    id: slugify(edge.node.frontmatter.title),
    titlePrefix: `Chapter ${i + 1}:`,
    videoUrl: edge.node.frontmatter?.videoUrl,
    interactiveComponent: findInteractiveComponent(
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
          <>
            <h3>{content.congratulations.title}</h3>
            <h5>{content.congratulations.tagline}</h5>
            <p>{content.congratulations.body}</p>
            <Permission eventType="browse">
              <SectionQueryResult title="" query={queryDemonstrators} />
            </Permission>
          </>
        </div>
      </div>
    </>
  )
}
