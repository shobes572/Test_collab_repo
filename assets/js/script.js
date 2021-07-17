// TMDB API variables
var TMDBApikey = "?api_key=6c8c98b5f6e373d5ba158cd975c8e2b5";
var TMDBAccesspointMain = "3/search/movie";
// Streaming Availability API variables
var SAvailhost = "streaming-availability.p.rapidapi.com";
var SAvailHeaderObj = {
    "method": "GET",
    "headers": {
        'x-rapidapi-key': '636ed5f6a0msh4ae99081a26f0fap14a11bjsn1412613b3561',
        "x-rapidapi-host": SAvailhost
}};
var SAvailEndpoint = "/get/basic?country=us&tmdb_id=movie%2F";
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
        var countX = 0;
        var countY = 0;
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
                runtime: 0,
                streamingobj: []
            };
            moviesPassage.push(movieObject);
            var TMDBAccesspointMore = `3/movie/${movieObject.TMDBid}`;
            var TMDBEndpoint = `https://api.themoviedb.org/${TMDBAccesspointMore}${TMDBApikey}`;
            var serviceURL = `https://${SAvailhost}${SAvailEndpoint}${movie.id}`;
            fetch(serviceURL, SAvailHeaderObj)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                console.log(data);
                var linkArray = data.streamingInfo;
                for (serv in linkArray){
                    moviesPassage[countX].streamingobj.push(serv);
                    moviesPassage[countX].streamingobj.push(linkArray[serv].us.link)
                }
                countX++;
            });
            fetch(TMDBEndpoint)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                moviesPassage[countY].runtime = data.runtime;
                countY++;
                if (countY >= arrayLength && countX >= arrayLength) {
                    localStorage.setItem('moviePassage', JSON.stringify(moviesPassage));
                    location.assign('./results.html');
                }
            });
            // wait before next loop iteration
            var timeDelay = 1000;
            var timer = 0;
            var timeInterval = 50;
            var APIBuffer = setInterval(function() {
                timer = timer + timeInterval;
                if (timer >= timeDelay) {
                    clearInterval(APIBuffer);
                    return;
                }
            }, timeInterval);
            console.log(moment())
        }
    });
}