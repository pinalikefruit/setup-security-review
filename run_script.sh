#!/bin/bash

# Define the git repository URL
git_repo_url="https://github.com/Cyfrin/4-puppy-raffle-audit.git"



# Extract the repository name from the URL
repo_name=$(basename -s .git "$git_repo_url")

# Define some values 
export TITLE=$repo_name
export LOGO="https://github.com/Cyfrin/4-puppy-raffle-audit/raw/main/images/puppy-raffle.svg"
export PLATFORM="CodeHawks"
export TOTAL_PRIZE=20
export START_DATE="2024-03-24"
export END_DATE="2024-03-24"



# Define the directory name to clone the repoty into
repo_dir="../security-course/$repo_name"

#Clone the git repository

git clone $git_repo_url $repo_dir

#Check if the git clone command was succesfull 
if [ $? -ne 0 ]; then
    echo "Failed to clone the repository."
    exit 1
fi

#Copy notes 

mkdir $repo_dir/audit-data
cp ./.notes.md $repo_dir/audit-data
cp ./report.md $repo_dir/audit-data
cp ./finding-layout.md $repo_dir/audit-data
cp ./finding-layout.md $repo_dir/audit-data/findings.md

# Change directory to the repository
cd $repo_dir || exit




# Attempt to build the project with forge
forge build

# Check if forge build was successful
if [ $? -ne 0 ]; then
    echo "forge build failed, but continuing with cloc analysis..."
fi

cd ../../setup-security-review

# # Run cloc and save the output to a temporary file
cloc $repo_dir/src/ --by-file --csv --out=temp_results.csv

# # Call the Python script to process the results

python3 process_results.py

node add-page.js



