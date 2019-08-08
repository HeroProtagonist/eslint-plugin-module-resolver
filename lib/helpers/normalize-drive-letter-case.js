// Fix for inconsisten case for drive letters on Windows
// See https://github.com/nodejs/node/issues/6624 and https://github.com/microsoft/vscode/issues/45760
// Found that __dirname would be:
// - UPPERCASE if .eslintrc in project root
// - lowercase if .eslintrc in sub directory
const normalizeDriveLetterCase = pathname => {
  if (!pathname || process.platform !== "win32") {
    return pathname
  }
  // Convert drive letter to UPPERCASE for consistency.
  return pathname.replace(/([a-z]:\\)(.*)/i, (match, p1, p2) => {
    if (p1 && p2) {
      return `${p1.toUpperCase()}${p2}`
    }
    return match;
  })
}

module.exports = normalizeDriveLetterCase