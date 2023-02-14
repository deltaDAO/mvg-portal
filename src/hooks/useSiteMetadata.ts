import { useStaticQuery, graphql } from 'gatsby'

interface UseSiteMetadata {
  siteTitle: string
  siteTagline: string
  siteUrl: string
  siteIcon: string
  siteImage: { childImageSharp: { original: { src: string } } }
  copyright: string
  menu: {
    name: string
    link?: string
    subItems?: {
      name: string
      link?: string
      subItems?: {
        name: string
        link: string
      }[]
    }[]
  }[]
  warning: {
    main: string
    polygonPublish: string
  }
  announcement: {
    main: string
    polygon: string
  }
  badge: string
  footer: {
    subtitle: string
    copyright: string
    privacyTitle: string
    content: {
      title: string
      links: {
        name: string
        link: string
      }[]
    }[]
  }
  appConfig: {
    metadataCacheUri: string
    complianceUri: string
    complianceApiVersion: string
    infuraProjectId: string
    chainIds: number[]
    chainIdsSupported: number[]
    marketFeeAddress: string
    portisId: string
    allowFixedPricing: string
    allowDynamicPricing: string
    allowFreePricing: string
    allowAdvancedSettings: string
    credentialType: string
    defaultPrivacyPolicySlug: string
    privacyPreferenceCenter: string
    allowAdvancedPublishSettings: string
    verifierApi: string
    purgatoryUri: string
  }
}

const query = graphql`
  query {
    site {
      siteMetadata {
        siteTitle
        siteTagline
        siteUrl
        siteIcon
        copyright
        menu {
          name
          link
          subItems {
            name
            link
          }
        }
        warning {
          main
          polygonPublish
        }
        announcement {
          main
          polygon
        }
        badge
        footer {
          subtitle
          copyright
          privacyTitle
          content {
            title
            links {
              name
              link
            }
          }
        }
        appConfig {
          metadataCacheUri
          complianceUri
          complianceApiVersion
          infuraProjectId
          chainIds
          chainIdsSupported
          marketFeeAddress
          portisId
          allowFixedPricing
          allowDynamicPricing
          allowFreePricing
          allowAdvancedSettings
          allowAdvancedPublishSettings
          credentialType
          defaultPrivacyPolicySlug
          privacyPreferenceCenter
          purgatoryUri
        }
      }
    }

    siteImage: allFile(filter: { relativePath: { eq: "site.json" } }) {
      edges {
        node {
          childContentJson {
            site {
              siteImage {
                childImageSharp {
                  original {
                    src
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export function useSiteMetadata(): UseSiteMetadata {
  const data = useStaticQuery(query)

  const siteMeta: UseSiteMetadata = {
    ...data.siteImage.edges[0].node.childContentJson.site,
    ...data.site.siteMetadata
  }

  return siteMeta
}
