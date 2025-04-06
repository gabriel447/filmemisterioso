<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();
$dotenv->required(['API_KEY', 'BASE_URL'])->notEmpty();

use GuzzleHttp\Client;

$client = new Client([
    'headers' => [
        'Authorization' => 'Bearer ' . $_ENV['API_KEY'],
        'Content-Type' => 'application/json'
    ],
    'timeout' => 10.0,
    'verify' => true
]);

header('Content-Type: application/json');

$total = '';
$genre = '';
$without = '';

if(isset($_POST) && !empty($_POST)) {
    $genre = filter_var($_POST['genre'], FILTER_VALIDATE_INT);
    $stream = filter_var($_POST['stream'], FILTER_VALIDATE_INT);
}

try {
    $withoutKeywords = ['9715', '210024'];
    $initialQueryParams = [
        'with_original_language' => 'en',
        'language' => 'pt-BR',
        'watch_region' => 'BR',
        'region' => 'BR',
        'with_watch_providers' => $stream,
        'with_genres' => $genre,
        'vote_average.gte' => 7.5,
        'vote_average.lte' => 9.9,
        'vote_count.gte' => 100,
        'with_runtime.gte' => 60,
        'sort_by' => 'vote_average.desc',
        'without_keywords' => implode(',', $withoutKeywords)
    ];

    if ($genre != '16') {
        $initialQueryParams['without_genres'] = '16';
    }

    $initialResponse = $client->request('GET', $_ENV['BASE_URL'] . '/discover/movie', [
        'query' => $initialQueryParams
    ]);

    if($initialResponse->getStatusCode() === 200) {
        $responseData = json_decode($initialResponse->getBody()->getContents(), true);
        $totalPages = $responseData['total_pages'];
        $randomPage = random_int(1, $totalPages);
        
        $finalQueryParams = array_merge($initialQueryParams, ['page' => $randomPage]);
        
        $finalResponse = $client->request('GET', $_ENV['BASE_URL'] . '/discover/movie', [
            'query' => $finalQueryParams
        ]);

        if($finalResponse->getStatusCode() === 200) {
            echo json_encode([
                'success' => true,
                'data' => json_decode($finalResponse->getBody()->getContents(), true),
                'total_pages' => $totalPages,
                'current_page' => $randomPage
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro na requisição final',
                'status_code' => $finalResponse->getStatusCode()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro na requisição inicial',
            'status_code' => $initialResponse->getStatusCode()
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