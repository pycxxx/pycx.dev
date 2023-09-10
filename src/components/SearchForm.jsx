import * as React from 'react'

export default function SearchForm () {
  return (
    <div className='search-form-container'>

      <form className='search-form'>
        <fieldset className='search-form__fieldset'>
          <div className='row'>
            <div className='column column--center large-8'>
              <input className='search-form__field' placeholder='Type to search' autoFocus />
              <input className='search-form__submit' type='submit' value='search' />
            </div>
          </div>
        </fieldset>
      </form>

      <div className='row'>
        <div className='column column--center large-8'>
          <div className='search-results' />
        </div>
      </div>

      <div className='close-search-button search-form-container__close'>
        <span data-icon='ei-close' data-size='s' />
      </div>

    </div>
  )
}
