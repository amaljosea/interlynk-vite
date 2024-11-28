import { useLazyQuery, useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { validateCpe } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Select,
  Stack,
  Tag,
  Text,
  Textarea
} from '@chakra-ui/react'

import CpeInput from 'components/CpeInput'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { AutomationRuleCreate, UpdateComponent } from 'graphQL/Mutation'
import { CpeAutoComplete } from 'graphQL/Queries'

const CpeModal = ({ isOpen, onClose, activeRow, ruleExists, recheck }) => {
  const { status, component } = activeRow || ''
  const { name: compName, version: compVersion, cpes } = component || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''
  const resolved = status === 'resolved'
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid
  const navigate = useNavigate()
  const { isFreeTier } = useGlobalQueryContext()

  const [getCpe] = useLazyQuery(CpeAutoComplete)

  const [value, setValue] = useState('cpe:2.3:::::*:*:*:*:*:*:*')
  const [cpeData, setCpeData] = useState({
    part: '',
    vendor: '',
    product: '',
    cpeVersion: '',
    update: '',
    edition: '',
    language: '',
    swEdition: '',
    targetSoftware: '',
    targetHardware: '',
    other: ''
  })

  const vendorRef = useRef()
  const productRef = useRef()
  const versionRef = useRef()
  const [error, setError] = useState('')
  const [vendorList, setVendorList] = useState([])
  const [productList, setProductList] = useState([])
  const [versionList, setVersionList] = useState([])

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const isInvalid =
    cpeData?.part === '' ||
    cpeData?.vendor === '' ||
    cpeData?.product === '' ||
    cpeData?.cpeVersion === ''

  const [updateComponent, { loading }] = useMutation(UpdateComponent, {
    onCompleted: () => recheck()
  })

  // ON CPE UPDATE
  const handleComUpdate = () => {
    if (resolved) {
      onClose()
    } else {
      if (validateCpe(value)) {
        updateComponent({
          variables: {
            id: component?.id,
            sbomId: sbomId,
            cpes: [value]
          }
        }).then((res) => res?.data && onClose())
      } else {
        setError('Invalid CPE')
      }
    }
  }

  // ON VENDOR INPUT CHANGE
  const onVendorInputChange = (event) => {
    const { value } = event.target
    setCpeData((prev) => ({ ...prev, vendor: value }))
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !value.includes(':')) {
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                vendor: val
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVendorList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON PRODUCT INPUT CHANGE
  const onProductInputChange = (event) => {
    const { value } = event.target
    setCpeData((prev) => ({ ...prev, product: value }))
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                product: val
              },
              hints: {
                cpe: {
                  vendor: cpeData?.vendor
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setProductList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  // ON VERSION INPUT CHANGE
  const onVersionInputChange = (event) => {
    const { value } = event.target
    setCpeData((prev) => ({ ...prev, cpeVersion: value }))
    const val = value.replace(/\s/g, '')
    if (!val.includes('*') && !val.includes(':')) {
      if (val !== '') {
        getCpe({
          variables: {
            input: {
              idType: 'cpe',
              ecosystem: 'cpe',
              search: {
                version: val
              },
              hints: {
                cpe: {
                  vendor: cpeData?.vendor,
                  product: cpeData?.product
                }
              }
            }
          }
        }).then((res) => {
          if (res.data) {
            setVersionList(res.data.idAutoComplete.result)
          }
        })
      }
    }
  }

  const [createRule, { loading: ruleLoading }] =
    useMutation(AutomationRuleCreate)

  const conditionsAttributes = [
    {
      subject: 'component',
      operator: 'is',
      field: 'component_name',
      value: component?.name
    },
    {
      subject: 'component',
      operator: 'is',
      field: 'component_version',
      value: component?.version
    },
    {
      subject: 'component',
      operator: 'not_exists',
      field: 'component_cpe',
      value: undefined
    }
  ]

  const filterConditions = conditionsAttributes?.filter(
    (item) => item?.field !== 'component_cpe'
  )

  const actionsAttributes = [
    {
      subject: 'component',
      field: 'component_cpe',
      value: value || ''
    }
  ]

  const { AUTOMATION_RULES } = ProductDetailsTabs

  const link = generateProductDetailPageUrlFromCurrentUrl({
    paramsObj: {
      tab: AUTOMATION_RULES
    }
  })

  const handleRuleCreate = () => {
    if (ruleExists) {
      navigate(link)
    } else {
      createRule({
        variables: {
          active: true,
          name: shortDesc,
          projectId: productId,
          checkComponent: compName,
          checkVersion: compVersion,
          checkIdentifier: friendlyId,
          automationConditionsAttributes:
            shortDesc === 'Component has a cpe'
              ? conditionsAttributes
              : filterConditions,
          automationActionsAttributes: actionsAttributes
        }
      }).then((res) => {
        const errors = res?.data?.automationRuleCreate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          handleComUpdate()
        }
      })
    }
  }

  const handleInputChange = (field, value) => {
    setCpeData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputBlur = (index, val) => {
    const cpeParts = value?.split(':')
    cpeParts[index] = val === '' ? '*' : val
    const cpe = cpeParts.join(':')
    setValue(cpe)
  }

  // UPDATE FIELDS DATA FROM API
  useEffect(() => {
    if (cpes?.length > 0) {
      setValue(cpes[0])
      if (validateCpe(cpes[0])) {
        const allowedValues = ['a', 'h', 'o', 'A', 'H', 'O']
        const components = cpes[0]?.split(':')
        const isValid =
          components[2] && allowedValues.includes(components[2].toLowerCase())
        setCpeData((prev) => ({
          ...prev,
          part: isValid ? components[2].toLowerCase() : '',
          vendor: components[3]?.replace(/\*/g, '') || '',
          product: components[4]?.replace(/\*/g, '') || '',
          cpeVersion: components[5]?.replace(/\*/g, '') || '',
          update: components[6]?.replace(/\*/g, '') || '',
          edition: components[7]?.replace(/\*/g, '') || '',
          language: components[8]?.replace(/\*/g, '') || '',
          swEdition: components[9]?.replace(/\*/g, '') || '',
          targetSoftware: components[10]?.replace(/\*/g, '') || '',
          targetHardware: components[11]?.replace(/\*/g, '') || '',
          other: components[12]?.replace(/\*/g, '') || ''
        }))
      } else {
        setError('Invalid CPE')
      }
    }
  }, [cpes])

  return (
    <>
      <LynkModal
        Icon={InfoIcon}
        isOpen={isOpen}
        onClose={onClose}
        title={'CPE Details'}
        onSubmit={handleComUpdate}
        disabled={isInvalid || loading}
        hidden={status === 'resolved'}
        buttonText={'Save'}
        leftFooterContent={
          !isFreeTier && (
            <Button
              variant='ghost'
              mr={'auto'}
              fontSize={'sm'}
              onClick={handleRuleCreate}
              hidden={friendlyId ? false : true}
              title={`${ruleExists ? 'View' : 'Save as'} Rule`}
              isDisabled={ruleLoading || loading || isInvalid}
              colorScheme={ruleExists ? 'green' : 'blue'}
            >
              {ruleExists ? 'View' : 'Save as'} Rule
            </Button>
          )
        }
      >
        {component && (
          <Flex
            width='100%'
            direction={'row'}
            alignItems={'center'}
            justifyContent={'flex-start'}
            wrap={'wrap'}
            gap={2}
            mb={6}
          >
            <Text wordBreak={'break-all'}>{component?.name || ''}</Text>
            <Tag colorScheme='blue'>{component?.version || '-'}</Tag>
          </Flex>
        )}
        <Flex width={'100%'} direction={'column'} gap={4}>
          {error !== '' && <LynkAlert msg={error} />}
          {/* CPE STRING */}
          <FormControl isDisabled={resolved}>
            <FormLabel fontSize={12} htmlFor='cpe'>
              CPE String
            </FormLabel>
            <Textarea
              type='text'
              variant='outline'
              name='cpe'
              id='cpe'
              mt={1.5}
              fontSize='16px'
              fontStyle={'bold'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled
            />
          </FormControl>
          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            {/* PART */}
            <FormControl isDisabled={resolved}>
              <FormLabel htmlFor='type'>Part</FormLabel>
              <Select
                size='md'
                name='part'
                fontSize={'sm'}
                value={cpeData?.part}
                onBlur={(e) => handleInputBlur(2, e.target.value)}
                onChange={(e) => handleInputChange('part', e.target.value)}
              >
                <option value=''>-- Select --</option>
                <option value='a'>Application</option>
                <option value='o'>Operating System</option>
                <option value='h'>Hardware</option>
              </Select>
            </FormControl>
            {/* VENDOR */}
            <CpeInput
              name='vendor'
              string={value}
              setString={setValue}
              isDisabled={resolved}
              inputValue={cpeData?.vendor}
              setInputValue={setCpeData}
              cpeList={vendorList}
              setCpeList={setVendorList}
              inputRef={vendorRef}
              validation={false}
              onChange={onVendorInputChange}
            />
            {/* PRODUCT */}
            <CpeInput
              name='product'
              string={value}
              setString={setValue}
              isDisabled={resolved}
              inputValue={cpeData?.product}
              setInputValue={setCpeData}
              cpeList={productList}
              setCpeList={setProductList}
              inputRef={productRef}
              validation={false}
              onChange={onProductInputChange}
            />
            {/* VERSION */}
            <CpeInput
              name='cpeVersion'
              string={value}
              setString={setValue}
              isDisabled={resolved}
              inputValue={cpeData?.cpeVersion}
              setInputValue={setCpeData}
              cpeList={versionList}
              setCpeList={setVersionList}
              inputRef={versionRef}
              validation={false}
              onChange={onVersionInputChange}
            />
            {/* UPDATE */}
            <FormControl isDisabled={resolved}>
              <FormLabel>Update</FormLabel>
              <Input
                size='md'
                type='text'
                name='update'
                fontSize={'sm'}
                value={cpeData?.update}
                placeholder='Enter update'
                onBlur={(e) => handleInputBlur(6, e.target.value)}
                onChange={(e) => handleInputChange('update', e.target.value)}
              />
            </FormControl>
            {/* EDITION */}
            <FormControl isDisabled={resolved}>
              <FormLabel>Edition</FormLabel>
              <Input
                type='text'
                size='md'
                fontSize={'sm'}
                value={cpeData?.edition}
                placeholder='Enter edition'
                onBlur={(e) => handleInputBlur(7, e.target.value)}
                onChange={(e) => handleInputChange('edition', e.target.value)}
              />
            </FormControl>
            {/* LANGUAGE */}
            <FormControl isDisabled={resolved}>
              <FormLabel>Language</FormLabel>
              <Input
                type='text'
                size='md'
                fontSize={'sm'}
                value={cpeData?.language}
                placeholder='Enter language'
                onBlur={(e) => handleInputBlur(8, e.target.value)}
                onChange={(e) => handleInputChange('language', e.target.value)}
              />
            </FormControl>
            {/* SW EDITION */}
            <FormControl isDisabled={resolved}>
              <FormLabel>SW Edition</FormLabel>
              <Input
                type='text'
                size='md'
                fontSize={'sm'}
                value={cpeData?.swEdition}
                placeholder='Enter sw edition'
                onBlur={(e) => handleInputBlur(9, e.target.value)}
                onChange={(e) => handleInputChange('swEdition', e.target.value)}
              />
            </FormControl>
            {/* TARGET SOFTWARE */}
            <FormControl isDisabled={resolved}>
              <FormLabel>Target Software</FormLabel>
              <Input
                size='md'
                type='text'
                fontSize={'sm'}
                value={cpeData?.targetSoftware}
                placeholder='Enter target software'
                onBlur={(e) => handleInputBlur(10, e.target.value)}
                onChange={(e) =>
                  handleInputChange('targetSoftware', e.target.value)
                }
              />
            </FormControl>
            {/* TARGET HARDWARE */}
            <FormControl isDisabled={resolved}>
              <FormLabel htmlFor='targetHardware'>Target Hardware</FormLabel>
              <Stack direction='column' spacing={1}>
                <Select
                  size='md'
                  fontSize={'sm'}
                  name='targetHardware'
                  value={cpeData?.targetHardware}
                  onBlur={(e) => handleInputBlur(11, e.target.value)}
                  onChange={(e) =>
                    handleInputChange('targetHardware', e.target.value)
                  }
                >
                  <option value=''>-- Select --</option>
                  <option value='x64'>x64</option>
                  <option value='x86'>x86</option>
                  <option value='x32'>x32</option>
                  <option value='arm64'>arm64</option>
                  <option value='amd64'>amd64</option>
                  <option value='itanium'>itanium</option>
                  <option value='arm'>arm</option>
                  <option value='rj45'>rj45</option>
                  <option value='iphone'>iphone</option>
                  <option value='android'>android</option>
                  <option value='*'>*</option>
                </Select>
              </Stack>
            </FormControl>
            {/* OTHERE */}
            <FormControl isDisabled={resolved}>
              <FormLabel>Other</FormLabel>
              <Input
                size='md'
                type='text'
                fontSize={'sm'}
                value={cpeData?.other}
                placeholder='Enter other'
                onBlur={(e) => handleInputBlur(12, e.target.value)}
                onChange={(e) => handleInputChange('other', e.target.value)}
              />
            </FormControl>
          </Grid>
        </Flex>
      </LynkModal>
    </>
  )
}

export default CpeModal
