#!C:\Users\amirz\Desktop\00. Git Stuff\13. UI RepoFinder\env\Scripts\python.exe
import os
import sys

from git_cli.gkm import GitCLIClient


def _parse_argv():
    if sys.argv[1] == '-i':
        return sys.argv[2], sys.argv[3:]
    return None, sys.argv[1:]


def _print_help():
    pass


if __name__ == '__main__':
    try:
        ssh_key_path, git_argv = _parse_argv()
    except IndexError:
        _print_help()
        exit(2)

    ssh_key_path = ssh_key_path or os.environ.get('GIT_SSH_KEY')

    git = GitCLIClient(_ssh_key_path=ssh_key_path)
    git.command(*git_argv)
