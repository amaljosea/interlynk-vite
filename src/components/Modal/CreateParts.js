import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import {
  capitalizeFirstLetter,
  envOrderList,
  isDefaultEnv,
  truncatedValue
} from 'utils'
import LabelSelect from 'views/Dashboard/Analytics/Selects/LabelSelect'

import { FormControl, FormLabel, Stack } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { usePartsContext } from 'hooks/usePartsContext'
import { useSelect } from 'hooks/useSelect'

import { SbomPartCreate } from 'graphQL/Mutation'
import {
  CheckDeepParts,
  GetProject,
  GetProjectGroups,
  GetSbomParts
} from 'graphQL/Queries'

import { BiLayerPlus } from 'react-icons/bi'

//Function to find the array to be displayed for versions option, filters out already added version from current env
function getActualVersion(versions = [], parts = []) {
  if (!Array.isArray(versions) || !Array.isArray(parts)) {
    return []
  }
  const partIds = parts.map((part) => part.partId)

  const actualVersions = versions.filter(
    (version) => !partIds.includes(version.value)
  )
  return actualVersions
}

const CreateParts = ({ parts, isOpen, onClose }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const prodId = params.productid
  const productGrpId = params.productgroupid
  const partsContext = usePartsContext()
  const { style } = useSelect('lynkSelect')

  const { prodState, dispatch } = useGlobalState()
  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [envList, setEnvList] = useState([])
  const [label, setLabel] = useState(null)
  const [selectedGrpName, setSelectedGrpName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState({})

  const [createSbomPart, { loading }] = useMutation(SbomPartCreate)

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectGroup = (item) => {
    const value = item.id
    setSelectedGrpName(item.name)
    setSelectedGroup(item)
    if (value !== '') {
      setSelectedProd('')
      setSelectedVersion('')
      const activeGroup = item
      const productList =
        activeGroup &&
        activeGroup.projects
          .filter((item) => item.enabled === true)
          .map((option) => ({
            value: option.id,
            label: option.name
          }))
      setEnvList(productList)
    } else {
      setSelectedGroup({})
      setSelectedProd('')
      setSelectedVersion('')
      setSelectedGrpName('')
      setEnvList([])
    }
  }

  const { lazyDropDownProps } = useLazyDropDown(GetProjectGroups, {
    skip: isOpen ? false : true,
    selector: 'organization.projectGroups',
    variables: {
      labelIds: label ? [label?.value] : undefined,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction,
      first: 5
    },
    selectorForActualCount: 'organization.projectGroups',
    styles: style,
    selectedItem: selectedGroup?.id ? selectedGrpName : '--Select--',
    onChange: handleSelectGroup,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: CustomDropdownIndicator
    },
    optionLabel: 'name'
  })

  const { defaultOptions, nodes, isLoading } = lazyDropDownProps

  const { data: partsData } = useQuery(GetSbomParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  // GET SBOM PARTS
  const { data: deep } = useQuery(CheckDeepParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  const isExists = partsData?.sbom?.sbomParts?.some(
    (item) => item?.part?.project?.id === prodId && item?.part?.id === sbomId
  )

  const existingNodes = deep?.sbom?.deepParts?.some(
    (item) => item?.id === sbomId
  )

  const handleChange = (value) => {
    setLabel(value)
    setSelectedGroup({})
    setSelectedProd('')
    setSelectedVersion('')
    setSelectedGrpName('')
    setEnvList([])
  }

  const getSbomVersions = () => {
    if (!selectedGroup) {
      return []
    }

    if (!selectedProd) {
      return []
    }

    const activeEnv = selectedGroup?.projects?.find(
      (item) => item.id === selectedProd
    )

    const allSboms = activeEnv?.sboms

    const allowedSboms = allSboms?.filter((item) => {
      const previousUrls = partsContext.parts.map((i) => i.url)
      const allUrl = [...previousUrls, location.pathname]
      const urlHasId = allUrl.find((url) => url.includes(item.id))
      return !urlHasId
    })

    return allowedSboms?.map((sbom) => ({
      label: sbom?.projectVersion,
      value: sbom?.id,
      creationAt: sbom?.createdAt
    }))
  }

  const sbomVersions = getSbomVersions()
  const versionsActual = getActualVersion(sbomVersions, parts)
  //Filters out currently selected project so that sbom from same project is not added as parts
  const projectsActual = defaultOptions?.filter(
    (project) => project.id !== productGrpId
  )

  //Checks if any product is available after applying the labels
  const isProductAvailable = !(
    label !== null &&
    (nodes?.length === 0 ||
      (nodes?.length === 1 && nodes[0]?.id === productGrpId))
  )

  const handleSelectProduct = (e) => {
    const value = e.value
    setSelectedProd(value)
    setSelectedVersion('')
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: { id: value }
      })
    }
  }

  const handleSubmit = async () => {
    await createSbomPart({
      variables: { parentSbomId: sbomId, partSbomId: selectedVersion }
    })
      .then((res) => {
        if (res.data) {
          prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
          prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
        }
      })
      .finally(() => {
        setSelectedGroup({})
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  const envOptions =
    envList?.length > 0 &&
    envOrderList(envList).map((item) => {
      return {
        value: item.value,
        label: isDefaultEnv(item.label)
          ? capitalizeFirstLetter(item.label)
          : item.label
      }
    })

  const versionsOptions =
    versionsActual &&
    versionsActual?.map((version) => {
      return {
        value: version.value,
        label: truncatedValue(version?.label, 30)
      }
    })

  const envLabel =
    selectedProd && envOptions
      ? envOptions.find((option) => option.value === selectedProd)?.label
      : '--Select--'

  const versionLabel =
    selectedVersion && versionsActual
      ? versionsActual.find((version) => version.value === selectedVersion)
          ?.label
      : '--Select--'

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText='Add'
      onClose={onClose}
      Icon={BiLayerPlus}
      title={'Add Parts'}
      isLoading={loading}
      onSubmit={handleSubmit}
      disabled={
        isExists === true ||
        existingNodes === true ||
        versionLabel === '--Select--' ||
        sbomVersions?.length === 0
      }
    >
      <Stack spacing={4} direction={'column'} gap={2}>
        {/* LABEL */}
        <LabelSelect
          value={label}
          onChange={(value) => {
            handleChange(value)
          }}
        />
        {/* PROJECTS */}
        <FormControl fontSize={'sm'} isRequired>
          <FormLabel htmlFor='groups'>Product</FormLabel>
          {isProductAvailable ? (
            <AsyncSelect
              {...{
                ...lazyDropDownProps,
                defaultOptions: projectsActual, // Override defaultOptions
                isDisabled: isLoading,
                value: null,
                styles: style,
                id: 'part_groups'
              }}
            />
          ) : (
            <LynkAlert
              status='info'
              msg='No Products available for the selected Label'
            />
          )}
        </FormControl>
        {/* ENVIRONMENTS */}
        {isProductAvailable && (
          <FormControl fontSize={'sm'} isRequired>
            <FormLabel htmlFor='products'>Environment</FormLabel>
            <LynkSelect
              id='part_products'
              name='products'
              placeholder={envLabel || '--Select--'}
              value={envLabel}
              options={envOptions}
              onChange={handleSelectProduct}
              isSearchable={false}
              isDisabled={!selectedGroup?.id}
              dropDown={true}
            />
          </FormControl>
        )}
        {/* Version */}
        {isProductAvailable && (
          <FormControl fontSize={'sm'} isRequired>
            <FormLabel htmlFor='versions'>Version</FormLabel>
            {versionsActual?.length === 0 && sbomVersions?.length > 0 ? (
              <LynkAlert
                status='info'
                msg='All available versions from this project have already been added.'
              />
            ) : sbomVersions?.length === 0 && selectedProd !== '' ? (
              <LynkAlert status='info' msg='No versions available.' />
            ) : (
              <LynkSelect
                id='part_versions'
                name='version'
                value={versionLabel}
                placeholder={versionLabel || '--Select--'}
                options={versionsOptions}
                onChange={(e) => setSelectedVersion(e.value)}
                isSearchable={false}
                isDisabled={!selectedGroup?.id}
                dropDown={true}
              />
            )}
          </FormControl>
        )}
        {(isExists === true || existingNodes) && (
          <LynkAlert msg='Same version already exists inside selected SBOM' />
        )}
      </Stack>
    </LynkModal>
  )
}

export default CreateParts
