package assigment1.ds.ds.sortingAlgorithms;

import lombok.Getter;

@Getter
public class SortStats {
    private long comparisons = 0;
    private long swaps = 0;

    public void incrementComparisons() { comparisons++; }
    public void incrementSwaps()       { swaps++; }
}