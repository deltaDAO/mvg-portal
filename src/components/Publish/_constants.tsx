import { allowFixedPricing, customProviderUrl } from '../../../app.config'
import {
  FormPublishData,
  MetadataAlgorithmContainer,
  PublishFeedback,
  SAAS_PAYMENT_MODE,
  StepContent
} from './_types'
import content from '../../../content/publish/form.json'
import PricingFields from './Pricing'
import MetadataFields from './Metadata'
import ServicesFields from './Services'
import Preview from './Preview'
import Submission from './Submission'
import { ServiceComputeOptions } from '@oceanprotocol/lib'
import contentFeedback from '../../../content/publish/feedback.json'
import PoliciesFields from './Policies'

export const wizardSteps: StepContent[] = [
  {
    step: 1,
    title: content.metadata.title,
    component: <MetadataFields />
  },
  {
    step: 2,
    title: content.services.title,
    component: <ServicesFields />
  },
  {
    step: 3,
    title: content.policies.title,
    component: <PoliciesFields />
  },
  {
    step: 4,
    title: content.pricing.title,
    component: <PricingFields />
  },
  {
    step: 5,
    title: content.preview.title,
    component: <Preview />
  },
  {
    step: 6,
    title: content.submission.title,
    component: <Submission />
  }
]

const computeOptions: ServiceComputeOptions = {
  allowRawAlgorithm: false,
  allowNetworkAccess: true,
  publisherTrustedAlgorithmPublishers: [],
  publisherTrustedAlgorithms: []
}

export const initialValues: FormPublishData = {
  user: {
    stepCurrent: 1,
    chainId: 32457,
    accountId: ''
  },
  metadata: {
    nft: { name: '', symbol: '', description: '', image_data: '' },
    transferable: true,
    type: 'dataset',
    name: '',
    author: '',
    description: '',
    tags: [],
    termsAndConditions: false,
    dockerImage: '',
    dockerImageCustom: '',
    dockerImageCustomTag: '',
    dockerImageCustomEntrypoint: '',
    usesConsumerParameters: false,
    consumerParameters: [],
    gaiaXInformation: {
      termsAndConditions: [
        {
          url: '',
          type: 'url'
        }
      ],
      containsPII: false,
      PIIInformation: undefined,
      serviceSD: { url: '' }
    },
    saas: {
      paymentMode: SAAS_PAYMENT_MODE.SUBSCRIPTION
    }
  },
  services: [
    {
      files: [{ url: '', type: 'url' }],
      links: [{ url: '', type: 'url' }],
      dataTokenOptions: { name: '', symbol: '' },
      access: 'access',
      providerUrl: {
        url: customProviderUrl,
        valid: true,
        custom: false
      },
      computeOptions,
      usesConsumerParameters: false,
      consumerParameters: []
    }
  ],
  policies: {
    timeout: '',
    allow: [],
    deny: []
  },
  pricing: {
    baseToken: { address: '', name: '', symbol: 'EUROe', decimals: 6 },
    price: 0,
    type: allowFixedPricing === 'true' ? 'fixed' : 'free',
    freeAgreement: false
  }
}

export const algorithmContainerPresets: MetadataAlgorithmContainer[] = [
  {
    image: 'node',
    tag: 'latest',
    entrypoint: 'node $ALGO',
    checksum: ''
  },
  {
    image: 'python',
    tag: 'latest',
    entrypoint: 'python $ALGO',
    checksum: ''
  }
]

export const initialPublishFeedback: PublishFeedback = contentFeedback
