import { config } from "../config.js";
import { MovieList } from "./movieList.js";

export class Filter {
    constructor() {
        this.movieList = new MovieList();
        this.genreFilter = document.getElementById("genreFilter");
        this.sortBy = document.getElementById("sortBy");
    }

    async loadGenres() {
        try {
            const response = await fetch(
                `${config.baseUrl}/genre/movie/list?api_key=${config.apiKey}&language=en-US`
            );
            const data = await response.json();
            this.populateGenreFilter(data.genres);
        } catch (error) {
            console.error("Error loading genres:", error);
        }
    }

    populateGenreFilter(genres) {
        if (!this.genreFilter) return;

        const options = genres.map(genre =>
            `<option value="${genre.id}">${genre.name}</option>`
        );
        this.genreFilter.innerHTML += options.join("");
    }

    async applyFilters() {
        if (!this.genreFilter || !this.sortBy) return;

        const genreId = this.genreFilter.value;
        const sortBy = this.sortBy.value;

        try {
            let url = `${config.baseUrl}/discover/movie?api_key=${config.apiKey}&language=en-US&sort_by=${sortBy}&page=1`;

            if (genreId) {
                url += `&with_genres=${genreId}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            // this.movieList.clear = true;
            this.movieList.displayMovies(data.results, true);
        } catch (error) {
            console.error("Error applying filters:", error);
            this.movieList.displayError("Failed to filter movies");
        }
    }
}