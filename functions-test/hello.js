// NOTE: This is for operational test

// Go to https://hogehoge--nwtgck-actions-netlify.netlify.app/.netlify/functions/hello?name=John
// (from: https://kentcdodds.com/blog/super-simple-start-to-serverless)
exports.handler = async event => {
  const subject = event.queryStringParameters.name || 'World'
  return {
    statusCode: 200,
    body: `Hello ${subject}!`,
  }
}
