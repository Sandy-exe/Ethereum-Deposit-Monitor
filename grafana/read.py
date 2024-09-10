import os

def list_directory(path='.'):
    for root, dirs, files in os.walk(path):
        level = root.replace(path, '').count(os.sep)
        indent = ' ' * 4 * level
        print(f'{indent}{os.path.basename(root)}/')
        sub_indent = ' ' * 4 * (level + 1)
        for d in dirs:
            print(f'{sub_indent}{d}/')
        for f in files:
            print(f'{sub_indent}{f}')

if __name__ == "__main__":
    current_directory = os.path.dirname(os.path.abspath(__file__))
    list_directory(current_directory)