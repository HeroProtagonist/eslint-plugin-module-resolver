function isAliasPath(resolvedPath, aliasPath) {
  // Prevent replacing the path mid-word
  return resolvedPath.endsWith(aliasPath) ||
    resolvedPath.includes(`${aliasPath}/`);
}

module.exports = isAliasPath;
