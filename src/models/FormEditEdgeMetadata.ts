import {
  MetadataMarket,
  MetadataEditForm,
  ServiceSelfDescription
} from '../@types/MetaData'
import * as Yup from 'yup'

export const edgeValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Title must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().min(10).nullable(),
  serviceSelfDescription: Yup.array<ServiceSelfDescription[]>().nullable(),
  author: Yup.string().nullable()
})

export function getInitialEdgeValues(
  metadata: MetadataMarket
): Partial<MetadataEditForm> {
  const { additionalInformation, main } = metadata
  return {
    name: main.name,
    description: additionalInformation?.description,
    serviceSelfDescription: undefined,
    author: main?.author
  }
}
