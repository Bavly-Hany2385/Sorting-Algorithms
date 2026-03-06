package assigment1.ds.ds.sortingAlgorithms;

import java.util.ArrayList;
import java.util.List;

public interface visualization {
    default List<int[]> sortWithFrames(int[] arr, SortStats stats) {
        List<int[]> frames = new ArrayList<>();
        frames.add(arr.clone()); 
        sort(arr, frames, stats);
        return frames;
    }

    void sort(int[] arr, List<int[]> frames, SortStats stats);
}