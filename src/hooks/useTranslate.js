export default function useTranslate(str, sourceLang, targetLang) {
  // console.log(`Translating from ${sourceLang} to ${targetLang}...`);
  
  let result = "";
  let encodedStr = encodeURI(str);
  
  var url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
      sourceLang +
      "&tl=" +
      targetLang +
      "&dt=t&q=" +
      encodedStr;
  
  let translatedItems = getJSONfromURL(url)[0];

  if (translatedItems === undefined) {
    return [false, "Something went wrong during translation."];
  }
  
  for (let i = 0; i < translatedItems.length; i++) {
    result = result + " " + translatedItems[i][0];
  }

  return [true, result];

  function getJSONfromURL(url) {
    return JSON.parse( Get(url) );
    
    function Get(url){
      var Httpreq = new XMLHttpRequest();
      Httpreq.open("GET", url, false);
      Httpreq.send(null);
      return Httpreq.responseText;          
    }
  }
}