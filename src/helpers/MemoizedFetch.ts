import { memoize } from "lodash-es";

export const memoizedFetchText = memoize(async (url) => {

  let error: any;

  try {
    const response = await fetch(url);
    if (response && response.ok) {
      let result = await response.text();
      return result;
    } else {
      error = new Error("NOT OK")
    }
  } catch (ex) {
    error = ex;    
  }

  if (error) {
    console.log(`Error while fetching ${url}: ${error}`)
  }
});
