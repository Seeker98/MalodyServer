// interface Result {
//   code: number;
//   hasMore: boolean;
//   next: number;
//   data: Array<any>;
// }
function result(hasMore, next, data) {
  const result = {
    code: 0,
    hasMore: hasMore,
    next: next,
    data: data,
  };
  return result;
}
module.exports = { result };
