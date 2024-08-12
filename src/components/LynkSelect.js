import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { useSelect } from 'hooks/useSelect'

const LynkSelect = (props) => {
  const { style } = useSelect('field')

  return props.isCreatable ? (
    <CreatableSelect styles={style} className='react-select' {...props} />
  ) : (
    <ReactSelect styles={style} className='react-select' {...props} />
  )
}

export default LynkSelect
