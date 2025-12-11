SET FORMAT=F8.0.
RECODE Comm_Q2_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q2_st1 .
EXECUTE .
RECODE Comm_Q3_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q3_st1 .
EXECUTE .
RECODE Comm_Q6_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q6_st1 .
EXECUTE .
RECODE Comm_Q7_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q7_st1 .
EXECUTE .
RECODE Comm_Q8_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q8_st1 .
EXECUTE .
RECODE Comm_Q11_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q11_st1 .
EXECUTE .
RECODE Comm_Q15_st1 (1=5) (2=4) (3=3) (4=2) (5=1) (ELSE=SYSMIS) INTO rComm_Q15_st1 .
EXECUTE .

COMPUTE supportscale = MEAN.9(Comm_Q1_st1,rComm_Q2_st1,rComm_Q3_st1,Comm_Q4_st1,Comm_Q5_st1,rComm_Q6_st1,rComm_Q7_st1,rComm_Q8_st1,Comm_Q9_st1) .
EXECUTE .
COMPUTE autonomyscale = MEAN.9(Comm_Q10_st1,rComm_Q11_st1,Comm_Q12_st1,Comm_Q13_st1,Comm_Q14_st1,rComm_Q15_st1,Comm_Q16_st1,Comm_Q17_st1,Comm_Q18_st1) .
EXECUTE .
COMPUTE totalcommun = MEAN.2(supportscale,autonomyscale) .
EXECUTE .
DELETE VARIABLES rComm_Q2_st1 rComm_Q3_st1 rComm_Q6_st1 rComm_Q7_st1 rComm_Q8_st1 rComm_Q11_st1 rComm_Q15_st1 .
EXECUTE .


