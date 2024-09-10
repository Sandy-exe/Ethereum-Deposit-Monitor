import os

EXCLUDED_FOLDERS = ['node_modules', 'dist']
EXCLUDED_FILES = ['.gitignore']

def print_directory_structure_and_content(root_folder, indent_level=0):
    # Iterate over all items in the directory
    for root, dirs, files in os.walk(root_folder):
        # Filter out the excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_FOLDERS]

        # Calculate the indentation based on the folder depth
        indent = '    ' * indent_level
        folder_name = os.path.basename(root)
        
        # Print the current folder name
        print(f"{indent}{folder_name}/")
        
        # Iterate over files and exclude specific ones
        for file in files:
            if file not in EXCLUDED_FILES:
                file_path = os.path.join(root, file)
                print(f"{indent}    {file}")

                # Read and print the content of each file
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                        file_content = file_content.strip()  # Avoid trailing newlines
                        print(f"{indent}    Content:")
                        print(f"{indent}    {'-' * 40}")
                        for line in file_content.splitlines():
                            print(f"{indent}    {line}")
                        print(f"{indent}    {'-' * 40}")
                except Exception as e:
                    print(f"{indent}    [Error reading file: {e}]")

        # Recursively print subdirectories (if any)
        for sub_dir in dirs:
            print_directory_structure_and_content(os.path.join(root, sub_dir), indent_level + 1)
        break  # Ensures we only go one level deep before recursion

# Get the current directory where the script is located
current_folder = os.path.dirname(os.path.abspath(__file__))

# Start printing the directory structure and file content from the current folder
print_directory_structure_and_content(current_folder)
