import os
from subprocess import Popen, PIPE


class GitCLIClient:
    def __init__(self, _ssh_key_path=None, _path=os.curdir):
        self._working_path = _path
        # if _ssh_key_path is None, use default key (usually it's ~/.ssh/id_rsa) without the ssh-agent
        self._ssh_key_path = _ssh_key_path
        self._current_path = os.curdir

    def __enter__(self):
        os.chdir(self._working_path)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        os.chdir(self._current_path)

    def clone(self, origin_url):
        c = self._build_command('clone', origin_url)
        p = Popen(c, shell=True, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()
        out = out.decode('utf-8')
        err = err.decode('utf-8')
        success = not (err.startswith('fatal:') or err.startswith('error:') or err.startswith('git:'))
        return {
            'command': 'clone',
            'result_raw': (out, err),
            'success': success,
            'result': None
        }

    def branch(self, *args):
        c = self._build_command('branch', *args)
        p = Popen(c, shell=True, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()
        out = out.decode('utf-8')
        err = err.decode('utf-8')
        success = not (err.startswith('fatal:') or err.startswith('error:') or err.startswith('git:'))
        current_branch = None
        result = None
        if success:
            split_list = out.split('\n  ')
            for b in split_list:
                if b.startswith('* '):
                    current_branch = b.split(' ')[1]
                    break
            result = [current_branch, ]
            for b in split_list:
                if "* %s" % current_branch == b:
                    continue
                result.append(b if b[-1] != '\n' else b[:-1])
        return {
            'command': 'branch',
            'result_raw': (out, err),
            'success': success,
            'result': result
        }

    def push(self, origin_url, branch):
        c = self._build_command('push', origin_url, branch)
        p = Popen(c, shell=True, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()
        out = out.decode('utf-8')
        err = err.decode('utf-8')
        success = not (err.startswith('fatal:') or err.startswith('error:') or err.startswith('git:'))
        return {
            'command': 'push',
            'result_raw': (out, err),
            'success': success,
            'result': None
        }

    def command(self, *args):
        c = self._build_command(*args)
        os.system(c)

    def _build_command(self, *args):
        c = 'git %s' % ' '.join(args)
        return c if self._ssh_key_path is None else self._wrap_ssh_agent(c)

    def _wrap_ssh_agent(self, command):
        ssh_agent_wrap_string = "ssh-agent sh -c 'ssh-add %s; %s'" % (self._ssh_key_path, command)
        return ssh_agent_wrap_string
