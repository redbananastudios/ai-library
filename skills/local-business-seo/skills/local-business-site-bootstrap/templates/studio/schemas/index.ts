import { siteSettings } from './documents/siteSettings'
import { tracking } from './documents/tracking'
import { area } from './documents/area'
import { service } from './documents/service'
import { post } from './documents/post'
import { faq } from './documents/faq'
import { review } from './documents/review'
import { author } from './documents/author'
import { tag } from './documents/tag'
import { category } from './documents/category'
import { nav } from './documents/nav'
import { seo } from './objects/seo'
import { address } from './objects/address'
import { socialLinks } from './objects/socialLinks'

export const schemaTypes = [
  // documents
  siteSettings,
  tracking,
  area,
  service,
  post,
  faq,
  review,
  author,
  tag,
  category,
  nav,
  // objects
  seo,
  address,
  socialLinks,
]
