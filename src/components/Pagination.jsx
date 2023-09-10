import { Link } from 'gatsby'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export default function Pagination ({ pageContext }) {
  const { prevPagePath, nextPagePath } = pageContext
  const { t } = useTranslation()

  return (
    <div className='pagination clearfix'>
      {prevPagePath && (
        <div className='column medium-6 large-6 left'>
          <Link className='newer-posts' to={prevPagePath}><div data-icon='ei-chevron-left' /> <span>{t('pagination.prevPage')}</span></Link>
        </div>
      )}
      {nextPagePath && (
        <div className='column medium-6 large-6 right'>
          <Link className='older-posts' to={nextPagePath}><span>{t('pagination.nextPage')}</span> <div data-icon='ei-chevron-right' /></Link>
        </div>
      )}
    </div>
  )
}
