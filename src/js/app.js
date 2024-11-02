import { MovieList } from "./modules/movieList.js";
import { Search } from "./modules/search.js";
import { Filter } from "./modules/filter.js";
import { Watchlist } from "./modules/watchlist.js";

class App {
    constructor() {
        this.movieList = new MovieList();
        this.search = new Search(this.movieList);
        this.filter = new Filter(this.movieList);
        this.watchlist = new Watchlist();
        this.init();
    }

    init() {
        // Initialize search listeners
        const searchInput = document.getElementById("searchInput");
        searchInput?.addEventListener("input", (e) => {
            if (e.target.value) {
                console.log(e.target.value)
                this.search.searchMovies(e.target.value);
            } else {
                //this.movieList.loadPopularMovies();
                this.movieList.loadMovies();
            }
        });

        // Initialize filter listeners
        const genreFilter = document.getElementById("genreFilter");
        const sortBy = document.getElementById("sortBy");

        genreFilter?.addEventListener("change", () => {
            this.filter.applyFilters();
        });

        sortBy?.addEventListener("change", () => {
            this.filter.applyFilters();
        });

        // Load initial movies
        //this.movieList.loadPopularMovies();
        this.movieList.loadMovies();
        // Load genres for filter
        this.filter.loadGenres();
    }
}

// Initialize the app
new App();