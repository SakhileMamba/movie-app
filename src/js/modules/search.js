import { config } from "../config.js";
import { MovieList } from "./movieList.js";

export class Search {
    constructor() {
        this.movieList = new MovieList();
        this.searchTimeout = null;
    }

    async searchMovies(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Add debouncing to prevent too many API calls
        this.searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${config.baseUrl}/search/movie?api_key=${config.apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
                );
                const data = await response.json();
                this.movieList.displayMovies(data.results);
            } catch (error) {
                console.error("Error searching movies:", error);
                this.movieList.displayError("Failed to search movies");
            }
        }, 500);
    }
}