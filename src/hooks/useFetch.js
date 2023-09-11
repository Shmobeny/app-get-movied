import { isRef, unref } from "vue";

async function useFetch(url, delay = false, optionsBody = false) {
  let data = null;
  let error = null;

  if ( isRef(url) ) url = unref(url);
  
  if (delay) {
    // console.log(url + " is start fetching with delay in " + delay + " ms");
    await new Promise((res) => setTimeout(res, delay));
  } else {
    console.log(url + " is start fetching without delay");
  }

  const options = {
    method: optionsBody ? 'POST' : 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNWJkNDU0OGZiMzczZjRmYTcwNmEzZjViOTg1YTU3MCIsInN1YiI6IjY0OGFmMDk1MDc2Y2U4MDBhZDcxZmQ1NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xzSHG1Oh_DZXpfU5XqFeyW8muxWgoKVJe7geF_xWdok'
    },
    body: optionsBody ? JSON.stringify(optionsBody) : null
  };

  await fetch(url, options)
    .then(res => res.json())
    .then(json => {
      data = json;
      if (data.total_pages === 0) throwCustomError(LackOfResults, 'No results.');
      if (data.page > data.total_pages) throwCustomError(OutOFRangeError, `Page must be equal to ${data.total_pages} or lower.`);
    })
    .catch(err => error = err);

  return { data, error }
}

function throwCustomError(type, msg) {
  throw new type(msg);
}

class LackOfResults extends Error {
  constructor(message) {
    super(message);
    this.type = "LackOfResults";
  }
}

class OutOFRangeError extends Error {
  constructor(message) {
    super(message);
    this.type = "OutOFRangeError";
  }
}

export default useFetch;