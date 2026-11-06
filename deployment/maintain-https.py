"""Issue/renew only this domain, then activate the approved nginx block."""
import fcntl
import json
import os
import pathlib
import shutil
import socket
import subprocess
import time

ROOT = pathlib.Path('/srv/backend-business-card')
STATE = ROOT / 'certificates'
STATE.mkdir(mode=0o700, exist_ok=True)
lock = (STATE / 'maintenance.lock').open('w')
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
status_file = STATE / 'status.json'

def status(value):
    status_file.write_text(json.dumps({'status': value, 'checkedAt': time.time()}))
    print(value, flush=True)

def run(*args):
    subprocess.run(args, check=True, timeout=240)

try:
    addresses = set(socket.gethostbyname_ex('vse-vozmozhno.ru')[2])
except socket.gaierror:
    status('WAITING_DNS')
    raise SystemExit(0)
if addresses != {'87.228.82.137'}:
    status('WAITING_EXPECTED_IP')
    raise SystemExit(0)

source = STATE / 'config/live/vse-vozmozhno.ru'
attempt = STATE / 'last-acme-attempt'
# Bound retries after a CA failure; ordinary renewals checked twice daily.
delay = 43200 if (source / 'fullchain.pem').exists() else 21600
due = not attempt.exists() or time.time() - attempt.stat().st_mtime > delay
if due:
    for folder in ('config', 'work', 'logs'):
        (STATE / folder).mkdir(mode=0o700, exist_ok=True)
    attempt.touch()
    status('REQUESTING_CERTIFICATE')
    try:
        run('docker', 'run', '--rm', '--name', 'backend-business-card-certbot',
            '--memory', '256m', '--cpus', '0.5',
            '-v', str(STATE / 'config') + ':/etc/letsencrypt',
            '-v', str(STATE / 'work') + ':/var/lib/letsencrypt',
            '-v', str(STATE / 'logs') + ':/var/log/letsencrypt',
            '-v', '/srv/skazka/deployment/acme-webroot:/acme',
            'certbot/certbot@sha256:bc93cb710b413e6b456d622f9b0133b3e109c0a78c2ed9976af43d209b0a1805',
            'certonly', '--webroot', '-w', '/acme',
            '--non-interactive', '--agree-tos', '--register-unsafely-without-email',
            '--keep-until-expiring', '--cert-name', 'vse-vozmozhno.ru',
            '-d', 'vse-vozmozhno.ru')
    except Exception:
        status('ACME_FAILED_RETRY_IN_6_HOURS')
        raise
if not (source / 'fullchain.pem').exists():
    status('WAITING_ACME_RETRY')
    raise SystemExit(0)

run('openssl', 'x509', '-in', str(source / 'fullchain.pem'),
    '-noout', '-checkhost', 'vse-vozmozhno.ru', '-checkend', '86400')
target = pathlib.Path('/srv/skazka/certificates/letsencrypt/business-card')
target.mkdir(mode=0o700, exist_ok=True)
changed = False
previous = {}
for name in ('fullchain.pem', 'privkey.pem'):
    dst = target / name
    previous[name] = dst.read_bytes() if dst.exists() else None
    data = (source / name).read_bytes()
    if previous[name] != data:
        tmp = target / (name + '.new')
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, 'wb') as handle:
            handle.write(data)
        os.replace(tmp, dst)
        changed = True
try:
    run('python3', str(ROOT / 'deployment/activate-domain.py'), 'https')
    if changed:
        run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-t')
        run('docker', 'exec', 'skazka-recovery-https-1', 'nginx', '-s', 'reload')
except Exception:
    for name, data in previous.items():
        if data is not None:
            (target / name).write_bytes(data)
    status('ACTIVATION_FAILED')
    raise
status('HTTPS_CONFIGURED')
