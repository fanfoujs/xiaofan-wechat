const oauthSignature = require('../modules/oauth-signature/index')

oauthSignature.generate = function (httpMethod, url, parameters, consumerSecret, tokenSecret, options) {
  url = url.replace('https', 'http')
  const signatureBaseString = new oauthSignature.SignatureBaseString(httpMethod, url, parameters).generate()
  const {encodeSignature = true} = options || {}
  return new oauthSignature.HmacSha1Signature(signatureBaseString, consumerSecret, tokenSecret).generate(encodeSignature)
}

module.exports = oauthSignature
