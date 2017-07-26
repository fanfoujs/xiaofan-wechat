const oauthSignature = require('oauth-signature')

oauthSignature.generate = function (httpMethod, url, parameters, consumerSecret, tokenSecret, options) {
  url = url.replace('https', 'http')
  const signatureBaseString = new oauthSignature.SignatureBaseString(httpMethod, url, parameters).generate()
  let encodeSignature = true
  if (options) {
    encodeSignature = options.encodeSignature
  }
  return new oauthSignature.HmacSha1Signature(signatureBaseString, consumerSecret, tokenSecret).generate(encodeSignature)
}

module.exports = oauthSignature
