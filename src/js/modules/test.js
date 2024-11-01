import { config } from "../config.js";

export class MovieList {
    constructor() {
        this.moviesGrid = document.getElementById("moviesGrid");
        this.searchInput = document.getElementById("searchInput");
        this.filterSelect = document.getElementById("filterSelect");
        this.loadMoreBtn = this.createLoadMoreButton();

        this.currentPage = 1;
        this.currentSearchTerm = "";
        this.currentFilter = "popular";
        this.isLoading = false;

        this.init();
    }

    init() {
        this.loadMovies();
        this.setupEventListeners();
    }

    createLoadMoreButton() {
        const button = document.createElement("button");
        button.className = "load-more-btn";
        button.textContent = "Load More";
        button.style.display = "none";
        this.moviesGrid.parentElement.appendChild(button);
        return button;
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener("input", this.debounce(() => {
                this.currentPage = 1;
                this.currentSearchTerm = this.searchInput.value;
                this.loadMovies(true);
            }, 500));
        }

        if (this.filterSelect) {
            this.filterSelect.addEventListener("change", () => {
                this.currentPage = 1;
                this.currentFilter = this.filterSelect.value;
                this.loadMovies(true);
            });
        }

        this.loadMoreBtn.addEventListener("click", () => {
            if (!this.isLoading) {
                this.currentPage++;
                this.loadMovies(false);
            }
        });
    }

    async loadMovies(clearExisting = true) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoader(clearExisting);

        try {
            const movies = await this.fetchMovies();
            this.displayMovies(movies, clearExisting);
        } catch (error) {
            console.error("Error loading movies:", error);
            this.displayError("Failed to load movies");
        } finally {
            this.hideLoader();
            this.isLoading = false;
        }
    }

    async fetchMovies() {
        let url;
        if (this.currentSearchTerm) {
            url = `${config.baseUrl}/search/movie?api_key=${config.apiKey}&query=${encodeURIComponent(this.currentSearchTerm)}&page=${this.currentPage}`;
        } else {
            url = `${config.baseUrl}/movie/${this.currentFilter}?api_key=${config.apiKey}&page=${this.currentPage}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Update load more button visibility
        this.loadMoreBtn.style.display = this.currentPage < data.total_pages ? "block" : "none";

        return data.results;
    }

    displayMovies(movies, clearExisting) {
        if (!this.moviesGrid) return;

        if (clearExisting) {
            this.moviesGrid.innerHTML = "";
        }

        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

        const movieElements = movies.map(movie => `
            <div class="movie-card" data-id="${movie.id}">
                <img 
                    src="${movie.poster_path
                ? config.imageBaseUrl + movie.poster_path
                : "https://via.placeholder.com/300x450"}"
                    alt="${movie.title}"
                    class="movie-poster"
                    loading="lazy"
                >
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.release_date?.split("-")[0] || "N/A"}</p>
                    <button class="watchlist-btn ${watchlist.includes(movie.id.toString()) ? "in-watchlist" : ""}" 
                            data-id="${movie.id}">
                        ${watchlist.includes(movie.id.toString()) ? "Remove from Watchlist" : "Add to Watchlist"}
                    </button>
                </div>
            </div>
        `).join("");

        if (clearExisting && movies.length === 0) {
            this.displayNoResults();
        } else {
            this.moviesGrid.insertAdjacentHTML("beforeend", movieElements);
            this.addMovieListeners();
        }
    }

    addMovieListeners() {
        const movieCards = document.querySelectorAll(".movie-card");
        const watchlistButtons = document.querySelectorAll(".watchlist-btn");

        movieCards.forEach(card => {
            card.addEventListener("click", (e) => {
                if (!e.target.classList.contains("watchlist-btn")) {
                    const movieId = card.dataset.id;
                    window.location.href = `pages/movieDetails.html?id=${movieId}`;
                }
            });
        });

        watchlistButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const movieId = btn.dataset.id;
                this.toggleWatchlist(btn, movieId);
            });
        });
    }

    toggleWatchlist(button, movieId) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const index = watchlist.indexOf(movieId.toString());

        if (index === -1) {
            watchlist.push(movieId.toString());
            button.textContent = "Remove from Watchlist";
            button.classList.add("in-watchlist");
        } else {
            watchlist.splice(index, 1);
            button.textContent = "Add to Watchlist";
            button.classList.remove("in-watchlist");
        }

        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }

    showLoader(clearExisting) {
        if (clearExisting) {
            this.moviesGrid.innerHTML = "";
        }
        const loader = document.createElement("div");
        loader.className = "loader";
        loader.innerHTML = "<div class=\"spinner\"></div>";
        this.moviesGrid.appendChild(loader);
    }

    hideLoader() {
        const loader = this.moviesGrid.querySelector(".loader");
        if (loader) {
            loader.remove();
        }
    }

    displayError(message) {
        this.moviesGrid.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    }

    displayNoResults() {
        this.moviesGrid.innerHTML = `
            <div class="no-results">
                <h2>No movies found</h2>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize MovieList if on the main page
if (document.getElementById("moviesGrid")) {
    new MovieList();
}