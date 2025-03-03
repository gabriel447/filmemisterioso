<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();
$dotenv->required(['API_KEY', 'BASE_URL'])->notEmpty();

use GuzzleHttp\Client;

$client = new Client([
    'headers' => [
        'Authorization' => 'Bearer ' . $_SERVER['API_KEY'],
        'Content-Type' => 'application/json'
    ],
    'timeout' => 10.0,
    'verify' => true
]);

header('Content-Type: application/json');

$total = '';
$genre = '';

if(isset($_POST) && !empty($_POST)) {
    $genre = $_POST['genre'];
    $stream = $_POST['stream'];
}

try {
    $sortOptions = [
        'vote_average.desc',
        'vote_average.asc',       
        'popularity.desc',
        'popularity.asc',
        'release_date.desc',
        'release_date.asc'
    ];

    $queryParams = [
        'with_watch_providers' => $stream,
        'page' => 1,
        'language' => 'pt-BR',
        'watch_region' => 'BR',
        'region' => 'BR',
        'vote_average.gte' => 7,
    ];

    $queryParams['sort_by'] = $sortOptions[array_rand($sortOptions)];

    if($genre) {
        $queryParams['with_genres'] = $genre;
    }

    $response = $client->request('GET', $_SERVER['BASE_URL'] . '/discover/movie', [
        'query' => $queryParams
    ]);

    if($response->getStatusCode() === 200) {
        $responseData = json_decode($response->getBody()->getContents(), true);
        echo json_encode([
            'success' => true,
            'data' => $responseData
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro na requisição',
            'status_code' => $response->getStatusCode()
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => true,
        'message' => "Erro na requisição: " . $e->getMessage(),
        'code' => $e->getCode()
    ]);
}
?>