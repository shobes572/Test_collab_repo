// TMDB API variables
var TMDBApikey = "?api_key=6c8c98b5f6e373d5ba158cd975c8e2b5";
var TMDBAccesspointMain = "3/search/movie";

// JQuery DOM
userInput = $("#txtUserInput");
frmSearch = $("#frmUserSearch")

// Event listener for submit from homepage
frmSearch.on('submit', function(event) {
    event.preventDefault();
    initMovieSearch();
});

// Function to search the movie title
function initMovieSearch() {
    var TMDBEndpoint = `https://api.themoviedb.org/${TMDBAccesspointMain}${TMDBApikey}`;
    var submitSearch = `${TMDBEndpoint}&query=${userInput.val()}`;
    fetch(submitSearch)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        var resultsArray = data.results;
        console.log(resultsArray);
        var arrayLength = resultsArray.length;
        var tempCounter = 0;
        var moviesPassage = [];
        for (i=0; i<arrayLength; i++) {
            var movie = resultsArray[i];
            var movieObject = {
                TMDBid: movie.id,
                title: movie.title,
                summary: movie.overview,
                poster: movie.poster_path,
                rating: movie.vote_average,
                releasedate: movie.release_date,
                runtime: 0
            };
            moviesPassage.push(movieObject);
            var TMDBAccesspointMore = `3/movie/${movieObject.TMDBid}`;
            var TMDBEndpoint = `https://api.themoviedb.org/${TMDBAccesspointMore}${TMDBApikey}`;
            fetch(TMDBEndpoint)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    moviesPassage[tempCounter].runtime = data.runtime;
                    tempCounter++;
                    if (tempCounter >= arrayLength) {
                        localStorage.setItem('moviePassage', JSON.stringify(moviesPassage));
                        location.assign('./results.html');
                    }
                })
        }
    });
}

