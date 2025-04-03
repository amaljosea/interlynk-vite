import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Checkbox,
  Flex,
  FormErrorMessage,
  IconButton,
  Input,
  Stack,
  Tag,
  Text,
  Textarea
} from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { updateBulkCompVex } from 'graphQL/Mutation'
import {
  GetCdxResponses,
  GetCustomFields,
  GetProjectGroup,
  getVexJustifications,
  getVexStatuses
} from 'graphQL/Queries'

import { FaTimes } from 'react-icons/fa'
import { FaPenToSquare } from 'react-icons/fa6'

const VexModal = ({
  vulnId,
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
  const id = useQueryParam('vulnId')

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
  const { data: allCdx } = useQuery(GetCdxResponses, {
    skip: statusName === 'Affected' ? false : true
  })

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
          setStagCustom('gray')
          details ? setStagTwo('green') : setStagTwo('gray')
          notes ? setStagThree('green') : setStagThree('gray')
          break
        case 'Not Affected':
          setStagOne('green')
          setStagCustom('gray')
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
          setStagCustom('gray')
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

  const handleStatusChange = (selectedItem) => {
    const { value, label } = selectedItem
    const status = label
    status === 'Not Affected' && !id ? setUpstream(true) : setUpstream(false)
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

  const handleResponseChange = (selectedItem) => {
    const { value, label } = selectedItem
    const title = label
    setResponse(value)
    setResponseTitle(title)
  }

  const handleJustifyChange = (selectedItem) => {
    const { value } = selectedItem
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
    (statusTitle === '' && formValues && formValues[fieldOne?.id] === '') ||
    responseTitle === 'Update'

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

  const statusOptions = allVexStatus
    ? [
        { label: '-- Select Status --', value: '' },
        ...allVexStatus.vexStatuses.map((st) => ({
          value: st.id,
          label: st.name
        }))
      ]
    : [{ label: 'No data', value: '' }]

  const justificationOptions = allVexJustify
    ? [
        { label: '-- Select --', value: '' },
        ...allVexJustify.vexJustifications.map((justify) => ({
          value: justify.id,
          label: justify.name
        }))
      ]
    : [{ label: 'No data', value: '' }]

  const responseOptions = allCdx?.cdxResponses?.length
    ? [
        { label: '-- Select --', value: '' },
        ...allCdx.cdxResponses.map((item) => ({
          value: item.id,
          label: item.name
        }))
      ]
    : [{ label: 'No data', value: '' }]

  const fixedVersionOptions = fixedVersions?.length
    ? [
        { label: '-- Select --', value: '' },
        ...fixedVersions.map((item) => ({
          value: item,
          label: item
        }))
      ]
    : [{ label: 'No data', value: '' }]

  const fieldOneOptions = fieldOne
    ? [
        { label: '-- Select --', value: '' },
        ...Array.from(
          { length: fieldOne.maxValue - fieldOne.minValue + 1 },
          (_, i) => ({
            value: String(fieldOne.minValue + i),
            label: String(fieldOne.minValue + i)
          })
        )
      ]
    : [{ label: 'No data', value: '' }]

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
      <Tag mb={4} colorScheme='blue'>
        {vulnId}
      </Tag>
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
            <FormLabel htmlFor='vexType'>Status</FormLabel>
            <LynkSelect
              id='vexType'
              name='vexType'
              value={statusOptions.find(
                (option) => option.value === statusTitle
              )}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder={'--Select Status--'}
              dropDown
            />
          </FormControl>
          {/* JUSTIFICATION */}
          {statusName === 'Not Affected' && (
            <FormControl>
              <FormLabel htmlFor='justification'>Justification</FormLabel>
              <LynkSelect
                id='justification'
                name='justification'
                value={justificationOptions.find(
                  (option) => option.value === justification
                )}
                onChange={handleJustifyChange}
                options={justificationOptions}
                dropDown
              />
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
              <FormLabel htmlFor='impactStatement'>Impact Statement</FormLabel>
              <Textarea
                type='text'
                name='impactStatement'
                rows={2}
                id='impactStatement'
                placeholder='Add impact statement'
                value={impactData}
                onChange={(e) => setImpactData(e.target.value)}
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
              <FormLabel htmlFor='actionStatement'>Action Statement</FormLabel>
              <Textarea
                rows={3}
                name='actionStatement'
                id='actionStatement'
                value={actionStatement}
                onChange={(e) => setActionStatement(e.target.value)}
                placeholder='Example: This vulnerability can be mitigate by running the application with ENV_PROTECTED enabled or turning off Notifications under settings.'
              />
            </FormControl>
          )}
          {/* RESPONSE */}
          {statusName === 'Affected' && (
            <FormControl isInvalid={responseTitle === 'Update'}>
              <FormLabel htmlFor='response'>Response</FormLabel>
              {allCdx && (
                <LynkSelect
                  id='response'
                  name='response'
                  value={responseOptions.find(
                    (option) => option.value === response
                  )}
                  onChange={handleResponseChange}
                  options={responseOptions}
                  dropDown
                />
              )}
              <FormErrorMessage>Bulk update not allowed</FormErrorMessage>
            </FormControl>
          )}
          {/* FIXED VERSION */}
          {responseTitle === 'Update' && (
            <FormControl width={'100%'} isRequired>
              <FormLabel htmlFor='fixedVersion'>Fixed Version</FormLabel>
              <LynkSelect
                id='fixedVersion'
                name='fixedVersion'
                value={fixedVersionOptions.find(
                  (option) => option.value === selectedTag
                )}
                onChange={(option) => setSelectedTag(option?.value || '')}
                options={fixedVersionOptions}
                dropDown
              />
            </FormControl>
          )}
          {/* DETAILS */}
          {statusName === 'In Triage' && (
            <FormControl>
              <FormLabel htmlFor='details'>Details</FormLabel>
              <Textarea
                rows={2}
                name='details'
                id='details'
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder='Example: The vulnerability surfaced in the reports on March 13th 3pm and has been sent to PSIRT for analysis by 7pm.'
              />
            </FormControl>
          )}
          {/* INTERNAL NOTES */}
          <FormControl>
            <FormLabel htmlFor='internalNotes'>Internal Notes</FormLabel>
            <Textarea
              rows={2}
              name='internalNotes'
              id='internalNotes'
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
                <LynkSelect
                  value={fieldOneOptions.find(
                    (opt) => opt.value === String(formValues?.[fieldOne?.id])
                  )}
                  onChange={(option) =>
                    handleChange(fieldOne?.id, option?.value || '')
                  }
                  options={fieldOneOptions}
                  dropDown
                />
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
