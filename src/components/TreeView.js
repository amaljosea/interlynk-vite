import { useLazyQuery, useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Center,
  Flex,
  IconButton,
  Spinner,
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompDependency } from 'graphQL/Queries'
import { GetComponentPath } from 'graphQL/Queries'

import { BiZoomIn, BiZoomOut } from 'react-icons/bi'
import { LuMoveHorizontal, LuMoveVertical } from 'react-icons/lu'

import CompInfo from './Misc/CompInfo'

const InteractionsTooltip = ({ color }) => (
  <Tooltip
    label={
      <Stack mt={1} spacing={1} p={1}>
        <Text>User Interaction Keys:</Text>
        <Text>
          <strong>Click & Drag: </strong> Pan the tree.
        </Text>
        <Text>
          <strong>Scroll: </strong> Zoom in and out of the tree.
        </Text>
      </Stack>
    }
    placement='bottom'
    hasArrow
  >
    <InfoIcon fontSize={16} color={color} />
  </Tooltip>
)

const updateTreeData = (treeData, nodeId, newData) => {
  const updateNode = (node) => {
    if (node.id === nodeId) {
      if (newData?.length === 0) {
        return { ...node, children: [] }
      } else {
        return { ...node, children: [...(node.children || []), ...newData] }
      }
    }
    if (node.children) {
      return { ...node, children: node.children.map(updateNode) }
    }
    return node
  }

  if (Array.isArray(treeData)) {
    return treeData.map(updateNode)
  }
  return updateNode(treeData)
}

const CustomNode = ({ nodeDatum, compId, click, foreignObjectProps }) => {
  const { secondaryBgColor, primaryBlueText } = useThemeColor([
    'secondaryBgColor',
    'primaryBlueText'
  ])

  if (nodeDatum?.name) {
    const isActive = nodeDatum?.compId === compId
    return (
      <g transform='translate(-40,-30)' onClick={() => click(nodeDatum)}>
        <svg xmlns='http://www.w3.org/2000/svg'>
          <circle
            cx='35'
            cy='35'
            r='17.5'
            fill={primaryBlueText}
            stroke='transparent'
          />
          <text
            x='35'
            y='35'
            className='small'
            textAnchor='middle'
            fontFamily='inherit'
            dominantBaseline='middle'
          >
            {nodeDatum?.count || 0}
          </text>
        </svg>
        <foreignObject {...foreignObjectProps} x={10} y={15}>
          <Flex
            flexDirection={'column'}
            alignItems={'flex-start'}
            maxW={'300px'}
          >
            <Box
              position={'relative'}
              fontWeight={'medium'}
              wordBreak={'break-all'}
              bg={isActive ? primaryBlueText : secondaryBgColor}
              color={isActive ? 'white' : primaryBlueText}
              sx={{ p: 3, left: 12, borderRadius: 5, minW: 'fit-content' }}
            >
              <Text
                wordBreak={'break-all'}
                sx={{ fontSize: 16, fontWeight: 'medium', lineHeight: 1.3 }}
              >
                {nodeDatum?.name}
              </Text>
              {nodeDatum?.version && (
                <Text
                  color={isActive ? 'white' : primaryBlueText}
                  sx={{ mt: 1, fontSize: 14, opacity: 0.8 }}
                >
                  {nodeDatum?.version}
                </Text>
              )}
            </Box>
          </Flex>
        </foreignObject>
      </g>
    )
  }

  return null
}

const buildTree = (path, leafNode) => {
  if (path?.length === 0) return leafNode
  const [current, ...remainingPath] = path
  // console.log('current', current)
  return {
    ...current,
    id: uuidv4(),
    isPrimary: true,
    compId: current?.id,
    name: current?.name,
    version: current?.version,
    count: 1,
    children: [buildTree(remainingPath, leafNode)]
  }
}

