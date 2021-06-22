function resultSign(errorIndex, errorMsg, host, meta) {
  const result = {
    code: 0,
    errorIndex,
    errorMsg,
    host,
    meta,
  };
  return result;
}
function resultSignQuick(meta) {
  const result = {
    code: 0,
    errorIndex: -1,
    errorMsg: null,
    host: "http://localhost:43927/api/store/upload/fuckwoc",
    meta,
  };
  return result;
}
module.exports = { resultSign, resultSignQuick };
