type film = {
    filmId: number,
    title: string,
    releaseDate: string,

}

type filmFull = {
    directorId: number,
    description: string,
    runtime: number
} & film

type filmReturn = {
    films: film[],
    count: number
}

type genre = {
    genreId: number,
    name: string
}

type review = {
    reviewerId: number,
    rating: number,
    review: string,
    reviewerFirstName: string,
    reviewerLastName: string
}

type filmSearchQuery = {
    q?: string,
    sortBy?: string
    count?: number,
    startIndex?: number
}