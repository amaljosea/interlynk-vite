import { useMutation, useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
  Stack,
  Tag,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { updateBulkCompVex } from 'graphQL/Mutation'
import {
  GetCdxResponses,
  GetProjectGroup,
  getVexJustifications,
  getVexStatuses
} from 'graphQL/Queries'
import { GetCustomFields } from 'graphQL/Queries'

import { FaTimes } from 'react-icons/fa'
import { FaPenToSquare } from 'react-icons/fa6'

const VexModal = ({
  selectedGroup,
  checkEquals,
  isOpen,
  onClose,
  selectedVulns,
  setSelectedVulns,
  setToggleClear
}) => {
  const { showToast } = useCustomToast()
  const params = useParams()
  const sbomId = params.sbomid
  const vulnId = useQueryParam('vulnId')

  const { fixedVersions, componentVulnCustomFields } =
    selectedVulns?.length > 0 ? selectedVulns[0] : []

  const [statusTitle, setStatusTitle] = useState('')
  const [statusName, setStatusName] = useState('')
  const [justification, setJustification] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [actionStatement, setActionStatement] = useState('')
  const [response, setResponse] = useState('')
  const [responseTitle, setResponseTitle] = useState('')
  const [details, setDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [impactData, setImpactData] = useState('')
  const [upstream, setUpstream] = useState(false)
  const [stagOne, setStagOne] = useState('')
  const [stagTwo, setStagTwo] = useState('')
  const [stagThree, setStagThree] = useState('')
  const [stagCustom, setStagCustom] = useState('')

  const { headingTextSecondary, headingTextColor } = useThemeColor([
    'headingTextSecondary',
    'headingTextColor'
  ])

  const { data: fields } = useQuery(GetCustomFields)
  const { componentVulnCustomFieldDefinitions } = fields || ''
  const { nodes } = componentVulnCustomFieldDefinitions || ''

  const fieldOne = nodes?.find((item) => item?.fieldType === 'RANGE')
  const fieldTwo = nodes?.find((item) => item?.fieldType === 'TEXT')

  const [formValues, setFormValues] = useState(null)

  const handleChange = (id, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [id]: value
    }))
  }

  const { data: allVexStatus } = useQuery(getVexStatuses)
  const { data: allVexJustify } = useQuery(getVexJustifications)
  const { data: allCdx } = useQuery(GetCdxResponses)

  const { data: groups } = useQuery(GetProjectGroup, {
    skip: checkEquals ? false : true,
    variables: { id: selectedGroup }
  })

  const [compVexCreate, { loading }] = useMutation(updateBulkCompVex, {
    onCompleted: (data) => {
      if (data) {
        setSelectedVulns([])
        setToggleClear(true)
      }
    }
  })

  const isValuePresent =
    nodes?.length > 0 && formValues && formValues[fieldOne?.id] !== ''

  const generateControl = useCallback(
    (status) => {
      isValuePresent ? setStagCustom('green') : setStagCustom('red')
      switch (status) {
        case 'In Triage':
          setStagOne('green')
          details ? setStagTwo('green') : setStagTwo('gray')
          notes ? setStagThree('green') : setStagThree('gray')
          break
        case 'Not Affected':
          setStagOne('green')
          if (!justification && !impactData) {
            setStagTwo('red')
          } else {
            setStagTwo('green')
          }
          notes ? setStagThree('green') : setStagThree('gray')
          break
        case 'Affected':
          setStagOne('green')
          if (!actionStatement && !response) {
            setStagTwo('red')
          } else if (response && !actionStatement) {
            setStagTwo('red')
          } else {
            setStagTwo('green')
          }
          notes ? setStagThree('green') : setStagThree('gray')
          break
        case 'Fixed':
          setStagOne('green')
          notes ? setStagTwo('green') : setStagTwo('gray')
          break
        default:
          if (notes) {
            setStagThree('green')
            setStagOne('green')
          } else {
            setStagThree('gray')
            setStagTwo('gray')
            setStagOne('gray')
          }
          break
      }
    },
    [
      actionStatement,
      details,
      impactData,
      isValuePresent,
      justification,
      notes,
      response
    ]
  )

  const handleStatusChange = (e) => {
    const { value } = e.target
    const status = e.target.options[e.target.selectedIndex].text
    status === 'Not Affected' && !vulnId
      ? setUpstream(true)
      : setUpstream(false)
    setStatusTitle(value)
    setStatusName(status)
    setJustification('')
    setSelectedTag('')
    setActionStatement('')
    setResponse('')
    setResponseTitle('')
    setDetails('')
    setNotes('')
    setImpactData('')
  }

  const handleResponseChange = (e) => {
    const { value } = e.target
    const title = e.target.options[e.target.selectedIndex].text
    setResponse(value)
    setResponseTitle(title)
  }

  const handleJustifyChange = (e) => {
    const { value } = e.target
    setJustification(value)
  }

  const getId = (key) => {
    const output = componentVulnCustomFields?.find(
      (item) => item?.componentVulnCustomFieldDefinitionId === key
    )
    return output ? output?.id : undefined
  }

  const result = formValues
    ? Object.entries(formValues)?.map(([key, value]) => ({
        value: value,
        _destroy: value === '' ? true : undefined,
        componentVulnCustomFieldDefinitionId: key,
        id: componentVulnCustomFields?.length > 0 ? getId(key) : undefined
      }))
    : undefined

  const handleSave = () => {
    setToggleClear(false)
    const vulnIds = selectedVulns?.map((item) => item?.id)
    compVexCreate({
      variables: {
        comVulnIds: vulnIds,
        sbomId: sbomId || undefined,
        propagateVex: upstream,
        vexStatusId: statusTitle,
        detail: details !== '' ? details : undefined,
        note: notes !== '' ? notes : undefined,
        vexJustificationId: justification !== '' ? justification : undefined,
        cdxResponseId: response !== '' ? response : undefined,
        impact: impactData === '' ? undefined : impactData,
        action: actionStatement !== '' ? actionStatement : undefined,
        fixedIn: selectedTag !== '' ? selectedTag : undefined,
        componentVulnCustomFieldAttributes: result
      }
    }).then((res) => {
      const errors = res?.data?.componentVexBulkUpdate?.errors
      if (errors?.length > 0) {
        showToast({
          description: errors[0],
          status: 'error'
        })
      } else {
        onClose()
      }
    })
  }

  const handleClose = () => onClose()

  const stagTwoHeight = () => {
    if (statusName === 'Affected' && responseTitle === 'Update') {
      return '240px'
    } else if (statusName === 'Affected' && responseTitle !== 'Update') {
      return '156px'
    } else if (statusName === 'Not Affected') {
      return '174px'
    } else {
      return 14
    }
  }

  const disabled =
    statusTitle === '' && formValues && formValues[fieldOne?.id] === ''

  useEffect(() => {
    generateControl(statusName)
  }, [generateControl, statusName])

  useEffect(() => {
    if (componentVulnCustomFields?.length > 0) {
      const result = componentVulnCustomFields?.reduce((acc, item) => {
        acc[item.componentVulnCustomFieldDefinitionId] = item.value
        return acc
      }, {})
      setFormValues(result)
    } else {
      const data = nodes?.reduce((acc, field) => {
        acc[field.id] = ''
        return acc
      }, {})
      setFormValues(data || null)
    }
  }, [componentVulnCustomFields, nodes])

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText={'Save'}
      isLoading={loading}
      Icon={FaPenToSquare}
      onSubmit={handleSave}
      onClose={handleClose}
      title={'Vulnerabilty Status'}
      disabled={disabled}
    >
      {sbomId && (
        <Box mb={4}>
          <Tag variant='subtle' colorScheme='blue' wordBreak={'break-all'}>
            {selectedVulns?.length > 0 ? selectedVulns[0]?.vuln.vulnId : ''}
          </Tag>
        </Box>
      )}
      <Grid width={'100%'} templateColumns='repeat(12, 1fr)' gap={4}>
        <GridItem colSpan={1}>
          <Stack dir='column' spacing={2} alignItems={'center'} height='100%'>
            <IconButton
              size='xs'
              colorScheme={stagOne}
              icon={<CheckIcon />}
              isRound={true}
            />
            <Box w={'1px'} h={10} bg={headingTextSecondary} />
            <IconButton
              size='xs'
              isRound={true}
              colorScheme={stagTwo}
              icon={stagTwo === 'red' ? <FaTimes /> : <CheckIcon />}
            />
            <Box
              w={'1px'}
              h={stagTwoHeight}
              bg={headingTextSecondary}
              hidden={!statusTitle || statusName === 'Fixed'}
            />
            <IconButton
              size='xs'
              icon={<CheckIcon />}
              isRound={true}
              colorScheme={stagThree}
              hidden={!statusTitle || statusName === 'Fixed'}
            />
            <Box
              w={'1px'}
              h={'60px'}
              bg={headingTextSecondary}
              hidden={!statusTitle || nodes?.length === 0}
            />
            <IconButton
              size='xs'
              isRound={true}
              colorScheme={stagCustom}
              hidden={!statusTitle || nodes?.length === 0}
              icon={stagCustom === 'red' ? <FaTimes /> : <CheckIcon />}
            />
          </Stack>
        </GridItem>
        <GridItem as={Flex} flexDir='column' gap={4} colSpan={11}>
          {/* STATUS */}
          <FormControl isRequired={nodes?.length === 0}>
            <FormLabel htmlFor='vexType' fontSize='sm'>
              Status
            </FormLabel>
            <Select
              id='vexType'
              name='vexType'
              fontSize='sm'
              value={statusTitle}
              onChange={handleStatusChange}
            >
              <option value=''>-- Select Status --</option>
              {allVexStatus ? (
                allVexStatus.vexStatuses.map((st, idx) => (
                  <option key={idx} value={st.id}>
                    {st.name}
                  </option>
                ))
              ) : (
                <option value={''}>No data found</option>
              )}
            </Select>
          </FormControl>
          {/* JUSTIFICATION */}
          {statusName === 'Not Affected' && (
            <FormControl>
              <FormLabel htmlFor='justification' fontSize='sm'>
                Justification
              </FormLabel>
              <Select
                fontSize='sm'
                id='justification'
                name='justification'
                value={justification}
                onChange={handleJustifyChange}
              >
                <option value=''>-- Select --</option>
                {allVexJustify ? (
                  allVexJustify.vexJustifications.map((justify, idx) => (
                    <option key={idx} value={justify.id}>
                      {justify.name}
                    </option>
                  ))
                ) : (
                  <option value={''}>No data found</option>
                )}
              </Select>
            </FormControl>
          )}
          <Text
            fontSize='sm'
            fontWeight={'medium'}
            color={headingTextColor}
            hidden={statusName !== 'Not Affected'}
          >
            AND / OR
          </Text>
          {/* IMPACT STATEMENT */}
          {statusName === 'Not Affected' && (
            <FormControl>
              <FormLabel htmlFor='impactStatement' fontSize='sm'>
                Impact Statement
              </FormLabel>
              <Textarea
                type='text'
                name='impactStatement'
                rows={2}
                id='impactStatement'
                placeholder='Add impact statement'
                value={impactData}
                onChange={(e) => setImpactData(e.target.value)}
                fontSize='sm'
              />
            </FormControl>
          )}
          {statusName === 'Affected' &&
            responseTitle === 'Update' &&
            !groups && (
              <LynkAlert
                msg={
                  'Product versions are different. Please select same version.'
                }
              />
            )}
          {/* ACTION STATEMENT */}
          {statusName === 'Affected' && (
            <FormControl>
              <FormLabel htmlFor='actionStatement' fontSize='sm'>
                Action Statement
              </FormLabel>
              <Textarea
                rows={3}
                name='actionStatement'
                id='actionStatement'
                fontSize='sm'
                value={actionStatement}
                onChange={(e) => setActionStatement(e.target.value)}
                placeholder='Example: This vulnerability can be mitigate by running the application with ENV_PROTECTED enabled or turning off Notifications under settings.'
              />
            </FormControl>
          )}
          {/* RESPONSE */}
          {statusName === 'Affected' && (
            <FormControl>
              <FormLabel htmlFor='response' fontSize='sm'>
                Response
              </FormLabel>
              {allCdx && (
                <Select
                  fontSize='sm'
                  id='response'
                  name='response'
                  value={response}
                  onChange={handleResponseChange}
                >
                  <option value=''>-- Select --</option>
                  {allCdx?.cdxResponses.length > 0 &&
                    allCdx?.cdxResponses.map((item, idx) => (
                      <option key={idx} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </Select>
              )}
            </FormControl>
          )}
          {/* FIXED VERSION */}
          {responseTitle === 'Update' && (
            <FormControl width={'100%'} isRequired>
              <FormLabel htmlFor='fixedVersion' fontSize='sm'>
                Fixed Version
              </FormLabel>
              <Select
                fontSize='sm'
                id='fixedVersion'
                name='fixedVersion'
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                textTransform={'capitalize'}
              >
                <option value=''>-- Select --</option>
                {fixedVersions?.length > 0 ? (
                  fixedVersions?.map((item, index) => (
                    <option key={index} value={item} name={item}>
                      {item}
                    </option>
                  ))
                ) : (
                  <option value=''>-- --</option>
                )}
              </Select>
            </FormControl>
          )}
          {/* DETAILS */}
          {statusName === 'In Triage' && (
            <FormControl>
              <FormLabel htmlFor='details' fontSize='sm'>
                Details
              </FormLabel>
              <Textarea
                rows={2}
                name='details'
                id='details'
                fontSize='sm'
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder='Example: The vulnerability surfaced in the reports on March 13th 3pm and has been sent to PSIRT for analysis by 7pm.'
              />
            </FormControl>
          )}
          {/* INTERNAL NOTES */}
          <FormControl>
            <FormLabel htmlFor='internalNotes' fontSize='sm'>
              Internal Notes
            </FormLabel>
            <Textarea
              rows={2}
              name='internalNotes'
              id='internalNotes'
              fontSize='sm'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Example: John Appleseed has scanned the codebase and found two instances of function alls encrypt(). Next step: exploitability analysis.'
            />
          </FormControl>
          {/* CUSTOM FIELDS */}
          {nodes?.length > 0 && (
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>{fieldOne?.displayName}</FormLabel>
                <Select
                  fontSize='sm'
                  value={formValues ? formValues[fieldOne?.id] : ''}
                  onChange={(e) => handleChange(fieldOne?.id, e.target.value)}
                >
                  <option value={''}>-- Select --</option>
                  {Array.from(
                    { length: fieldOne?.maxValue - fieldOne?.minValue + 1 },
                    (_, i) => (
                      <option key={i} value={fieldOne?.minValue + i}>
                        {fieldOne?.minValue + i}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{fieldTwo?.displayName}</FormLabel>
                <Input
                  fontSize={'sm'}
                  value={formValues ? formValues[fieldTwo?.id] : ''}
                  onChange={(e) => handleChange(fieldTwo?.id, e.target.value)}
                />
              </FormControl>
            </Stack>
          )}
          {/* UPSTERAM PRODUCT */}
          <FormControl>
            <Checkbox
              size='sm'
              isChecked={upstream}
              isDisabled={statusTitle === ''}
              onChange={(e) => setUpstream(e.target.checked)}
            >
              Also update upstream products
            </Checkbox>
          </FormControl>
        </GridItem>
      </Grid>
    </LynkModal>
  )
}

export default VexModal
