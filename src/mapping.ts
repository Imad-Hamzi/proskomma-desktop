`{
  docSet(id:"ebible/en_web") {
  document(bookCode:"PSA") {
    web: cv(
      chapter:"51"
      verses:"2"
      ) {
      scopeLabels
      text
      items { type subType payload }
    }
    drh: mappedCv(
      mappedDocSetId:"dbl/en_drh"
      chapter:"51"
      verses:"2"
      ) {
      scopeLabels
      text
      items { type subType payload }
    }
    nav: cvNavigation(
      chapter: "51"
      verse: "2"
      ) {
      previousChapter
      previousVerse { chapter verse }
      nextVerse { chapter verse }
      nextChapter
    }
  }
}
}`
