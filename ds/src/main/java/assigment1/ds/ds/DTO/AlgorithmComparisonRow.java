package assigment1.ds.ds.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AlgorithmComparisonRow {
    private final String algorithmName;
    private final int    arraySize;
    private final String arraySource;
    private final int    numberOfRuns;
    private final long   averageRuntimeNanos;
    private final long   minRuntimeNanos;
    private final long   maxRuntimeNanos;
    private final long   comparisons;
    private final long   interchanges;
}