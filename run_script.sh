#!/bin/bash

# Define the git repository URL
git_repo_url="https://github.com/Cyfrin/5-t-swap-audit"
commit_hash=""


# Extract the repository name from the URL
repo_name=$(basename -s .git "$git_repo_url")

# Define some values 
export TITLE=$repo_name
export LOGO="https://github.com/Cyfrin/5-t-swap-audit/raw/main/images/t-swap-youtube-dimensions.png"
export PLATFORM="CodeHawks"
export TOTAL_PRIZE=0
export START_DATE="2024-03-30"
export END_DATE="2024-04-04"



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

# If you want enter to specific commit hash

# git checkout $commit_hash
# git switch -c security_review



# Attempt to build the project with forge
make

# Check if forge build was successful
if [ $? -ne 0 ]; then
    echo "forge build failed, but continuing with cloc analysis..."
fi

# Run Coverage
forge coverage

# Run Aderyn 
aderyn .

slither . 

cd ../../setup-security-review

# # Run cloc and save the output to a temporary file

# Ask the user if scope.txt exists
read -p "Does scope.txt exist in the repository? (y/n) " answer

# Convert the answer to lowercase
answer=$(echo "$answer" | tr '[:upper:]' '[:lower:]')

# If the user answers 'y', proceed with the cloc analysis based on scope.txt
if [[ $answer == "y" ]]; then
    if [ -f "$repo_dir/scope.txt" ]; then
        # Initialize an empty string to hold the paths
        paths=""

        # Concatenate each line from scope.txt to the paths variable
        while IFS= read -r line; do
            paths="$paths $repo_dir/$line"
        done < "$repo_dir/scope.txt"

        # Run cloc on all the paths
        cloc $paths --by-file --csv --out=temp_results.csv
    else
        echo "scope.txt not found in the repository."
    fi
else
    # If the user answers 'n', run cloc on the src directory as before
    cloc $repo_dir/src/ --by-file --csv --out=temp_results.csv
fi

# Call the Python script to process the results

python3 process_results.py

node add-page.js



