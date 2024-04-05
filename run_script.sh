#!/bin/bash

# Define the git repository URL
git_repo_url="https://github.com/code-423n4/2024-04-panoptic.git"
# commit_hash=""


# Extract the repository name from the URL
repo_name=$(basename -s .git "$git_repo_url")
repo_name_without_date="${repo_name##*-}"
# Define some values 
export TITLE=$repo_name_without_date
export LOGO="https://code4rena.com/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fcdn-c4-uploads-v0%2Fuploads%2FXcKzZ6eSLH9.0&w=256&q=75"

export TOTAL_PRIZE=60800
export START_DATE="2024-03-15"
export END_DATE="2024-04-05"
export PLATFORM="Code4rena"

# Code4rena Sherlock CodeHawks Immunifi 


# Define the directory name to clone the repoty into
repo_dir="../security-course/$repo_name"

#Clone the git repository

git clone $git_repo_url $repo_dir

#Check if the git clone command was succesfull 
if [ $? -ne 0 ]; then
    echo "Failed to clone the repository."
    exit 1
fi



if [ "$PLATFORM" == "Sherlock" ]; then
    # Find the non-hidden directory
    non_hidden_dir=$(find $repo_dir -maxdepth 1 -type d ! -name ".*" ! -name "$(basename $repo_dir)" -exec basename {} \;)
    # Update repo_dir to include the non-hidden directory
    if [ ! -z "$non_hidden_dir" ]; then
        repo_dir="$repo_dir/$non_hidden_dir"
    else
        echo "No non-hidden directory found. Continuing with the original repo_dir."
    fi
fi

#Copy notes

mkdir $repo_dir/audit-data
cp ./.notes.md $repo_dir/audit-data
# cp ./report.md $repo_dir/audit-data
cp ./finding-layout.md $repo_dir/audit-data
cp ./finding-layout.md $repo_dir/audit-data/findings.md
cp ./slither.config.json $repo_dir

# Change directory to the repository
cd $repo_dir || exit

# If you want enter to specific commit hash

# git checkout $commit_hash
# git switch -c security_review



# Attempt to build the project with forge
# forge build

# # Check if forge build was successful
if [ $? -ne 0 ]; then
    echo "forge build failed, but continuing with cloc analysis..."
fi

code .
# Run Coverage
# forge coverage

# # Run Aderyn 
# aderyn .

# slither . --config-file slither.config.json 

if [ "$PLATFORM" == "Sherlock" ]; then
    cd ../../../setup-security-review
else
    cd ../../setup-security-review
fi

# # Run cloc and save the output to a temporary file
# Check if scope.txt exists
if [ -f "$repo_dir/scope.txt" ]; then
    echo "scope.txt found, proceeding with cloc analysis."

    # Initialize an empty string to hold the paths
    paths=""

    # Concatenate each line from scope.txt to the paths variable
    while IFS= read -r line; do
        paths="$paths $repo_dir/$line"
    done < "$repo_dir/scope.txt"

    # Run cloc on all the paths
    cloc $paths --by-file --csv --out=temp_results.csv
else
    echo "scope.txt not found, generating a new scope file."

    if [ "$PLATFORM" == "Sherlock" ]; then
        tree $repo_dir/contracts/ | sed 's/└/#/g; s/──/--/g; s/├/#/g; s/│ /|/g; s/│/|/g' > $repo_dir/scope.txt
    else
        tree $repo_dir/src/ | sed 's/└/#/g; s/──/--/g; s/├/#/g; s/│ /|/g; s/│/|/g' > $repo_dir/scope.txt
    fi
    # Generate scope.txt
    

    # Display the generated scope.txt and ask for confirmation
    echo "scope.txt has been generated with the following content:"
    cat $repo_dir/scope.txt
    read -p "Proceed with the cloc analysis based on this scope? (y/n) " confirm

    # Convert the confirm answer to lowercase
    confirm=$(echo "$confirm" | tr '[:upper:]' '[:lower:]')

    # If the user confirms, run cloc analysis
    if [[ $confirm == "y" ]]; then
        paths=""
        while IFS= read -r line; do
            paths="$paths $repo_dir/$line"
        done < "$repo_dir/scope.txt"
        cloc $paths --by-file --csv --out=temp_results.csv
    else
        echo "cloc analysis canceled."
    fi
fi

# Call the Python script to process the results

python3 process_results.py

node add-page.js



