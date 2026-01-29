$(document).ready(function () {
    $('#myForm').on('submit', function (event) {
        event.preventDefault();

        const $btn = $(this).find('button[type="submit"]');
        const originalText = $btn.html();

        // Show spinner and disable button
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sorteando...');

        const formData = {
            stream: $('input[name="stream"]:checked').val(),
            genre: $('input[name="genre"]:checked').val()
        };

        getPageMovie(formData)
            .done(function(movieResult) {
                if (!movieResult || !movieResult.success) {
                    console.error('Erro na API:', movieResult);
                    alert('Ocorreu um erro: ' + (movieResult && movieResult.message ? movieResult.message : 'Erro desconhecido. Verifique o console.'));
                    return;
                }

                const pageMovies = movieResult.data.results;
                if (!pageMovies || pageMovies.length === 0) {
                    alert('Nenhum filme encontrado.');
                    return;
                }
                const randomMovie = pageMovies[Math.floor(Math.random() * pageMovies.length)];

                displayMovieDetails(randomMovie);
            })
            .fail(function(xhr, status, error) {
                console.error('Erro na requisição:', error);
                alert('Erro ao buscar filmes. Tente novamente.');
            })
            .always(function() {
                // Restore button state
                $btn.prop('disabled', false).html(originalText);
            });
    });

    function getPageMovie(formData) {
        const dev = 'jomsvikings.php';
        return $.ajax({
            url: dev,
            type: 'POST',
            data: formData,
            dataType: 'json'
        });
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

        $('#movieRating').text(movie.vote_average.toFixed(1).replace('.', ','));

        $('#movieGenres').empty();
        movie.genre_ids.forEach(id => {
            const genreTag = $('<span>')
                .addClass('badge genre-tag')
                .text(getGenreName(id));
            $('#movieGenres').append(genreTag);
        });

        const modal = new bootstrap.Modal(document.getElementById('movieModal'));
        modal.show();

        // Refresh page on modal close to prevent cache issues
        document.getElementById('movieModal').addEventListener('hidden.bs.modal', function () {
            location.reload();
        });
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