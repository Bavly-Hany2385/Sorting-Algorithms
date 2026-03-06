package assigment1.ds.ds.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class CompareResponse {
    private final List<AlgorithmComparisonRow> rows;
}