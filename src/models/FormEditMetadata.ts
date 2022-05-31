import { MetadataMarket, MetadataEditForm } from '../@types/MetaData'
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
  selfDescription: Yup.array()
    .of(Yup.object().shape({ url: Yup.string() }))
    .nullable(),
  timeout: Yup.string().required('Required'),
  author: Yup.string().nullable()
})

export function getInitialValues(
  metadata: MetadataMarket,
  timeout: number,
  price: number
): Partial<MetadataEditForm> {
  return {
    name: metadata.main.name,
    description: metadata.additionalInformation.description,
    price,
    links: metadata.additionalInformation.links,
    selfDescription: [{ url: metadata.additionalInformation?.selfDescription }],
    timeout: secondsToString(timeout),
    author: metadata.main.author
  }
}
