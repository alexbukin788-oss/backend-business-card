"""Check the approved initial HTTP addition without relying on public DNS."""
import hashlib
import pathlib
import urllib.request
import uuid

config = pathlib.Path('/srv/skazka/deployment/nginx.conf').read_text()
before, rest = config.split('# BEGIN backend-business-card domain\n', 1)
_, after = rest.split('# END backend-business-card domain\n', 1)
assert hashlib.sha256((before + after).encode()).hexdigest() == 'dd04de4697348a6dde004fa31beeb28fd57d203ee79d351f1e9f4ca794d6e707', 'Shared config changed outside our block; review concurrent edits'
name = 'business-card-probe-' + uuid.uuid4().hex
probe = pathlib.Path('/srv/skazka/deployment/acme-webroot/.well-known/acme-challenge') / name
probe.parent.mkdir(parents=True, exist_ok=True)
probe.write_text(name)
probe.chmod(0o644)
try:
    request = urllib.request.Request('http://127.0.0.1/.well-known/acme-challenge/' + name,
                                     headers={'Host': 'vse-vozmozhno.ru'})
    with urllib.request.urlopen(request, timeout=10) as response:
        assert response.status == 200
        assert response.read().decode() == name
finally:
    probe.unlink()
print('PASS: original nginx preserved; own HTTP-01 challenge served')
