// ###############################################################################################################
// HATEOASInfoExtractor
// ###############################################################################################################
export default {
  getLinksFor: getLinksFor
}

function getLinksFor (text, operations) {
  if (text.charAt(0) === '{') return getJSONLinksFor(text, operations)
  else if (text.indexOf('<?xml') === 0) return getXMLLinksFor(text)
  // throw new Error('TEXT FORMAT NOT SUPPORTED: ', text.substring(0, 20), '...')
  return []
}

function getJSONLinksFor (text, operations) {
  const linkRegEx = /(https?:\/\/.*)('|")/i
  const lines = text.split('\n')
  return getLinks(lines, linkRegEx)
    .map(toHATEOASInfo)
    .filter(info => info.valid)

  function getLinks (lines, linkMatcher) {
    return lines.map((line, lineIdx) => ({ line, lineIdx, lineNo: lineIdx }))
      .filter(lineInfo => linkMatcher.test(lineInfo.line))
  }

  function toHATEOASInfo (lineInfo) {
    const href = linkRegEx.exec(lineInfo.line)[1]
    var info = {
      valid: true,
      line: lineInfo.line,
      lineNo: lineInfo.lineNo,

      href: href,
      rel: '',
      method: 'GET',

      operationId: 0,
      operationSummary: '',
      pathParameters: [],
      bodyParameter: '',
      bodyContentType: 'json'
    }

    const ops = operations

    const operationsList = ops.filter(op => {
      let specUrl = op.spec.url
      const rex = specUrl.replace(/{([^}]+)}/g, '(.*)')
      const regex = new RegExp(rex)
      const success = regex.test(info.href)
      return success
    })

    let op = null
    if (operationsList.length > 1) {
      operationsList.sort((o1, o2) => o2.spec.url.length - o1.spec.url.length)
    }
    op = operationsList.length > 0 ? operationsList[0] : null

    if (op) {
      info.operationId = op.id
      info.operationSummary = op.spec.summary
      info.valid = true
    }

    return info
  }
}

function getXMLLinksFor (text) {
  throw new Error('XML LINKS LOADER NOT IMPLEMENTED')
}
