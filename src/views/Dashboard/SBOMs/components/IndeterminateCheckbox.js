import React, { forwardRef, useEffect, useRef } from 'react'

export const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <label className='container'>
        <input type='checkbox' ref={resolvedRef} {...rest} />
        <span className='checkmark'></span>
      </label>
    )
  }
)
