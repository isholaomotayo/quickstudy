import { en } from './en'

// Load each language's phrases below after importing above
const phrases = {
    en
}

export const translateCode = (code, lang='en') => {
    let phrase = phrases[lang][code] || code
    if (phrase.indexOf('::') > 0) phrase = phrase.split('::')
    
    return phrase
}