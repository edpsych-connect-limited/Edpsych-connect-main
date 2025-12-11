SET FORMAT=F8.0.
RECODE bel_Q3_t1 (1=3) (2=2) (3=1) (ELSE=SYSMIS) INTO rbel_Q3_t1 .
EXECUTE .
RECODE bel_Q5_t1 (1=3) (2=2) (3=1) (ELSE=SYSMIS) INTO rbel_Q5_t1 . 
EXECUTE .
RECODE bel_Q8_t1 (1=3) (2=2) (3=1) (ELSE=SYSMIS) INTO rbel_Q8_t1 . 
EXECUTE .
RECODE bel_Q9_t1 (1=3) (2=2) (3=1) (ELSE=SYSMIS) INTO rbel_Q9_t1 .
EXECUTE .
RECODE bel_Q10_t1 (1=3) (2=2) (3=1) (ELSE=SYSMIS) INTO rbel_Q10_t1 .
EXECUTE .


COMPUTE belongscale12 = SUM.12(bel_Q1_t1,bel_Q2_t1,rbel_Q3_t1,bel_Q4_t1,rbel_Q5_t1,bel_Q6_t1,bel_Q7_t1,rbel_Q8_t1,rbel_Q9_t1,rbel_Q10_t1,bel_Q11_t1,bel_Q12_t1) .
EXECUTE .
COMPUTE belongscale1 = ((belongscale12) / 12) .
EXECUTE .
DELETE VARIABLES rbel_Q3_t1 rbel_Q5_t1 rbel_Q8_t1 rbel_Q9_t1 rbel_Q10_t1


