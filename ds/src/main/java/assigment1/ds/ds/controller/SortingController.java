package assigment1.ds.ds.controller;

import assigment1.ds.ds.DTO.*;
import assigment1.ds.ds.service.ArrayService;
import assigment1.ds.ds.service.ComparingService;
import assigment1.ds.ds.service.SortService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sort")
@CrossOrigin(origins = "http://localhost:3000")
public class SortingController {

    private final ArrayService arrayService;
    private final SortService sortService;
    private final ComparingService comparingService;

    public SortingController(ArrayService arrayService, SortService sortService, ComparingService comparingService) {
        this.arrayService = arrayService;
        this.sortService = sortService;
        this.comparingService = comparingService;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(@RequestBody GenerateRequest request) {
        int[] arr = arrayService.generateArray(request.getSize(), request.getArrayType());
        return ResponseEntity.ok(new GenerateResponse(arr));
    }

    @PostMapping("/visualize")
    public ResponseEntity<VisualizeResponse> visualize(@RequestBody VisualizeRequest request) {
        SortingResultDTO result = sortService.sortWithVisualization(request.getArr(), request.getType());
        VisualizeResponse response = new VisualizeResponse(
            result.getFrames(),
            result.getElapsedNanos(),
            new VisualizeResponse.StatsDTO(result.getStats().getComparisons(), result.getStats().getSwaps())
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sort")
    public ResponseEntity<?> sort(@RequestBody VisualizeRequest request) {
        SortingResultDTO result = sortService.sortWithoutVisualization(request.getArr(), request.getType());
        return ResponseEntity.ok(Map.of(
            "sortedArray", result.getSortedArray(),
            "elapsedNanos", result.getElapsedNanos(),
            "stats", Map.of("comparisons", result.getStats().getComparisons(), "swaps",       result.getStats().getSwaps())
        ));
    }

    @PostMapping("/compare")
    public ResponseEntity<CompareResponse> compare(@RequestBody CompareRequest request) {
        String source = request.getArraySource() != null
            ? request.getArraySource()
            : arrayService.arraySourceLabel(request.getArrayType());

        ComparisonResultDTO result = comparingService.compareAllAlgorithms(
            request.getArr(),
            source,
            5,
            request.getWriteCSV()
        );

        return ResponseEntity.ok(new CompareResponse(result.getRows()));
    }
}