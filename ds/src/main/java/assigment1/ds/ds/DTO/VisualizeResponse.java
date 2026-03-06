package assigment1.ds.ds.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class VisualizeResponse {
    private final List<int[]> frames;
    private final long        finishTimeNs;   
    private final StatsDTO    stats;          

    @Getter
    @AllArgsConstructor
    public static class StatsDTO {
        private final long comparisons;
        private final long swaps;
    }
}