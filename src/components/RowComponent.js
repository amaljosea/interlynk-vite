import { useQuery } from '@apollo/client'
import React, { useState } from 'react'

import { Tag, Text, useColorModeValue, useDisclosure } from '@chakra-ui/react'

import { GetComponentData } from 'graphQL/Queries'

import ComponentCard from './Misc/ComponentCard'
import { useParams } from 'react-router-dom'

const RowComponent = ({ content }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const [activeRow, setActiveRow] = useState(null)
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const isChnagelog = typeof content === 'string'
  const data = isChnagelog ? activeRow : content
  const searchInput = isChnagelog ? content?.split(' ') : ['']

  const { isOpen, onOpen, onClose } = useDisclosure()

  useQuery(GetComponentData, {
    skip: !isChnagelog,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      search: searchInput[0]
    },
    onCompleted: (data) => {
      if (data) {
        const components = data?.sbom?.components?.nodes
        setActiveRow(components?.length > 0 ? components[0] : '')
      }
    }
  })

  const { name } = content || ''

  const onView = () => onOpen()

  const getValue = () => {
    if (typeof content === 'string') {
      return content
    } else {
      return name
    }
  }

  return (
    <>
      <Tag gap={3} borderRadius='md' cursor={'pointer'} onClick={onView}>
        <Text textColor={textColor}>{getValue()}</Text>
      </Tag>

      <ComponentCard isOpen={isOpen} onClose={onClose} data={data} />
    </>
  )
}

export default RowComponent
