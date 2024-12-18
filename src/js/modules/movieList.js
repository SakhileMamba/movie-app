import { config } from "../config.js";

export class MovieList {
    constructor() {
        this.moviesGrid = document.getElementById("moviesGrid");
        this.btnExists = false;
        this.clear = true;
        this.currentPage = 1;
        this.currentSearchTerm = "";
        this.currentFilter = "popular";
        this.isLoading = false;
        this.genreId = "";
        this.sortBy = "";
    }

    async createLoadMoreButton() {
        const button = document.createElement("button");
        button.className = "load-more-btn";
        button.id = "load-more-btn"
        button.textContent = "Load More";
        return button;
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

    async loadMovies(clearExisting = this.clear) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoader(clearExisting);

        try {
            const movies = await this.fetchMovies();
            await this.displayMovies(movies, clearExisting);

            if (!this.btnExists) {
                this.btnExists = true;
                let loadMoreBtn = await this.createLoadMoreButton();
                this.moviesGrid.parentElement.appendChild(loadMoreBtn);
                document.getElementById("load-more-btn").addEventListener("click", () => {
                    if (!this.isLoading) {
                        this.currentPage++;
                        this.loadMovies(false);
                    }
                })
            }

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
        console.log("fetch from load()" + this.currentSearchTerm)
        if (this.currentSearchTerm) {
            url = `${config.baseUrl}/search/movie?api_key=${config.apiKey}&query=${encodeURIComponent(this.currentSearchTerm)}&page=${this.currentPage}`;
        } else if (this.sortBy) {
            url = `${config.baseUrl}/discover/movie?api_key=${config.apiKey}&language=en-US&sort_by=${this.sortBy}&page=1`;

            if (this.genreId) {
                url += `&with_genres=${this.genreId}`;
            }
        }

        else {
            url = `${config.baseUrl}/movie/${this.currentFilter}?api_key=${config.apiKey}&page=${this.currentPage}`;
        }

        const response = await fetch(url);
        const data = await response.json();
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
                    <!-- <button class="watchlist-btn ${watchlist.includes(movie.id.toString()) ? "in-watchlist" : ""}" 
                            data-id="${movie.id}">
                        ${watchlist.includes(movie.id.toString()) ? "Remove from Watchlist" : "Add to Watchlist"}
                    </button>  -->
                    <button class="watchlist-btn" data-id="${movie.id}">
                        ${this.isInWatchlist(movie.id) ? "❤️" : "🖤"}
                    </button>
                </div>
            </div>
        `).join("");

        if (clearExisting && movies.length === 0) {
            this.displayNoResults();
        } else {
            this.moviesGrid.insertAdjacentHTML("beforeend", movieElements);
            this.addMovieCardListeners();
        }
    }


    addMovieCardListeners() {
        const movieCards = document.querySelectorAll(".movie-card");
        const watchlistBtns = document.querySelectorAll(".watchlist-btn");

        movieCards.forEach(card => {
            card.addEventListener("click", (e) => {
                if (!e.target.classList.contains("watchlist-btn")) {
                    const movieId = card.dataset.id;
                    window.location.href = `/pages/movieDetails.html?id=${movieId}`;
                }
            });
        });

        watchlistBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const movieId = btn.dataset.id;
                this.toggleWatchlist(movieId, btn);
            });
        });
    }

    isInWatchlist(movieId) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        return watchlist.includes(movieId.toString());
    }

    toggleWatchlist(movieId, button) {
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const index = watchlist.indexOf(movieId.toString());

        if (index === -1) {
            watchlist.push(movieId.toString());
            button.textContent = "❤️";
        } else {
            watchlist.splice(index, 1);
            button.textContent = "🖤";
        }

        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }

    displayError(message) {
        if (this.moviesGrid) {
            this.moviesGrid.innerHTML = `
                <div class="error-message">
                    ${message}
                </div>
            `;
        }
    }
}