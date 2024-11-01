import { config } from "../config.js";

export class MovieDetails {
    constructor() {
        this.movieDetails = document.getElementById("movieDetails");
        this.movieId = new URLSearchParams(window.location.search).get("id");

        if (this.movieId) {
            this.loadMovieDetails();
        }
    }

    async loadMovieDetails() {
        try {
            const [movieData, credits, videos] = await Promise.all([
                this.fetchMovieDetails(),
                this.fetchMovieCredits(),
                this.fetchMovieVideos()
            ]);

            this.displayMovieDetails(movieData, credits, videos);
        } catch (error) {
            console.error("Error loading movie details:", error);
            this.displayError("Failed to load movie details");
        }
    }

    async fetchMovieDetails() {
        const response = await fetch(
            `${config.baseUrl}/movie/${this.movieId}?api_key=${config.apiKey}&language=en-US`
        );
        return response.json();
    }

    async fetchMovieCredits() {
        const response = await fetch(
            `${config.baseUrl}/movie/${this.movieId}/credits?api_key=${config.apiKey}`
        );
        return response.json();
    }

    async fetchMovieVideos() {
        const response = await fetch(
            `${config.baseUrl}/movie/${this.movieId}/videos?api_key=${config.apiKey}`
        );
        return response.json();
    }

    displayMovieDetails(movie, credits, videos) {
        if (!this.movieDetails) return;

        const trailer = videos.results.find(video => video.type === "Trailer") || videos.results[0];
        const director = credits.crew.find(person => person.job === "Director");
        const cast = credits.cast.slice(0, 5);

        this.movieDetails.innerHTML = `
            <div class="movie-details">
                <div class="movie-backdrop" style="background-image: url(${config.imageBaseUrl + movie.backdrop_path})"></div>
                <div class="movie-content">
                    <div class="movie-poster-container">
                        <img 
                            src="${movie.poster_path
                ? config.imageBaseUrl + movie.poster_path
                : "https://via.placeholder.com/300x450"}"
                            alt="${movie.title}"
                            class="movie-poster"
                        >
                        <button class="watchlist-btn" data-id="${movie.id}">
                            ${this.isInWatchlist(movie.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                        </button>
                    </div>
                    <div class="movie-info">
                        <h1>${movie.title}</h1>
                        <div class="movie-meta">
                            <span>${movie.release_date?.split("-")[0] || "N/A"}</span>
                            <span>${movie.runtime} min</span>
                            <span>${movie.vote_average.toFixed(1)}/10</span>
                        </div>
                        <p class="movie-overview">${movie.overview}</p>
                        <div class="movie-details-section">
                            <h3>Director</h3>
                            <p>${director ? director.name : "N/A"}</p>
                        </div>
                        <div class="movie-details-section">
                            <h3>Cast</h3>
                            <p>${cast.map(actor => actor.name).join(", ")}</p>
                        </div>
                        ${trailer ? `
                            <div class="movie-trailer">
                                <h3>Trailer</h3>
                                <iframe
                                    width="100%"
                                    height="315"
                                    src="https://www.youtube.com/embed/${trailer.key}"
                                    frameborder="0"
                                    allowfullscreen
                                ></iframe>
                            </div>
                        ` : ""}
                    </div>
                </div>
            </div>
        `;

        this.addWatchlistListener();
    }

    isInWatchlist(movieId) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        return watchlist.includes(movieId.toString());
    }

    addWatchlistListener() {
        const watchlistBtn = document.querySelector(".watchlist-btn");
        if (watchlistBtn) {
            watchlistBtn.addEventListener("click", () => {
                const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
                const index = watchlist.indexOf(this.movieId);

                if (index === -1) {
                    watchlist.push(this.movieId);
                    watchlistBtn.textContent = "Remove from Watchlist";
                } else {
                    watchlist.splice(index, 1);
                    watchlistBtn.textContent = "Add to Watchlist";
                }

                localStorage.setItem("watchlist", JSON.stringify(watchlist));
            });
        }
    }

    displayError(message) {
        if (this.movieDetails) {
            this.movieDetails.innerHTML = `
                <div class="error-message">
                    ${message}
                </div>
            `;
        }
    }
}

// Initialize movie details if on movie details page
if (document.getElementById("movieDetails")) {
    new MovieDetails();
}