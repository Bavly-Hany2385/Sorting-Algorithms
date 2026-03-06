package assigment1.ds.ds.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CompareRequest {
    private int[]  arr;
    private Integer arrayType;    
    private String  arraySource;  
}