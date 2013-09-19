module.exports = {
  IS_MODULE_EXP: /^(\/\/\s*|\#\s*|\/\*\s*)inject\s*/i,
  NOT_BOOSTRAPPED: '*|*|*', // Random(ish) string
  SUPPORTED_FILE_EXT: ['js', 'coffee']
};