// TMDB API Key
var TMDBApikey = "?api_key=6c8c98b5f6e373d5ba158cd975c8e2b5";
// JQuery DOM
userInput = $("#txtUserInput");
frmSearch = $("#frmUserSearch");
accordEl = $('#accord-parent');
accordWrapper = accordEl.children("div");



// Event listener for submit from homepage
frmSearch.on('submit', function (event) {
    event.preventDefault();
    initMovieSearch();
    
});
$(document).ready(function(){
    console.log("whatever"); 


   var data = JSON.parse(localStorage.getItem('QueryResults'));

   for (i in data) {
       popMovieEl(data[i]);
   }

});




// Function to search the movie title
function initMovieSearch() {
    var TMDBEndpoint = `https://api.themoviedb.org/3/search/movie${TMDBApikey}`;
    var submitSearch = `${TMDBEndpoint}&query=${userInput.val()}`;
    fetch(submitSearch)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var handledResult = handleTMDBResponse(data);
            var runtimeDeffered = [];
            for (i in handledResult) {
                runtimeDeffered.push(fetch(getTMDBRuntimeUrl(handledResult[i].TMDBid)))
            }
            // function to handle secondary response data from TMDB for movie runtime
            Promise.all(runtimeDeffered)
                .then(function (responses) {
                    responses.forEach(function (response) {
                        response.json()
                            .then(function (data) {
                                for (i in handledResult) {
                                    if (handledResult[i].TMDBid === data.id) {
                                        handledResult[i].runtime = data.runtime;
                                    }
                                }
                            });
                    })
                })
                .finally(function () {
                    exitSearchPage(handledResult);
                });
        });
}
// function to export obj to localstorage and load results
function exitSearchPage(passedObject) {
    // console.log(JSON.stringify(passedObject))
    localStorage.setItem('QueryResults', JSON.stringify(passedObject));
    location.assign('./results.html');
    var test = JSON.parse(localStorage.getItem('QueryResults'));
    console.log(test);
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
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var linkArray = data.streamingInfo;
            for (serv in linkArray) {
                // moviesPassage[countX].streamingobj.push(serv);
                // moviesPassage[countX].streamingobj.push(linkArray[serv].us.link)
            }
        });
}

function popMovieEl(QueryResults) {

    // select image div 
    var moviePosterEl = $('.card-image');


    var resultPoster = document.createElement('img');
    resultPoster.classList.add('activator');
    resultPoster.src = "https://image.tmdb.or/t/p/original" + QueryResults.poster + ".png"; 
    moviePosterEl.append(resultPoster);

    
    // card-content div
    var resultsEl = $('.card-content');
   ; 

    // Movie title, ID, release date, rating, runtime, 
    // and summary will print inside "card-content" div

    

    var movieTitle = document.createElement('p');
    movieTitle.classList.add('activator')
    movieTitle.innerHTML = '<strong>Movie Title:</strong> ' + QueryResults.title + '<br/>';
    resultsEl.append(movieTitle);

    var movieID = document.createElement('p');
    movieID.classList.add('activator')
    movieID.innerHTML = '<strong>Movie ID:</strong> ' + QueryResults.TMDBid + '<br/>';
    resultsEl.append(movieID);
    
    var movieReleaseDate = document.createElement('p');
    movieReleaseDate.classList.add('activator')
    movieReleaseDate.innerHTML = '<strong>Release Date:</strong> ' + QueryResults.releasedate + '<br/>';
    resultsEl.append(movieReleaseDate);
    
    var movieRating = document.createElement('p');
    movieRating.classList.add('activator')
    movieRating.innerHTML = '<strong>Rating:</strong> ' + QueryResults.rating + '<br/>';
    resultsEl.append(movieRating);

    var movieRunTime = document.createElement('p');
    movieRunTime.classList.add('activator')
    movieRunTime.innerHTML = '<strong>Run Time:</strong> ' + QueryResults.runtime + '<br/>';
    resultsEl.append(movieRunTime);

    var movieSummary = document.createElement('p');
    movieSummary.classList.add('activator');
    movieSummary.innerHTML = '<strong>Summary:</strong> ' + QueryResults.summary + '<br/>';
    resultsEl.append(movieSummary);

    accordWrapper.append(resultsEl); 



    

}


    // eventlistener for second click "activator" that initiates second fetch call for streaming results
    // on accordian card

    // $('.activator').click(function displayStreams() {
    //     var streamEl = $('.card-reveal');
        
    //     var availableApp = document.createElement('p');
    //     availableApp.innerHTML = '<strong>Streaming on:</strong> ' + QueryResults.streaminginfo + '<br/>';
    //     streamEl.append(availableApp);

    //     var appURL = document.createElement('a');
    // appURL.innerHTML =  '<strong>Click here:</strong> ' + QueryResults.URL + '<br/>';
    //     streamEl.append(appURL);

    // }); 

    

 
    



    


