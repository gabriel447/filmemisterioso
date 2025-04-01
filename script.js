$(document).ready(function () {
    $('#myForm').on('submit', function (event) {
        event.preventDefault();

        const formData = {
            stream: $('input[name="stream"]:checked').val(),
            genre: $('input[name="genre"]:checked').val()
        };

        const movieResult = getPageMovie(formData);
        const pageMovies = movieResult.data.results;
        const randomMovie = pageMovies[Math.floor(Math.random() * pageMovies.length)];

        displayMovieDetails(randomMovie);
    });

    function getPageMovie(formData) {
        const dev = 'jomsvikings.php';
        return $.ajax({
            url: dev,
            type: 'POST',
            data: formData,
            async: false,
            success: function(response) {
                return response;
            },
            error: function(xhr, status, error) {
                console.error('Erro na requisição:', error);
                return null;
            }
        }).responseJSON;
    }

    function displayMovieDetails(movie) {
        $('#movieOriginalTitle').text('Título Original - ' + movie.original_title);
        $('#movieTitle').text(movie.title);
        $('#movieReleaseDate').text(new Date(movie.release_date).getFullYear());

        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : 'src/poster-fallback.jpg';
        $('#moviePoster').attr('src', posterUrl);

        $('#movieOverview').text(movie.overview);

        $('#movieRating').text(movie.vote_average.toFixed(1));

        $('#movieGenres').empty();
        movie.genre_ids.forEach(id => {
            const genreTag = $('<span>')
                .addClass('badge genre-tag')
                .text(getGenreName(id));
            $('#movieGenres').append(genreTag);
        });

        const modal = new bootstrap.Modal(document.getElementById('movieModal'));
        modal.show();
    }

    function getGenreName(id) {
        const genres = {
            28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia',
            80: 'Crime', 99: 'Documentário', 18: 'Drama', 10751: 'Família',
            14: 'Fantasia', 36: 'História', 27: 'Terror', 10402: 'Musical',
            9648: 'Suspense', 10749: 'Romance', 878: 'Ficção Científica',
            10770: 'Cinema TV', 53: 'Thriller', 10752: 'Guerra', 37: 'Faroeste'
        };
        return genres[id] || '';
    }
});