const apiKey = '1af43621cda4ee8cf53386df4c12ea30';
const apiReadAccessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYWY0MzYyMWNkYTRlZThjZjUzMzg2ZGY0YzEyZWEzMCIsIm5iZiI6MTcyNDU5NDI3Mi4yMTYzNywic3ViIjoiNjZhNWQ2ZjNlYzkyNTlmOWMxMzAyMmIyIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.R-bETao2Pa1XChXfCnBzFLykOgrw8-yuapLBCgQHpls';
const apiBaseUrl = 'https://api.themoviedb.org/3';

let currentPage = 1;
const resultsPerPage = 10;

// Utility function to build image URL
function buildImageUrl(path) {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'placeholder-image-url';
}

// Function to fetch trailers
function fetchTrailer(movieId) {
    return fetch(`${apiBaseUrl}/movie/${movieId}/videos`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const trailer = data.results.find(video => video.type === 'Trailer');
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    })
    .catch(error => {
        console.error('Error fetching trailer:', error);
        return null;
    });
}

// Function to display results
async function displayResults(results) {
    const container = document.getElementById('trending-movies');
    container.innerHTML = ''; // Clear previous results

    for (const result of results) {
        const posterFrame = document.createElement('div');
        posterFrame.className = 'poster-frame';

        const posterImage = document.createElement('img');
        posterImage.className = 'poster-image';
        posterImage.src = buildImageUrl(result.poster_path || result.profile_path);
        posterImage.alt = result.title || result.name;

        const movieName = document.createElement('div');
        movieName.className = 'movie-name';
        movieName.textContent = result.title || result.name;

        const movieRating = document.createElement('div');
        movieRating.className = 'movie-rating';
        movieRating.textContent = `Rating: ${result.vote_average || 'N/A'}`;

        const trailerButton = document.createElement('button');
        trailerButton.className = 'trailer-button';
        trailerButton.innerHTML = '<i class="fas fa-play"></i> Watch Trailer';
        trailerButton.onclick = async () => {
            const trailerUrl = await fetchTrailer(result.id);
            if (trailerUrl) {
                window.open(trailerUrl, '_blank');
            } else {
                alert('Trailer not available.');
            }
        };

        posterFrame.appendChild(posterImage);
        posterFrame.appendChild(movieName);
        posterFrame.appendChild(movieRating);
        posterFrame.appendChild(trailerButton);

        container.appendChild(posterFrame);
    }
}

// Function to fetch trending movies
function fetchTrending(period) {
    fetch(`${apiBaseUrl}/trending/all/${period}?page=${currentPage}`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data.results);
        if (data.results.length > 0) {
            document.getElementById('load-more-btn').style.display = 'block';
        } else {
            document.getElementById('load-more-btn').style.display = 'none';
        }
    })
    .catch(error => console.error('Error fetching trending movies:', error));
}

// Function to load more movies
function loadMoreMovies() {
    currentPage++;
    const period = getCurrentPeriod(); 
    fetchTrending(period);
}

// Function to get the current period (e.g., from the period toggle buttons)
function getCurrentPeriod() {
    const activeButton = document.querySelector('.period-toggle button.active');
    return activeButton ? activeButton.dataset.period : 'day';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${apiBaseUrl}/genre/movie/list?language=en-US`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => populateGenres(data.genres))
    .catch(error => console.error('Error fetching genres:', error));

    populateYears();

    fetchTrending('day');
});

// Function to fetch movies
function fetchMovies() {
    fetch(`${apiBaseUrl}/discover/movie?sort_by=popularity.desc`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.results))
    .catch(error => console.error('Error fetching movies:', error));
}

// Function to fetch TV shows
function fetchTVShows() {
    fetch(`${apiBaseUrl}/discover/tv?sort_by=popularity.desc`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.results))
    .catch(error => console.error('Error fetching TV shows:', error));
}

// Function to fetch popular people
function fetchPeople() {
    fetch(`${apiBaseUrl}/person/popular`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.results))
    .catch(error => console.error('Error fetching people:', error));
}

// Function to fetch movies by genre
function fetchMoviesByGenre(genreId) {
    fetch(`${apiBaseUrl}/discover/movie?with_genres=${genreId}`, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.results))
    .catch(error => console.error('Error fetching movies by genre:', error));
}

// Function to search
function search() {
    const query = document.getElementById('search-input').value;
    if (query) {
        fetch(`${apiBaseUrl}/search/multi?query=${query}`, {
            headers: {
                Authorization: `Bearer ${apiReadAccessToken}`
            }
        })
        .then(response => response.json())
        .then(data => displayResults(data.results))
        .catch(error => console.error('Error searching:', error));
    }
}

// Function to apply filters
function applyFilters() {
    const genre = document.getElementById('genre-select').value;
    const year = document.getElementById('year-select').value;
    const rating = document.getElementById('rating-select').value;

    let url = `${apiBaseUrl}/discover/movie?language=en-US`;

    if (genre) url += `&with_genres=${genre}`;
    if (year) url += `&year=${year}`;
    if (rating) url += `&vote_average.gte=${rating}`;

    fetch(url, {
        headers: {
            Authorization: `Bearer ${apiReadAccessToken}`
        }
    })
    .then(response => response.json())
    .then(data => displayResults(data.results))
    .catch(error => console.error('Error applying filters:', error));
}

// Function to populate genres
function populateGenres(genres) {
    const genreSelect = document.getElementById('genre-select');
    genreSelect.innerHTML = '<option value="">All</option>';

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });
}

// Function to populate years
function populateYears() {
    const yearSelect = document.getElementById('year-select');
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Event listener for "Load More" button
document.getElementById('load-more-btn').addEventListener('click', loadMoreMovies);
