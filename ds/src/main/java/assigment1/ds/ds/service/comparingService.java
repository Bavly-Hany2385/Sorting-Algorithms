package assigment1.ds.ds.service;

import assigment1.ds.ds.sortingAlgorithms.visualization;
import assigment1.ds.ds.sortingAlgorithms.SortStats;
import assigment1.ds.ds.DTO.*;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ComparingService {
    private final ArrayService arrayService;
    private final SortService sortService;

    public ComparingService(ArrayService arrayService, SortService sortService) {
        this.arrayService = arrayService;
        this.sortService = sortService;
    }

    private static final int defaultRuns = 5;
    private final static String[] algorithm = {"Bubble Sort", "Heap Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Selection Sort"};

    public ComparisonResultDTO compareAllAlgorithms(int[] arr, String arraySource, int runs) {
        if (runs < 1) runs = defaultRuns;

        List<AlgorithmComparisonRow> rows = new ArrayList<>();

        for (int i = 1; i <= 6; i++) {
            visualization sorter = sortService.resolveAlgorithm(i);

            long   totalTime   = 0;
            long   minTime     = Long.MAX_VALUE;
            long   maxTime     = Long.MIN_VALUE;
            long   comparisons = 0;
            long   interchanges = 0;

            for (int run = 0; run < runs; run++) {
                SortStats stats = new SortStats();
                int[] copy = arr.clone();

                long start  = System.nanoTime();
                sorter.sort(copy, null, stats);  
                long finish = System.nanoTime() - start;

                totalTime   += finish;
                minTime      = Math.min(minTime, finish);
                maxTime      = Math.max(maxTime, finish);
                comparisons  = stats.getComparisons();
                interchanges = stats.getSwaps();
            }

            rows.add(new AlgorithmComparisonRow(algorithm[i - 1], arr.length, arraySource, runs, totalTime / runs, minTime, maxTime, comparisons, interchanges));
        }

        ComparisonResultDTO result = new ComparisonResultDTO(arr.length, arraySource, rows);
        writeResultsToCsv(result);
        return result;
    }

    public ComparisonResultDTO compareAllAlgorithms(int[] arr, int arrayType) {
        return compareAllAlgorithms(arr, arrayService.arraySourceLabel(arrayType), defaultRuns);
    }

    private void writeResultsToCsv(ComparisonResultDTO result) {
        String filename = "comparison_results_" + System.currentTimeMillis() + ".csv";

        try (FileWriter writer = new FileWriter(filename)) {
            writer.write("Algorithm Name,Array Size,Array Source,Number of Runs," + "Average Runtime (ns),Min Runtime (ns),Max Runtime (ns)," + "Comparisons,Interchanges\n");

            for (AlgorithmComparisonRow row : result.getRows()) {
                writer.write(String.format("%s,%d,%s,%d,%d,%d,%d,%d,%d\n",
                    row.getAlgorithmName(), row.getArraySize(), row.getArraySource(),
                    row.getNumberOfRuns(), row.getAverageRuntimeNanos(), row.getMinRuntimeNanos(),
                    row.getMaxRuntimeNanos(), row.getComparisons(), row.getInterchanges()
                ));
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to write comparison CSV: " + e.getMessage(), e);
        }
    }
}
