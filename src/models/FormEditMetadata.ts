import {
  MetadataMarket,
  MetadataEditForm,
  ServiceSelfDescription
} from '../@types/MetaData'
import { secondsToString } from '../utils/metadata'
import { EditableMetadataLinks } from '@oceanprotocol/lib'
import * as Yup from 'yup'

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Title must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().required('Required').min(10),
  price: Yup.number().required('Required'),
  links: Yup.array<EditableMetadataLinks[]>().nullable(),
  serviceSelfDescription: Yup.array<ServiceSelfDescription[]>().nullable(),
  timeout: Yup.string().required('Required'),
  author: Yup.string().nullable()
})

export function getInitialValues(
  metadata: MetadataMarket,
  timeout: number,
  price: number
): Partial<MetadataEditForm> {
  const { additionalInformation, main } = metadata
  return {
    name: main.name,
    description: additionalInformation.description,
    price,
    links: additionalInformation.links,
    serviceSelfDescription: undefined,
    timeout: secondsToString(timeout),
    author: main.author
  }
}
