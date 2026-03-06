package assigment1.ds.ds.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ComparisonResultDTO {
    private final int             arraySize;
    private final String          arraySource;
    private final List<AlgorithmComparisonRow> rows;
}