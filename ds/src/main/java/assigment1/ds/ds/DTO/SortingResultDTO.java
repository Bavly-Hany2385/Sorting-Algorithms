package assigment1.ds.ds.DTO;

import assigment1.ds.ds.sortingAlgorithms.SortStats;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class SortingResultDTO {
    private final String algorithmName;
    private final List<int[]> frames;
    private final int[] sortedArray;
    private final long finishTimeNs;
    private final SortStats stats;
}