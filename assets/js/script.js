// TMDB API Key
var TMDBApikey = "?api_key=6c8c98b5f6e373d5ba158cd975c8e2b5";
// JQuery DOM
userInput = $("#txtUserInput");
frmSearch = $("#frmUserSearch");
accordEl = $('#accord-parent');
// Event listener for accordion click
accordEl.on('click', function(event) {
    var listEL = $(event.target).parent('li');
    var movieID = listEL.attr('id');
    var streamingServices = SAvailValidation(movieID);
    SAvailDisplay(movieID, streamingServices, listEL);
});
// Event listener for submit from homepage
frmSearch.on('submit', function(event) {
    event.preventDefault();
    initMovieSearch();
});
// Event listener to populate elements on the page
$(document).ready(function() {
    if (location.pathname === '/results.html') {
        $('.collapsible').collapsible();
        var data = JSON.parse(localStorage.getItem('QueryResults'));
        console.log(data);
        data.forEach(function(movieObj){popMovieEl(movieObj)});
    }
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
                    console.log(handledResult)
                    if (exitValidation(handledResult)) {exitSearchPage(handledResult);}
                });
            });
        });
    })
}
// function to validate when to exit once all of the runtimes are populated
function exitValidation(handledResult) {
    for (i in handledResult) {
        if (handledResult[i].runtime === NaN) {return false;}
    }
    return true;
}
// function to export obj to localstorage and load results
function exitSearchPage(passedObject) {
    localStorage.setItem('QueryResults', JSON.stringify(passedObject));
    location.assign('./results.html');
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
            runtime: NaN,
            services: [],
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
// function to check file if Streaming Availability data has already been fetched
function SAvailValidation(id) {
    var data = JSON.parse(localStorage.getItem('QueryResults'));
    for (i in data) {
        if(id == data[i].TMDBid) {
            if(data[i].services.length == 0){
                var streamingServices = getStreamingAvailability(id);
                data[i].services = streamingServices;
                localStorage.setItem('QueryResults', data);
            }else{
                var streamingServices = data[i].services;
            }
        }
    }
    return streamingServices;
}
// function to display the retreived Service Availability
function SAvailDisplay(id, services, element) {
    // services.forEach(function(service){
    //     var listEL = $('<li>');
    //     var streamEL = element.children('.streamingList');

    //     streamEL.append(listEL);
    // });
}
// function to get streaming availability data on request - Streaming Availability API
function getStreamingAvailabilitySAvail(id) {
    SAvailUrl = getStreamingAvailabilityUrl(id);
    var SAvailHeaderObj = {
        "method": "GET",
        "headers": {
            'x-rapidapi-key': '636ed5f6a0msh4ae99081a26f0fap14a11bjsn1412613b3561',
            'x-rapidapi-host': 'https://streaming-availability.p.rapidapi.com'
        }
    };
    fetch(SAvailUrl, SAvailHeaderObj)
        .then(function (response) {
            console.log(response)
            return response.json();
        })
        .then(function (data) {
            var services = data.streamingInfo;
            var serviceData = [];
            services.forEach(function(service) {
                serviceData.push({
                    'service': service,
                    'link': service.us.link
                });
            });
            console.log(serviceData)
        });
}
// function to get streaming availability data on request - Guidebox API
function getStreamingAvailabilityGuidebox(id) {
    SAvailUrl = getStreamingAvailabilityUrl(id);
    var SAvailHeaderObj = {
        "method": "GET",
        "headers": {
            'x-rapidapi-key': '636ed5f6a0msh4ae99081a26f0fap14a11bjsn1412613b3561',
            'x-rapidapi-host': 'https://streaming-availability.p.rapidapi.com'
        }
    };
    fetch(SAvailUrl, SAvailHeaderObj)
        .then(function (response) {
            console.log(response)
            return response.json();
        })
        .then(function (data) {
            var services = data.streamingInfo;
            var serviceData = [];
            services.forEach(function(service) {
                serviceData.push({
                    'service': service,
                    'link': service.us.link
                });
            });
            console.log(serviceData)
        });
}
// function to create accordion element for movie 
function popMovieEl(QueryResults) {
    // variable declaration
    var imgBaseUrl = "https://image.tmdb.org/t/p/original";
    // creating JQuery DOMs
    var listEL = $('<li>');
    var headerEL = $('<div>');
    var posterEL = $('<img>');
    var bodyEL = $('<div>');
    var bodytextEL = $('<span>');
    var streamingEL = $('<ul>');
    var headerContentEL = $('<div>');
    // updating element attributes and classes
    listEL.attr('id', QueryResults.TMDBid);
    streamingEL.addClass('streamingList');
    posterEL.attr({
        'src': `${imgBaseUrl}${QueryResults.poster}`,
        'alt': `Movie poster for ${QueryResults.title}`,
        'width': 100
    });
    headerEL.addClass('collapsible-header header-content');
    bodyEL.addClass('collapsible-body body-content');
    // updating text content of the elements
    headerContentEL.html(`
        <strong>Title: </strong>${QueryResults.title} <br>
        <strong>Rating: </strong>${QueryResults.rating} <br>
        <strong>Release Date: </strong>${QueryResults.releasedate} <br>
        <strong>Runtime: </strong>${QueryResults.runtime} <br>
        `);
    bodytextEL.text(QueryResults.summary);
    // append elements together and append to parent element on page
    headerEL.append(posterEL);
    headerEL.append(headerContentEL);
    bodyEL.append(bodytextEL);
    bodyEL.append(streamingEL);
    listEL.append(headerEL);
    listEL.append(bodyEL);
    accordEl.append(listEL);
}