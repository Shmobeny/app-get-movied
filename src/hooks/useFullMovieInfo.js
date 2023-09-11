import useFetch from "./useFetch";
import useTranslate from "./useTranslate";

async function useFullMovieInfo(movieObj, lang, checkOnlyDescription = false) {
  if (movieObj === null) return;
  
  movieObj = {...movieObj};

  let originalLangInfo = null;
  let engLangInfo = null;
  
  await checkDescription();
  
  if (checkOnlyDescription) {
    return movieObj;
  }
  
  await checkTitle();
  await checkPoster();
  
  return movieObj;

  async function checkDescription() {
    if (movieObj.overview.length !== 0) {
      // console.log("Movie already have suitable description!");
      return;
    }
      
    // console.log(`Can't find description for ${lang} localization!`);
    // console.log(`Trying original language (${movieObj.original_language})...`);
    originalLangInfo = (await useFetch(`https://api.themoviedb.org/3/movie/${movieObj.id}?language=${movieObj.original_language}`, 0)).data;

    if (originalLangInfo.overview.length !== 0) {
      // console.log(`Description found in original language (${movieObj.original_language})!`);
      movieObj.overview = useTranslate(originalLangInfo.overview, movieObj.original_language, lang)[1];
      return;
    }

    if (movieObj.original_language === 'en') {
      // console.log("Movie doesn't have description in database.");
      engLangInfo = originalLangInfo;
      movieObj.overview = false;
      return;
    }

    // console.log("Nothing in original language. Trying English now...");
    engLangInfo = (await useFetch(`https://api.themoviedb.org/3/movie/${movieObj.id}?language=en-US`, 0)).data;

    if (engLangInfo.overview.length !== 0) {
      // console.log(`Description found in English!`);
      movieObj.overview = useTranslate(engLangInfo.overview, 'en', lang)[1];
    } else {
      // console.log("Movie doesn't have description in database.");
      movieObj.overview = false;
    }
  }

  async function checkTitle() {
    if (lang === movieObj.original_language || movieObj.title !== movieObj.original_title) {
      // console.log(`Movie (${movieObj.title}) already have suitable title!`);
      return;
    }

    // console.log(`Movie (${movieObj.title}) doesn't have title for this localization (${lang})!`);
    // console.log("Alternative title will be taken from English localization");

    if (!engLangInfo) engLangInfo = (await useFetch(`https://api.themoviedb.org/3/movie/${movieObj.id}?language=en-US`, 0)).data;

    switch(movieObj.original_title === engLangInfo.title) {
      case true:
        movieObj.title = useTranslate(engLangInfo.title, movieObj.original_language, lang)[1];
        break;
      default:
        movieObj.title = useTranslate(engLangInfo.title, 'en', lang)[1];
    }
  }

  async function checkPoster() {
    if (movieObj.original_language === 'en') return;

    if (!originalLangInfo) originalLangInfo = (await useFetch(`https://api.themoviedb.org/3/movie/${movieObj.id}?language=${movieObj.original_language}`, 0)).data;

    const posterIsSuitable = originalLangInfo.poster_path !== movieObj.poster_path ? true : false;

    // console.log(`Poster have localization for ${lang}: ${posterIsSuitable}`);

    if (posterIsSuitable) return;
    
    if (!engLangInfo) engLangInfo = (await useFetch(`https://api.themoviedb.org/3/movie/${movieObj.id}?language=en-US`, 0)).data;
    
    movieObj.poster_path = engLangInfo.poster_path
  }
}

export default useFullMovieInfo;