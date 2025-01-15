export const errorMapping = {
  'ProjectGroup not created': 'A product with the same name already exists.',
  'ProjectGroup not updated': 'A product with the same name already exists.',
  'Project not created': 'An environment with the same name already exists.'
}

export const displayErrorMessage = (status_code, message) => {
  if (status_code === 200 || status_code === 400) {
    return message
  } else if (status_code === 401) {
    return 'You are not authorized to view this page.'
  } else if (status_code === 403) {
    return 'You are forbidden to view this page.'
  } else if (status_code === 404) {
    return 'The request page was not found.'
  } else if (status_code === 405) {
    return 'The requested method is not allowed.'
  } else {
    return 'An internal error occured. Please retry later.'
  }
}
