"""Manage only the approved business-card block; preserve shared nginx content."""
import datetime
import pathlib
import subprocess
import sys

ROOT = pathlib.Path('/srv/backend-business-card')
CONFIG = pathlib.Path('/srv/skazka/deployment/nginx.conf')
BEGIN = '# BEGIN backend-business-card domain\n'
END = '# END backend-business-card domain\n'

def run(*args):
    subprocess.run(args, check=True)

mode = sys.argv[1]
assert mode in ('http', 'https')
original = CONFIG.read_text()
if BEGIN in original:
    before, rest = original.split(BEGIN, 1)
    _, after = rest.split(END, 1)
    base = before + after
else:
    assert 'vse-vozmozhno.ru' not in original, 'Unexpected existing domain config'
    base = original
if mode == 'http':
    fragment = '''server {
    listen 80;
    server_name vse-vozmozhno.ru;
    location ^~ /.well-known/acme-challenge/ {
        root /acme;
        try_files $uri =404;
    }
    location / { return 503; }
}
'''
else:
    fragment = (ROOT / 'deployment/nginx-domain.conf.draft').read_text(encoding='utf-8-sig')
    assert pathlib.Path('/srv/skazka/certificates/letsencrypt/business-card/privkey.pem').exists()
assert base.rstrip().endswith('}'), 'Unexpected config structure'
pos = base.rfind('}')
updated = base[:pos] + BEGIN + fragment + END + base[pos:]
if updated != original:
    backup = ROOT / 'deployment/backups'
    backup.mkdir(exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    (backup / (stamp + '.nginx.conf')).write_text(original)
    assert CONFIG.read_text() == original, 'Concurrent edit; abort'
    # Preserve bind-mounted inode.
    CONFIG.write_text(updated)
    try:
        run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-t')
        run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-s', 'reload')
    except Exception:
        if CONFIG.read_text() == updated:
            CONFIG.write_text(original)
            run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-t')
            run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-s', 'reload')
        raise
print('Domain configuration:', mode)
