import { Link } from 'gatsby'
import * as React from 'react'
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export default function PostCard ({ post }) {
  const { fields, frontmatter } = post
  const { path } = fields
  const { date, title, featuredImage, featured } = frontmatter

  const image = getImage(featuredImage)

  return (
    <article className='post-card-wrap column medium-6 large-4'>

      <div className='post-card'>

        <Link to={path} className='block' title={title}>
          <div className='grey-bg post-card__image CoverImage FlexEmbed FlexEmbed--16by9'>
            <GatsbyImage className="post-card__picture" image={image} alt={title} />
            {featured && (
              <span title='Featured Post'>
                <span className='post-card--featured__icon' data-icon='ei-star' data-size='s' />
              </span>
            )}
          </div>
        </Link>

        <div className='post-card__meta'>
          <span className='post-card__meta__date'>{date}</span>
        </div>

        <h2 className='post-card__title'>
          <Link title={title} to={path}>{title}</Link>
        </h2>

      </div>
    </article>
  )
}
