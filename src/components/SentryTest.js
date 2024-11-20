export const SentryTest = () => {
  return (
    // eslint-disable-next-line no-undef
    <button title='Break the world' onClick={() => methodDoesNotExist999()}>
      Break the world
    </button>
  )
}
