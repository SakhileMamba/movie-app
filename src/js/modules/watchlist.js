import { config } from "../config.js";

export class Watchlist {
    constructor() {
        this.watchlistGrid = document.getElementById("watchlistGrid");
        if (this.watchlistGrid) {
            this.loadWatchlist();
        }
    }

    async loadWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

        if (watchlist.length === 0) {
            this.displayEmptyState();
            return;
        }

        try {
            const movies = await Promise.all(
                watchlist.map(movieId => this.fetchMovieDetails(movieId))
            );
            this.displayWatchlist(movies.filter(movie => movie !== null));
        } catch (error) {
            console.error("Error loading watchlist:", error);
            this.displayError("Failed to load watchlist");
        }
    }

    async fetchMovieDetails(movieId) {
        try {
            const response = await fetch(
                `${config.baseUrl}/movie/${movieId}?api_key=${config.apiKey}&language=en-US`
            );
            return await response.json();
        } catch (error) {
            console.error(`Error fetching movie ${movieId}:`, error);
            return null;
        }
    }

    displayWatchlist(movies) {
        if (!this.watchlistGrid) return;

        this.watchlistGrid.innerHTML = movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <img 
                    src="${movie.poster_path
                ? config.imageBaseUrl + movie.poster_path
                : "https://via.placeholder.com/300x450"}"
                    alt="${movie.title}"
                    class="movie-poster"
                >
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.release_date?.split("-")[0] || "N/A"}</p>
                    <button class="remove-watchlist-btn" data-id="${movie.id}">
                        Remove from Watchlist
                    </button>
                </div>
            </div>
        `).join("");

        this.addWatchlistListeners();
    }

    addWatchlistListeners() {
        const movieCards = document.querySelectorAll(".movie-card");
        const removeButtons = document.querySelectorAll(".remove-watchlist-btn");

        movieCards.forEach(card => {
            card.addEventListener("click", (e) => {
                if (!e.target.classList.contains("remove-watchlist-btn")) {
                    const movieId = card.dataset.id;
                    window.location.href = `movieDetails.html?id=${movieId}`;
                }
            });
        });

        removeButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const movieId = btn.dataset.id;
                this.removeFromWatchlist(movieId);
            });
        });
    }

    removeFromWatchlist(movieId) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const index = watchlist.indexOf(movieId.toString());

        if (index !== -1) {
            watchlist.splice(index, 1);
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
            this.loadWatchlist();
        }
    }

    displayEmptyState() {
        if (this.watchlistGrid) {
            this.watchlistGrid.innerHTML = `
                <div class="empty-watchlist">
                    <h2>Your watchlist is empty</h2>
                    <p>Start adding movies from the home page!</p>
                    <a href="../index.html" class="btn">Browse Movies</a>
                </div>
            `;
        }
    }

    displayError(message) {
        if (this.watchlistGrid) {
            this.watchlistGrid.innerHTML = `
                <div class="error-message">
                    ${message}
                </div>
            `;
        }
    }
}

// Initialize watchlist if on watchlist page
if (document.getElementById("watchlistGrid")) {
    new Watchlist();
}