const TreeView = ({ isOpen, onClose, component, isPrimary }) => {
  const params = useParams()
  const { dispatch } = useGlobalState()
  const { prodCompDispatch } = dispatch

  const { id: compId } = component || ''

  const { grayBorderColor, primaryBlueText } = useThemeColor([
    'grayBorderColor',
    'primaryBlueText'
  ])

  const [getData, { loading: dependencyLoading }] =
    useLazyQuery(GetCompDependency)

  const { data, loading: pathLoading } = useQuery(GetComponentPath, {
    skip: isOpen ? false : true,
    variables: { compId: compId, sbomId: params?.sbomid }
  })

  const { pathToPrimary } = data?.component || ''
  const { path } = pathToPrimary?.length > 0 ? pathToPrimary[0] : ''

  const [tree, setTree] = useState({})
  const [gap, setGap] = useState(2)
  const [filterText, setFilterText] = useState('')
  const [orientation, setOrientation] = useState('horizontal')
  const [zoom, setZoom] = useState(Number(0.8))
  const [depthFactor, setDepthFactor] = useState(450)
  const [translate, setTranslate] = useState({
    x: 30,
    y: 300
  })

  const handleZoomIn = () => setZoom(zoom + Number(0.1))
  const handleZoomOut = () => setZoom(zoom - Number(0.1))

  const getRelations = useCallback(() => {
    getData({
      variables: {
        compId: compId,
        sbomId: params?.sbomid
      }
    }).then((res) => {
      const { dependsOn, id, name, version } = res?.data?.component || ''
      const dependsOnNodes = dependsOn?.map((relation) => {
        return {
          id: uuidv4(),
          compId: relation?.toComp?.id,
          name: relation?.toComp?.name,
          version: relation?.toComp?.version,
          count: relation?.toComp?.dependsOnCount,
          children: []
        }
      })
      const defaultValue = {
        id,
        compId,
        name,
        version,
        count: dependsOn?.length || 0,
        children: dependsOnNodes
      }
      if (path?.length > 0) {
        const treeView = buildTree(path?.slice(0, -1), defaultValue)
        setTree(treeView)
      } else {
        setTree(defaultValue)
      }
    })
  }, [compId, getData, params?.sbomid, path])

  const handleNodeClick = (datum) => {
    getData({
      variables: {
        compId: datum?.compId,
        sbomId: params?.sbomid
      }
    }).then((res) => {
      const { dependsOn } = res?.data?.component || ''
      if (datum?.children?.length === 0 && dependsOn?.length > 0) {
        const newData = dependsOn?.map((relation) => {
          return {
            id: uuidv4(),
            compId: relation?.toComp?.id,
            name: relation?.toComp?.name,
            version: relation?.toComp?.version,
            count: relation?.toComp?.dependsOnCount,
            children: []
          }
        })
        const updatedTree = updateTreeData(tree, datum.id, newData)
        setTree(updatedTree)
      } else {
        const updatedTree = updateTreeData(tree, datum.id, [])
        setTree(updatedTree)
      }
    })
  }

  // CLEAR SERACH
  const handleClear = () => {
    setFilterText('')
    getRelations()
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
      const result = tree?.children?.filter((item) =>
        item?.name?.includes(value)
      )
      setTree((prev) => ({ ...prev, children: [...result] }))
    }
  }

  const nodeSize = { x: 1000, y: 500 }
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -10,
    y: 12
  }

  const onChangeDirection = (value) => {
    const isVertical = value === 'vertical'
    const positions = { x: isVertical ? 500 : 30, y: isVertical ? 100 : 300 }
    setTranslate(positions)
    setGap(isVertical ? 3 : 2)
    setDepthFactor(isVertical ? 300 : 450)
    setOrientation(value)
  }

  const isHorizontal = orientation === 'horizontal'
  const isVertical = orientation === 'vertical'
  const variant = (value) => (orientation === value ? 'solid' : 'ghost')

  const handleClose = () => {
    prodCompDispatch({ type: 'SET_COMPONENT', payload: null })
    onClose()
  }

  useEffect(() => {
    if (isOpen && compId) {
      getRelations()
    }
  }, [compId, getRelations, isOpen, params])

  return (
    <Drawer size='2xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} onClick={handleClose} />
        <DrawerHeader>
          <Flex alignItems={'center'} gap={3}>
            <Text>Relationships</Text>
            {component && <CompInfo data={component} />}
            <InteractionsTooltip color={primaryBlueText} />
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          {dependencyLoading || pathLoading ? (
            <Center h={'90vh'}>
              <Spinner size='lg' />
            </Center>
          ) : (
            <Box h={'100vh'}>
              {compId ? (
                <Stack height={'100%'} spacing={4}>
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
                    <Flex gap={4} alignItems={'center'}>
                      {/* ORIENTATION */}
                      <Flex gap={2} alignItems={'center'}>
                        <Text>Orientation</Text>
                        <Stack
                          direction={'row'}
                          spacing={0}
                          sx={{
                            borderRadius: '6px',
                            alignItems: 'center'
                          }}
                          border={`1px solid ${grayBorderColor}`}
                        >
                          <Tooltip label='Horizontal'>
                            <IconButton
                              variant={variant('horizontal')}
                              icon={<LuMoveHorizontal size={20} />}
                              colorScheme={isHorizontal ? 'blue' : 'gray'}
                              onClick={() => onChangeDirection('horizontal')}
                            />
                          </Tooltip>
                          <Tooltip label='Vertical'>
                            <IconButton
                              variant={variant('vertical')}
                              icon={<LuMoveVertical size={20} />}
                              colorScheme={isVertical ? 'blue' : 'gray'}
                              onClick={() => onChangeDirection('vertical')}
                            />
                          </Tooltip>
                        </Stack>
                      </Flex>
                      {/* ZOOM */}
                      <Flex gap={2} alignItems={'center'}>
                        <Text>Zoom</Text>
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
                  </Flex>
                  {!pathToPrimary && !isPrimary && (
                    <Tag
                      colorScheme='yellow'
                      textAlign={'right'}
                      sx={{
                        w: 'fit-content',
                        fontSize: 'xs',
                        wordBreak: 'break-all'
                      }}
                    >
                      No relationship specified between this component and the
                      primary component
                    </Tag>
                  )}
                  <Tree
                    draggable
                    data={tree}
                    zoom={Number(zoom)}
                    translate={translate}
                    pathFunc={'diagonal'}
                    depthFactor={depthFactor}
                    orientation={orientation}
                    separation={{ siblings: gap, nonSiblings: gap }}
                    renderCustomNodeElement={(rd3tProps) => (
                      <CustomNode
                        {...rd3tProps}
                        compId={compId}
                        click={handleNodeClick}
                        foreignObjectProps={foreignObjectProps}
                      />
                    )}
                  />
                </Stack>
              ) : (
                <Text>Relationship not found</Text>
              )}
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default TreeView
