import { useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Box, Flex, IconButton, Stack, Text, Tooltip } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompDependency } from 'graphQL/Queries'
import { GetShareCompDependency } from 'graphQL/Queries'

import { BiZoomIn, BiZoomOut } from 'react-icons/bi'

import SearchFilter from './SearchFilter'

const containerStyles = { width: '100vw', height: '80vh' }

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate)
  const [dimensions, setDimensions] = useState()
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect()
      setDimensions({ width, height })
      setTranslate({ x: width / 2, y: height / 2 })
    }
  }, [])
  return [dimensions, translate, containerRef]
}

const CustomNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
  activeComp,
  bgColor,
  textColor
}) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  return (
    <g transform='translate(-56,-50)' onClick={toggleNode}>
      <svg xmlns='http://www.w3.org/2000/svg'>
        <circle cx='50' cy='50' r='25' fill='dodgerBlue' stroke='transparent' />
        <text
          x='50'
          y='52'
          className='small'
          textAnchor='middle'
          fontFamily='inherit'
          dominantBaseline='middle'
        >
          {nodeDatum?.children?.length || 0}
        </text>
      </svg>
      <foreignObject {...foreignObjectProps} x={40} y={24}>
        <Flex
          flexDirection={'column'}
          alignItems={'flex-start'}
          maxW={nodeDatum?.children?.length > 0 ? '250px' : 'auto'}
        >
          <Box
            p={3}
            left={12}
            borderRadius={5}
            colorScheme='blue'
            minW={'fit-content'}
            position={'relative'}
            fontWeight={'medium'}
            wordBreak={'break-all'}
            bg={bgColor}
            color={textColor}
          >
            <Stack direction={'column'}>
              <Text
                fontSize={20}
                fontWeight={'semibold'}
                wordBreak={'break-all'}
                lineHeight={1.3}
                aria-label='parent_comp'
              >
                {nodeDatum?.name}
              </Text>
              {activeComp === null && !nodeDatum?.attributes?.version && (
                <Text color={sameSecondaryText} width={'fit-content'}>
                  Primary
                </Text>
              )}
            </Stack>
            {nodeDatum.attributes?.version && (
              <Text opacity={0.8} mt={1} fontSize={16} colorScheme='blue'>
                {nodeDatum.attributes?.version}
              </Text>
            )}
          </Box>
        </Flex>
      </foreignObject>
    </g>
  )
}

const GraphView = ({ data, activeComp }) => {
  const params = useParams()
  const sbomId = params.sbomid

  const signedUrlParams = getSignedUrlParams()
  const { primaryBgColor, primaryBlueText } = useThemeColor([
    'primaryBgColor',
    'primaryBlueText'
  ])

  const [treeView, setTreeView] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [zoom, setZoom] = useState(Number(0.6))
  const position = { x: 20, y: 250 }
  const [containerRef] = useCenteredTree()

  const nodeSize = { x: 1000, y: 500 }
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -10,
    y: 12
  }

  const { data: compDependency } = useQuery(
    signedUrlParams ? GetShareCompDependency : GetCompDependency,
    {
      skip: data?.nodes?.length > 0 || activeComp ? false : true,
      fetchPolicy: 'network-only',
      variables: {
        compId: activeComp?.id || data?.nodes[0]?.id,
        sbomId: signedUrlParams ? undefined : sbomId
      }
    }
  )
  const { dependsOn, id, name, version } = signedUrlParams
    ? compDependency?.shareLynkQuery?.component || ''
    : compDependency?.component || ''

  const handleZoomIn = () => setZoom(zoom + Number(0.1))
  const handleZoomOut = () => setZoom(zoom - Number(0.1))

  const transformNode = (node, currentDepth) => {
    const nodeDepthFactor = currentDepth === 0 ? 200 : 100
    return { ...node, depthFactor: nodeDepthFactor }
  }

  useEffect(() => {
    if (compDependency) {
      const dependsOnNodes = dependsOn?.map((relation) => {
        return {
          id: relation?.toComp?.id,
          name: relation?.toComp?.name,
          attributes: { version: relation?.toComp?.version }
        }
      })
      const data = {
        id: id,
        name: name || version || '----',
        children: dependsOnNodes
      }
      console.log('data', data)

      setTreeView(data)
    }
  }, [compDependency, dependsOn, id, name, version])

  // CLEAR SERACH
  const handleClear = () => {
    setFilterText('')
    const dependsOnNodes = dependsOn?.map((relation) => ({
      id: relation?.toComp?.id,
      name: relation?.toComp?.name,
      attributes: { version: relation?.toComp?.version }
    }))
    const data = {
      name: name || version || '----',
      children: dependsOnNodes
    }
    setTreeView(data)
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && value !== '') {
      const result = treeView?.children?.filter((item) =>
        item?.name?.includes(value)
      )
      setTreeView((prev) => ({ ...prev, children: [...result] }))
    }
  }

  return (
    <Flex flexDir={'column'} p={1} gap={6} overflow={'hidden'}>
      <Flex
        gap={2}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <SearchFilter
          id='relationship'
          filterText={filterText}
          onFilter={handleSearch}
          onClear={handleClear}
          onChange={onSearchInputChange}
        />
        <Flex gap={2}>
          <Tooltip label='Zoom In'>
            <IconButton
              variant='outline'
              onClick={handleZoomIn}
              isDisabled={zoom > 0.8}
              icon={<BiZoomIn size={20} />}
            />
          </Tooltip>
          <Tooltip label='Zoom Out'>
            <IconButton
              variant='outline'
              onClick={handleZoomOut}
              isDisabled={zoom < 0.2}
              icon={<BiZoomOut size={20} />}
            />
          </Tooltip>
        </Flex>
      </Flex>
      {data?.nodes?.length === 0 && !compDependency ? (
        <LynkAlert msg={'No relationship found'} />
      ) : (
        <Box style={containerStyles} ref={containerRef}>
          {treeView && (
            <Tree
              data={treeView}
              translate={position}
              zoom={Number(zoom)}
              initialDepth='3'
              separation={{ nonSiblings: 1, siblings: 1.2 }}
              depthFactor={350}
              enableLegacyTransitions={true}
              pathFunc={'step'}
              renderCustomNodeElement={(rd3tProps) => (
                <CustomNode
                  {...rd3tProps}
                  nodeDatum={transformNode(
                    rd3tProps?.nodeDatum,
                    rd3tProps?.depth
                  )}
                  bgColor={primaryBgColor}
                  textColor={primaryBlueText}
                  activeComp={activeComp}
                  foreignObjectProps={foreignObjectProps}
                />
              )}
            />
          )}
        </Box>
      )}
    </Flex>
  )
}

export default GraphView
