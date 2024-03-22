#!/bin/bash

# Run cloc and save the output to a temporary file
cloc ../security-course/3-passwordstore-audit/src/ --by-file --csv --out=temp_results.csv

# Call the Python script to process the results

python3 process_results.py
