import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ArrowForwardIcon, ViewIcon } from '@chakra-ui/icons'
import { Tag, TagLabel, TagRightIcon, useDisclosure } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetComponentData } from 'graphQL/Queries'

import ComponentCard from './Misc/ComponentCard'

const RowComponent = ({ content }) => {
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch
  const [activeRow, setActiveRow] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const isChnagelog = typeof content === 'string'
  const data = isChnagelog ? activeRow : content
  const searchInput = isChnagelog ? content?.split(' ') : ['']
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { loading } = useQuery(GetComponentData, {
    skip: isOpen && isChnagelog ? false : true,
    variables: { sbomId: sbomId, projectId: productId, search: searchInput[0] },
    onCompleted: (data) => {
      if (data) {
        const components = data?.sbom?.components?.nodes
        setActiveRow(components?.length > 0 ? components[0] : '')
      }
    }
  })

  const { name } = content || ''

  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const link = generateProductVersionDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: 'components'
    }
  })

  const onView = () => onOpen()

  const onCheck = () => {
    if (typeof content === 'string') {
      prodCompDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: activeRow?.name
      })
      prodCompDispatch({ type: 'SET_EXPAND', payload: activeRow?.name })
      navigate(link)
    } else {
      prodCompDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: name
      })
      prodCompDispatch({ type: 'SET_EXPAND', payload: name })
      navigate(link)
    }
  }

  const getValue = () => {
    if (typeof content === 'string') {
      return content
    } else {
      return name
    }
  }

  return (
    <>
      <Tag
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ borderRadius: 'md', cursor: 'pointer' }}
      >
        <TagLabel textColor={primaryTextColor}>{getValue()}</TagLabel>
        {isHovered && <TagRightIcon as={ViewIcon} onClick={onView} />}
        {isHovered && <TagRightIcon as={ArrowForwardIcon} onClick={onCheck} />}
      </Tag>

      <ComponentCard
        isOpen={isOpen}
        onClose={onClose}
        data={data}
        loading={loading}
      />
    </>
  )
}

export default RowComponent
