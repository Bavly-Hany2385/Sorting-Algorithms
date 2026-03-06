package assigment1.ds.ds.controller;

import assigment1.ds.ds.DTO.*;
import assigment1.ds.ds.service.comparingService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sort")
@CrossOrigin(origins = "http://localhost:5173")
public class SortingController {

    private final comparingService comparingService;

    public SortingController(comparingService comparingService) {
        this.comparingService = comparingService;
    }

    @PostMapping("/visualize")
    public ResponseEntity<?> visualize(@RequestBody VisualizeRequest request) {
        try {
            SortingResultDTO result = comparingService.sortWithVisualization(request.getArr(), request.getType());

            VisualizeResponse response = new VisualizeResponse(
                result.getFrames(), result.getFinishTimeNs(),
                new VisualizeResponse.StatsDTO(
                    result.getStats().getComparisons(),
                    result.getStats().getSwaps()
                )
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/sort")
    public ResponseEntity<?> sortOnly(@RequestBody VisualizeRequest request) {
        try {
            SortingResultDTO result = comparingService.sortWithoutVisualization(request.getArr(), request.getType());
            return ResponseEntity.ok(Map.of(
                "elapsedNanos", result.getFinishTimeNs(),
                "sortedArray",  result.getSortedArray(),
                "stats", Map.of(
                    "comparisons", result.getStats().getComparisons(),
                    "swaps",       result.getStats().getSwaps()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compare(@RequestBody CompareRequest request) {
        try {
            String source = request.getArraySource() != null
            ? request.getArraySource()
            : comparingService.arraySourceLabel(request.getArrayType());

            ComparisonResultDTO result = comparingService.compareAllAlgorithms(request.getArr(), source, 5);

            CompareResponse response = new CompareResponse(result.getRows());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody GenerateRequest request) {
        try {
            int[] arr = comparingService.generateArray(
                request.getSize(),
                request.getArrayType()
            );
            return ResponseEntity.ok(new GenerateResponse(arr));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}