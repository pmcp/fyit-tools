export default function () {

  const collectionWithCapital = (val) => val.charAt(0).toUpperCase() + val.slice(1)
  const collectionWithCapitalSingular = (val) => collectionWithCapital(val).charAt(0).toUpperCase() + collectionWithCapital(val).slice(1).slice(0, -1)

  return {
    collectionWithCapital,
    collectionWithCapitalSingular
  }
}