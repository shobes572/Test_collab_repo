// TMDB API Key
var TMDBApikey = "?api_key=6c8c98b5f6e373d5ba158cd975c8e2b5";
// JQuery DOM
userInput = $("#txtUserInput");
frmSearch = $("#frmUserSearch")
// Event listener for submit from homepage
frmSearch.on('submit', function (event) {
    event.preventDefault();
    initMovieSearch();
});


// Function to search the movie title
function initMovieSearch() {
    var TMDBEndpoint = `https://api.themoviedb.org/3/search/movie${TMDBApikey}`;
    var submitSearch = `${TMDBEndpoint}&query=${userInput.val()}`;
    fetch(submitSearch)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var handledResult = handleTMDBResponse(data);
        var runtimeDeffered = [];
        for (i in handledResult) {
            runtimeDeffered.push(fetch(getTMDBRuntimeUrl(handledResult[i].TMDBid)))
        }
        // function to handle secondary response data from TMDB for movie runtime
        Promise.all(runtimeDeffered)
        .then(function(responses){
            responses.forEach(function(response) {
                response.json()
                .then(function(data) {
                    for (i in handledResult) {
                        if (handledResult[i].TMDBid === data.id) {
                            handledResult[i].runtime = data.runtime;
                        }
                    }
                })
                .then(function() {
                    if (exitValidation(handledResult)) {exitSearchPage(handledResult);}
                });
            });
        });
    });
}
function exitValidation(handledResult) {
    for (i in handledResult) {
        if (handledResult[i].runtime === 0) {return false;}
    }
    return true;
}
// function to export obj to localstorage and load results
function exitSearchPage(passedObject) {
    localStorage.setItem('QueryResults', JSON.stringify(passedObject));
    location.assign('./results.html');
    // var test = JSON.parse(localStorage.getItem('QueryResults'));
    // console.log(test);
}
// function to handle inital response data from TMDB with list of movies
function handleTMDBResponse(data) {
    var resultsArray = data.results;
    var moviesPassage = [];
    for (i in resultsArray) {
        var movie = resultsArray[i];
        var movieObject = {
            TMDBid: movie.id,
            title: movie.title,
            summary: movie.overview,
            poster: movie.poster_path,
            rating: movie.vote_average,
            releasedate: movie.release_date,
            runtime: 0,
        };
        moviesPassage.push(movieObject);                      
    }
    return moviesPassage;
}    
// function to generate query URL for Streaming Service Availability
function getStreamingAvailabilityUrl(id) {
    return `https://streaming-availability.p.rapidapi.com/get/basic?country=us&tmdb_id=movie%2F${id}`;
}
// function to generate query URL for Additional Movie info from TMDB
function getTMDBRuntimeUrl(id) {
    return `https://api.themoviedb.org/3/movie/${id}${TMDBApikey}`;
}
// function to get streaming availability data on request
function getStreamingAvailability(id) {
    SavailUrl = getStreamingAvailabilityUrl(id);
    var SAvailHeaderObj = {
        "method": "GET",
        "headers": {
            'x-rapidapi-key': '636ed5f6a0msh4ae99081a26f0fap14a11bjsn1412613b3561',
            'x-rapidapi-host': 'https://streaming-availability.p.rapidapi.com'
        }
    };
    fetch(SavailUrl, SAvailHeaderObj)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        var linkArray = data.streamingInfo;
        for (serv in linkArray){
            // moviesPassage[countX].streamingobj.push(serv);
            // moviesPassage[countX].streamingobj.push(linkArray[serv].us.link)
        }
    });
}